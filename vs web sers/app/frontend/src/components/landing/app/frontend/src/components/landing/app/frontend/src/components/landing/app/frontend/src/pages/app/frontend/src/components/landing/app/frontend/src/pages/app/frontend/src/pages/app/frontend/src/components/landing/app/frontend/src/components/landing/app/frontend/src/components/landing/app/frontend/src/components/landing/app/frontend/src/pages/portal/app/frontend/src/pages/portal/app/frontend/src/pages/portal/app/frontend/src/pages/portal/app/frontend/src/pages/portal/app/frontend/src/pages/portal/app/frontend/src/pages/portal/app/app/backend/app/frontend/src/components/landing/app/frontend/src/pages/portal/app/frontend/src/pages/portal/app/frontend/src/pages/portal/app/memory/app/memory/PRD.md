# Vidhyasetu — PRD

## Original Problem Statement
User referenced the Vidya Cube app (institution management platform) as a model and asked to rebuild their site as an advanced, premium EdTech experience: bold headlines, clean layouts, blue accents, engaging interactive cards, prioritizing student-utility features, fully responsive/fast/accessible on mobile and desktop. On clarification, user chose: all-in-one exam-prep platform (mock tests + analytics, study library, AI doubt-solving, timetable/streaks) + courses/live classes; marketing site + working student portal with database; polished sample copy.

## Architecture
- Backend: FastAPI (server.py) on 0.0.0.0:8001, /api prefix, MongoDB via motor (MONGO_URL, DB_NAME from env)
  - JWT httpOnly-cookie auth (bcrypt hashing, refresh tokens, brute-force lockout via login_attempts)
  - Collections: users, tests, results, library, schedule, chat_messages, login_attempts
  - SSE streaming AI doubt endpoint via emergentintegrations (OpenAI gpt-5.4, EMERGENT_LLM_KEY)
  - Idempotent startup seed: admin + demo student (with 12-day result history), 3 mock tests, 9 library items, 4 live classes
- Frontend: React 19 (CRA/craco), Tailwind, shadcn/ui, framer-motion, lenis, react-fast-marquee, recharts, sonner
- Pages: Landing (/), Login, Signup, Portal (sidebar layout): Dashboard, Tests, TestEngine, TestResult, Library, AiChat
- Design system: Cabinet Grotesk + Satoshi + JetBrains Mono, dark marketing theme (#050505) with blue #2563EB accents, light portal theme, original cube-V logo as favicon.svg

## Core Requirements (static)
- Kinetic hero with masked line-by-line reveal + 3D knowledge cube (mouse-tilt + slow spin) + parallax glows
- Editorial exam marquee, count-up stats, bento grid with live mini-UIs (bar chart, typing AI chat, week grid, images)
- Courses/live classes grid with Unsplash imagery, testimonial marquees, CTA band, giant footer wordmark
- Working auth (signup/login/logout), protected portal, guest-only auth pages
- Mock test engine: countdown timer with auto-submit, question palette (answered/marked/current states), mark-for-review, submit dialog
- Scoring + analytics: score ring, correct/incorrect/skipped, subject breakdown, per-question review with explanations
- Dashboard: stats cards, accuracy AreaChart, subject strength bars, upcoming classes, recent results
- Library: subject filter tabs, type icons, levels
- Setu AI: SSE token streaming, persisted history, suggestion chips, plain-text math (no LaTeX)

## Implemented (2026-10-29)
- Full backend + seed data; all endpoints curl-verified (auth chain, submit scoring, dashboard aggregation, SSE stream)
- All landing sections, auth pages, full portal; desktop (1440) + mobile (390) screenshot-verified, zero overflow-x
- Fixed during verification: questions_count seeding, missing motion import (Testimonials), missing api import (TestResult), axios→fetch for browser SSE, LaTeX-free tutor output

## Backlog
- P1: PDF/video real delivery in Library (Open buttons currently toast only); live-class booking with seat persistence; results percentile vs. real cohort
- P1: Teacher/admin portal (question banks, class management à la Vidya Cube)
- P2: Leaderboards, streak reminders (email/push via Resend), payments for premium batches
