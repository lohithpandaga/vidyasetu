import os
import json
import jwt
import bcrypt
import secrets
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional, Dict

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
LLM_KEY = os.environ['EMERGENT_LLM_KEY']

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Vidhyasetu API")
api_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list({FRONTEND_URL, "http://localhost:3000"}),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vidhyasetu")

# ---------- helpers ----------

def now_utc():
    return datetime.now(timezone.utc)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": now_utc() + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": now_utc() + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def clean_doc(doc: dict) -> dict:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    for k, v in list(doc.items()):
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc

# ---------- models ----------

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=6, max_length=72)
    exam: Optional[str] = "JEE"

class LoginIn(BaseModel):
    email: str
    password: str

class SubmitIn(BaseModel):
    answers: Dict[str, int]
    time_taken: int = 0

class DoubtIn(BaseModel):
    question: str = Field(min_length=3, max_length=2000)

# ---------- auth ----------

@api_router.post("/auth/register")
async def register(data: RegisterIn, request: Request):
    email = data.email.strip().lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    doc = {
        "name": data.name.strip(),
        "email": email,
        "password_hash": hash_password(data.password),
        "exam": data.exam or "JEE",
        "role": "student",
        "created_at": now_utc(),
    }
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    resp = {
        "id": uid, "name": doc["name"], "email": email, "exam": doc["exam"], "role": "student"
    }
    response = __import__("fastapi").responses.JSONResponse(resp)
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return response

@api_router.post("/auth/login")
async def login(data: LoginIn, request: Request):
    email = data.email.strip().lower()
    identifier = f"{request.client.host}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5 and now_utc() < attempt["locked_until"]:
        raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1},
             "$set": {"locked_until": now_utc() + timedelta(minutes=15), "updated_at": now_utc()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    uid = str(user["_id"])
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    resp = {"id": uid, "name": user["name"], "email": email, "exam": user.get("exam", "JEE"), "role": user.get("role", "student")}
    response = __import__("fastapi").responses.JSONResponse(resp)
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return response

@api_router.post("/auth/logout")
async def logout():
    response = __import__("fastapi").responses.JSONResponse({"ok": True})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return response

@api_router.post("/auth/refresh")
async def refresh(request: Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        uid = payload["sub"]
        user = await db.users.find_one({"_id": ObjectId(uid)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(uid, user["email"])
        response = __import__("fastapi").responses.JSONResponse({"ok": True})
        response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
        return response
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@api_router.get("/auth/me")
async def me(user: dict = __import__("fastapi").Depends(get_current_user)):
    return {"id": user["_id"], "name": user["name"], "email": user["email"], "exam": user.get("exam", "JEE"), "role": user.get("role", "student")}

# ---------- content ----------

@api_router.get("/")
async def root():
    return {"message": "Vidhyasetu API is live"}

@api_router.get("/tests")
async def list_tests():
    tests = await db.tests.find({}).sort("order", 1).to_list(50)
    out = []
    for t in tests:
        t = clean_doc(t)
        t["questions_count"] = len(t.pop("questions", []))
        out.append(t)
    return out

@api_router.get("/tests/{test_id}")
async def get_test(test_id: str):
    t = await db.tests.find_one({"_id": ObjectId(test_id)})
    if not t:
        raise HTTPException(status_code=404, detail="Test not found")
    for q in t.get("questions", []):
        q.pop("answer", None)
        q.pop("explanation", None)
    return clean_doc(t)

@api_router.post("/tests/{test_id}/submit")
async def submit_test(test_id: str, data: SubmitIn, user: dict = __import__("fastapi").Depends(get_current_user)):
    t = await db.tests.find_one({"_id": ObjectId(test_id)})
    if not t:
        raise HTTPException(status_code=404, detail="Test not found")
    correct = incorrect = skipped = 0
    breakdown = {}
    review = []
    for q in t.get("questions", []):
        chosen = data.answers.get(str(q["id"]))
        subject = q.get("subject", "General")
        b = breakdown.setdefault(subject, {"correct": 0, "total": 0})
        b["total"] += 1
        entry = {
            "id": q["id"], "subject": subject, "text": q["text"], "options": q["options"],
            "chosen": chosen, "correct_idx": q["answer"], "explanation": q.get("explanation", ""),
        }
        if chosen is None:
            skipped += 1
        elif chosen == q["answer"]:
            correct += 1
            b["correct"] += 1
        else:
            incorrect += 1
        review.append(entry)
    total = len(t.get("questions", []))
    accuracy = round((correct / total) * 100, 1) if total else 0
    result = {
        "user_id": user["_id"],
        "test_id": test_id,
        "test_title": t["title"],
        "score": correct,
        "total": total,
        "correct": correct,
        "incorrect": incorrect,
        "skipped": skipped,
        "accuracy": accuracy,
        "time_taken": data.time_taken,
        "subject_breakdown": [{"subject": k, "correct": v["correct"], "total": v["total"]} for k, v in breakdown.items()],
        "review": review,
        "created_at": now_utc(),
    }
    res = await db.results.insert_one(result)
    return {"result_id": str(res.inserted_id), "score": correct, "total": total, "accuracy": accuracy}

@api_router.get("/results")
async def my_results(user: dict = __import__("fastapi").Depends(get_current_user)):
    results = await db.results.find({"user_id": user["_id"]}).sort("created_at", -1).to_list(100)
    return [clean_doc(r) for r in results]

@api_router.get("/results/{result_id}")
async def get_result(result_id: str, user: dict = __import__("fastapi").Depends(get_current_user)):
    r = await db.results.find_one({"_id": ObjectId(result_id), "user_id": user["_id"]})
    if not r:
        raise HTTPException(status_code=404, detail="Result not found")
    return clean_doc(r)

@api_router.get("/dashboard")
async def dashboard(user: dict = __import__("fastapi").Depends(get_current_user)):
    results = await db.results.find({"user_id": user["_id"]}).sort("created_at", 1).to_list(200)
    tests_taken = len(results)
    avg_acc = round(sum(r["accuracy"] for r in results) / tests_taken, 1) if results else 0
    best = max((r["accuracy"] for r in results), default=0)
    streak = 0
    day = now_utc().date()
    dates = {r["created_at"].date() for r in results}
    if day not in dates:
        day -= timedelta(days=1)
    while day in dates:
        streak += 1
        day -= timedelta(days=1)
    progress = [{"label": r["created_at"].strftime("%d %b"), "accuracy": r["accuracy"]} for r in results[-10:]]
    subj_acc = {}
    for r in results:
        for s in r.get("subject_breakdown", []):
            a = subj_acc.setdefault(s["subject"], {"correct": 0, "total": 0})
            a["correct"] += s["correct"]
            a["total"] += s["total"]
    subjects = [{"subject": k, "accuracy": round(v["correct"] / v["total"] * 100, 1)} for k, v in subj_acc.items()]
    recent = [clean_doc(r) for r in results[-4:]][::-1]
    schedule = [clean_doc(s) async for s in db.schedule.find().sort("when", 1).limit(5)]
    return {
        "name": user["name"].split(" ")[0],
        "exam": user.get("exam", "JEE"),
        "stats": {"tests_taken": tests_taken, "avg_accuracy": avg_acc, "best_accuracy": best, "streak": streak},
        "progress": progress,
        "subjects": subjects,
        "recent_results": recent,
        "schedule": schedule,
    }

@api_router.get("/library")
async def library(subject: Optional[str] = None):
    q = {"subject": subject} if subject and subject != "All" else {}
    items = await db.library.find(q).sort("order", 1).to_list(100)
    return [clean_doc(i) for i in items]

@api_router.get("/schedule")
async def schedule():
    items = await db.schedule.find().sort("when", 1).to_list(20)
    return [clean_doc(i) for i in items]

# ---------- AI doubt solver ----------

TUTOR_SYSTEM = (
    "You are Setu AI, the doubt-solving mentor inside Vidhyasetu, an exam-prep platform for Indian students "
    "(JEE, NEET, CBSE boards, CUET). Explain concepts in a crisp, exam-focused way: short paragraphs, key formulae, "
    "one worked example when useful, and end with a one-line memory trick. Keep answers under 220 words unless asked "
    "for depth. Write ALL maths in plain text using unicode (x², √3, ½, π, ≤, 10⁻³) or simple fractions like 1/2 — "
    "NEVER use LaTeX markup (no \\frac, \\sqrt, \\(, \\[ or $$). Never invent exam dates or marks schemes."
)


@api_router.post("/ai/doubt")
async def doubt(data: DoubtIn, user: dict = __import__("fastapi").Depends(get_current_user)):
    uid = user["_id"]

    async def gen():
        try:
            await db.chat_messages.insert_one({"user_id": uid, "role": "user", "content": data.question, "created_at": now_utc()})
            history = await db.chat_messages.find({"user_id": uid}).sort("created_at", -1).limit(9).to_list(9)
            transcript = "\n".join(f"{'Student' if h['role'] == 'user' else 'You'}: {h['content']}" for h in reversed(history[1:]))
            prompt = (f"Recent conversation:\n{transcript}\n\nNew doubt: {data.question}" if transcript else data.question)
            chat = LlmChat(api_key=LLM_KEY, session_id=f"doubt-{uid}", system_message=TUTOR_SYSTEM)
            chat.with_model("openai", "gpt-5.4")
            full = []
            async for ev in chat.stream_message(UserMessage(text=prompt)):
                if isinstance(ev, TextDelta):
                    full.append(ev.content)
                    yield f"data: {json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
            await db.chat_messages.insert_one({"user_id": uid, "role": "assistant", "content": "".join(full), "created_at": now_utc()})
        except Exception as e:
            logger.error(f"doubt error: {e}")
            yield f"data: {json.dumps({'error': 'Setu AI is having a moment. Try again shortly.'})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

@api_router.get("/ai/history")
async def ai_history(user: dict = __import__("fastapi").Depends(get_current_user)):
    msgs = await db.chat_messages.find({"user_id": user["_id"]}).sort("created_at", 1).to_list(50)
    return [{"role": m["role"], "content": m["content"]} for m in msgs]

# ---------- seed ----------

SEED_TESTS = [
    {
        "order": 1, "title": "JEE Main Full Sprint #12", "exam": "JEE", "subject": "PCM",
        "difficulty": "Moderate", "duration_min": 45,
        "description": "Mixed Physics, Chemistry and Maths set modelled on the latest JEE Main pattern.",
        "questions": [
            {"id": "q1", "subject": "Physics", "text": "A body starts from rest with uniform acceleration 4 m/s². Distance covered in the 3rd second is:", "options": ["10 m", "12 m", "18 m", "36 m"], "answer": 0, "explanation": "s = u·t + ½a(2t−1) = 0 + ½·4·(5) = 10 m."},
            {"id": "q2", "subject": "Physics", "text": "Two resistors 3Ω and 6Ω are in parallel. Equivalent resistance is:", "options": ["2Ω", "4.5Ω", "9Ω", "0.5Ω"], "answer": 0, "explanation": "1/R = 1/3 + 1/6 = 1/2 → R = 2Ω."},
            {"id": "q3", "subject": "Chemistry", "text": "The IUPAC name of CH₃-CH(Br)-CH₃ is:", "options": ["2-bromopropane", "propyl bromide", "1-bromopropane", "bromomethane"], "answer": 0, "explanation": "Longest chain is propane; bromo on C-2 gives 2-bromopropane."},
            {"id": "q4", "subject": "Chemistry", "text": "pH of a 0.001 M HCl solution is:", "options": ["1", "3", "7", "11"], "answer": 1, "explanation": "[H⁺] = 10⁻³ → pH = −log(10⁻³) = 3."},
            {"id": "q5", "subject": "Mathematics", "text": "If x² − 5x + 6 = 0, the sum of the roots is:", "options": ["−5", "5", "6", "1"], "answer": 1, "explanation": "Sum of roots = −b/a = 5."},
            {"id": "q6", "subject": "Mathematics", "text": "The derivative of sin(2x) with respect to x is:", "options": ["cos 2x", "2cos 2x", "−2cos 2x", "2 sin 2x"], "answer": 1, "explanation": "Chain rule: d/dx sin(2x) = 2cos(2x)."},
        ],
    },
    {
        "order": 2, "title": "NEET Biology Rapid Rank", "exam": "NEET", "subject": "Biology",
        "difficulty": "Moderate", "duration_min": 30,
        "description": "High-yield NCERT-line questions that decide your NEET Biology percentile.",
        "questions": [
            {"id": "q1", "subject": "Biology", "text": "The powerhouse of the cell is:", "options": ["Ribosome", "Mitochondria", "Golgi body", "Lysosome"], "answer": 1, "explanation": "Mitochondria generate ATP — the energy currency."},
            {"id": "q2", "subject": "Biology", "text": "Which pigment absorbs light in photosynthesis?", "options": ["Haemoglobin", "Chlorophyll", "Melanin", "Carotene only"], "answer": 1, "explanation": "Chlorophyll-a is the chief photosynthetic pigment."},
            {"id": "q3", "subject": "Biology", "text": "Normal human blood pressure is approximately:", "options": ["120/80 mm Hg", "80/120 mm Hg", "140/100 mm Hg", "100/40 mm Hg"], "answer": 0, "explanation": "Standard reference: 120 systolic over 80 diastolic."},
            {"id": "q4", "subject": "Biology", "text": "DNA replication is:", "options": ["Conservative", "Semi-conservative", "Dispersive", "Random"], "answer": 1, "explanation": "Meselson–Stahl proved semi-conservative replication."},
            {"id": "q5", "subject": "Biology", "text": "Insulin is secreted by:", "options": ["Liver", "Pancreas (β-cells)", "Pituitary", "Adrenal gland"], "answer": 1, "explanation": "β-cells of the islets of Langerhans secrete insulin."},
            {"id": "q6", "subject": "Biology", "text": "The largest human gland is:", "options": ["Pancreas", "Thyroid", "Liver", "Spleen"], "answer": 2, "explanation": "Liver is the largest gland and the largest internal organ."},
        ],
    },
    {
        "order": 3, "title": "CBSE Class 10 Maths Board Drill", "exam": "CBSE", "subject": "Mathematics",
        "difficulty": "Easy", "duration_min": 40,
        "description": "Board-style practice covering the chapters that carry the most marks.",
        "questions": [
            {"id": "q1", "subject": "Mathematics", "text": "The value of sin 30° is:", "options": ["1/2", "√3/2", "1", "0"], "answer": 0, "explanation": "Standard trigonometric value."},
            {"id": "q2", "subject": "Mathematics", "text": "The 10th term of the AP 2, 5, 8, … is:", "options": ["29", "32", "27", "30"], "answer": 0, "explanation": "aₙ = a + (n−1)d = 2 + 9·3 = 29."},
            {"id": "q3", "subject": "Mathematics", "text": "The distance of point (3, 4) from the origin is:", "options": ["3", "4", "5", "7"], "answer": 2, "explanation": "√(3² + 4²) = 5."},
            {"id": "q4", "subject": "Mathematics", "text": "Sum of zeroes of x² − 7x + 12 is:", "options": ["12", "−7", "7", "−12"], "answer": 2, "explanation": "Sum = −b/a = 7."},
            {"id": "q5", "subject": "Mathematics", "text": "A die is thrown once. P(even number) =", "options": ["1/6", "1/3", "1/2", "2/3"], "answer": 2, "explanation": "Favourable: {2,4,6} → 3/6 = 1/2."},
            {"id": "q6", "subject": "Mathematics", "text": "Curved surface area of a cylinder of radius r and height h is:", "options": ["2πrh", "πr²h", "πr(r+h)", "2πr²"], "answer": 0, "explanation": "CSA = perimeter × height = 2πrh."},
        ],
    },
]

SEED_LIBRARY = [
    {"order": 1, "title": "Rotational Mechanics — Master Notes", "subject": "Physics", "type": "Notes", "meta": "38 pages • IIT-B compiled", "level": "Advanced"},
    {"order": 2, "title": "Named Reactions Sprint Sheet", "subject": "Chemistry", "type": "Formula sheet", "meta": "1 page • 42 reactions", "level": "Advanced"},
    {"order": 3, "title": "Human Physiology Rapid Revision", "subject": "Biology", "type": "Video", "meta": "52 min • NEET focus", "level": "Intermediate"},
    {"order": 4, "title": "Calculus Cheat Card", "subject": "Mathematics", "type": "Formula sheet", "meta": "1 page • JEE Main", "level": "Intermediate"},
    {"order": 5, "title": "Trigonometry Previous Year Vault", "subject": "Mathematics", "type": "Previous paper", "meta": "10 years • solved", "level": "Intermediate"},
    {"order": 6, "title": "Organic Chemistry Basics — Video Series", "subject": "Chemistry", "type": "Video", "meta": "6 videos • 4.5 hrs", "level": "Beginner"},
    {"order": 7, "title": "Ray Optics Concept Map", "subject": "Physics", "type": "Notes", "meta": "12 pages • diagram-first", "level": "Beginner"},
    {"order": 8, "title": "NEET Biology NCERT Line-by-Line", "subject": "Biology", "type": "Notes", "meta": "96 pages • high-yield", "level": "Advanced"},
    {"order": 9, "title": "CBSE Maths Board Paper 2025", "subject": "Mathematics", "type": "Previous paper", "meta": "Set 1–3 • with solutions", "level": "Beginner"},
]

SEED_SCHEDULE = [
    {"order": 1, "title": "Rotational Mechanics Masterclass", "mentor": "Dr. Meera Iyer • IIT Bombay", "when": now_utc() + timedelta(days=1, hours=4), "duration": "90 min", "subject": "Physics"},
    {"order": 2, "title": "Organic: Named Reactions Sprint", "mentor": "Prof. Arjun Rao • IISc", "when": now_utc() + timedelta(days=2, hours=2), "duration": "60 min", "subject": "Chemistry"},
    {"order": 3, "title": "Human Physiology Rapid Revision", "mentor": "Dr. Nandita Bose • AIIMS", "when": now_utc() + timedelta(days=3, hours=6), "duration": "75 min", "subject": "Biology"},
    {"order": 4, "title": "Calculus for JEE Mains 2026", "mentor": "Vikram Shetty • 12-yr mentor", "when": now_utc() + timedelta(days=5, hours=3), "duration": "90 min", "subject": "Mathematics"},
]

async def seed():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.results.create_index("user_id")
    await db.chat_messages.create_index("user_id")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@vidhyasetu.in")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Vidya@2026")
    if not await db.users.find_one({"email": admin_email}):
        await db.users.insert_one({"name": "Admin", "email": admin_email, "password_hash": hash_password(admin_password),
                                   "role": "admin", "exam": "—", "created_at": now_utc()})

    demo_email = "student@vidhyasetu.in"
    if not await db.users.find_one({"email": demo_email}):
        await db.users.insert_one({"name": "Aarav Sharma", "email": demo_email, "password_hash": hash_password("demo1234"),
                                   "role": "student", "exam": "JEE", "created_at": now_utc()})
    demo = await db.users.find_one({"email": demo_email})
    demo_id = str(demo["_id"])

    if await db.tests.count_documents({}) == 0:
        await db.tests.insert_many(SEED_TESTS)
    if await db.library.count_documents({}) == 0:
        await db.library.insert_many(SEED_LIBRARY)
    if await db.schedule.count_documents({}) == 0:
        await db.schedule.insert_many(SEED_SCHEDULE)

    if await db.results.count_documents({"user_id": demo_id}) == 0:
        tests = await db.tests.find().to_list(3)
        accs = [55.0, 61.7, 58.3, 68.3, 73.3, 81.7]
        for i, acc in enumerate(accs):
            t = tests[i % len(tests)]
            qs = t["questions"]
            total = len(qs)
            correct = round(acc / 100 * total)
            incorrect = total - correct - 1
            skipped = total - correct - incorrect
            subjects = {}
            for q in qs:
                b = subjects.setdefault(q["subject"], {"correct": 0, "total": 0})
                b["total"] += 1
            ordered = list(subjects.keys())
            rem = correct
            for idx, name in enumerate(ordered):
                if idx == len(ordered) - 1:
                    subjects[name]["correct"] = rem
                else:
                    take = min(rem, subjects[name]["total"])
                    subjects[name]["correct"] = take
                    rem -= take
            await db.results.insert_one({
                "user_id": demo_id, "test_id": str(t["_id"]), "test_title": t["title"],
                "score": correct, "total": total, "correct": correct, "incorrect": incorrect, "skipped": skipped,
                "accuracy": round(correct / total * 100, 1),
                "time_taken": t["duration_min"] * 60 - (i + 2) * 120,
                "subject_breakdown": [{"subject": k, "correct": v["correct"], "total": v["total"]} for k, v in subjects.items()],
                "review": [],
                "created_at": now_utc() - timedelta(days=12 - i * 2),
            })
    logger.info("Seed complete")

@app.on_event("startup")
async def startup():
    await seed()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

app.include_router(api_router)
