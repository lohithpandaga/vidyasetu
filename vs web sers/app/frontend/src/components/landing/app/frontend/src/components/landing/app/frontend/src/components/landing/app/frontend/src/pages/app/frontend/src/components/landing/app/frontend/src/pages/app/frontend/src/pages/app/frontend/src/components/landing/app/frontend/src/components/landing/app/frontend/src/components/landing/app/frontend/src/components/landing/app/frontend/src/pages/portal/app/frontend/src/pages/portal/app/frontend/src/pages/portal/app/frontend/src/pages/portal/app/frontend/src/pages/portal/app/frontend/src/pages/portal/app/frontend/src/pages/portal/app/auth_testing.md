# Vidhyasetu — Auth & API Testing Playbook

## Credentials (also in /app/memory/test_credentials.md)
- Admin: admin@vidhyasetu.in / Vidya@2026 (role: admin)
- Demo student: student@vidhyasetu.in / demo1234 (role: student, seeded results)

## Endpoints
- POST /api/auth/register {name,email,password,exam}
- POST /api/auth/login {email,password}
- POST /api/auth/logout
- GET  /api/auth/me (cookie or Bearer)
- POST /api/auth/refresh
- GET  /api/tests, GET /api/tests/{id}
- POST /api/tests/{id}/submit {answers:{qid:int}, time_taken:int}
- GET  /api/results, GET /api/results/{id}
- GET  /api/dashboard
- GET  /api/library?subject=
- GET  /api/schedule
- POST /api/ai/doubt {question} (SSE stream)
- GET  /api/ai/history

## Verify flow
1. mongosh $DB_NAME → db.users.findOne({role:"admin"}) → password_hash starts with $2b$
2. curl -c cookies.txt -X POST $API/api/auth/login -d '{"email":"student@vidhyasetu.in","password":"demo1234"}' -H "Content-Type: application/json"
3. curl -b cookies.txt $API/api/auth/me → returns user
4. curl -b cookies.txt $API/api/dashboard → stats + progress
5. Brute force: 5 bad logins → 429 with lockout message
