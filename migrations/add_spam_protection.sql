-- Spam log table
CREATE TABLE IF NOT EXISTS spam_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  email TEXT,
  reason TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now', '+9 hours'))
);
CREATE INDEX IF NOT EXISTS idx_spam_logs_ip ON spam_logs(ip);
CREATE INDEX IF NOT EXISTS idx_spam_logs_created ON spam_logs(created_at);

-- Add IP tracking to contact_submissions
ALTER TABLE contact_submissions ADD COLUMN ip TEXT;
