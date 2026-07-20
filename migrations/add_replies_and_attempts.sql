-- 답장 이력
CREATE TABLE IF NOT EXISTS contact_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TEXT DEFAULT (datetime('now', '+9 hours'))
);

-- 로그인 실패 횟수
CREATE TABLE IF NOT EXISTS login_attempts (
  email TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT
);
