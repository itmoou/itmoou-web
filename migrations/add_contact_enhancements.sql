-- 2차 담당자
ALTER TABLE contact_submissions ADD COLUMN assigned_to_id2 INTEGER;
ALTER TABLE contact_submissions ADD COLUMN assigned_to_name2 TEXT;

-- 내부 메모 로그 (작성자/시각 기록)
CREATE TABLE IF NOT EXISTS contact_memos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now', '+9 hours'))
);
CREATE INDEX IF NOT EXISTS idx_contact_memos_contact ON contact_memos(contact_id);
