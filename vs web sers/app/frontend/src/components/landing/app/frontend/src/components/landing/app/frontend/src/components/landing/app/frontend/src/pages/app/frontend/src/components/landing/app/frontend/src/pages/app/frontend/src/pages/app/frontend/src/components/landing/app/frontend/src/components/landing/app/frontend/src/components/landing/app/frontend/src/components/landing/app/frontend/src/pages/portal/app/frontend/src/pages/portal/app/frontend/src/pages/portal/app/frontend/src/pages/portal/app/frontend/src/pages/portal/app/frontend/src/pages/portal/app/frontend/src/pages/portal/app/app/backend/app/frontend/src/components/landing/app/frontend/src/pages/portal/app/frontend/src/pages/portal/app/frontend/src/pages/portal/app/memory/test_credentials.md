# Vidhyasetu — Test Credentials

## Demo student (seeded, has progress data)
- Email: student@vidhyasetu.in
- Password: demo1234
- Role: student (JEE track, seeded accuracy history + streak)

## Admin
- Email: admin@vidhyasetu.in
- Password: Vidya@2026
- Role: admin

## Notes
- Seeds run on backend startup, only when missing (idempotent).
- Mock tests (3), library items (9), live-class schedule (4) are seeded automatically.
- Auth: JWT httpOnly cookies (`access_token` 1h, `refresh_token` 7d), brute-force lockout after 5 failed logins (15 min).
- Endpoints: /api/auth/{register,login,logout,me,refresh}, /api/tests, /api/tests/{id}/submit, /api/results, /api/dashboard, /api/library, /api/schedule, /api/ai/{doubt,history}
