CREATE TABLE IF NOT EXISTS customer_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER,
  ticket_no TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  received_at TEXT DEFAULT (datetime('now', '+9 hours'))
);
CREATE INDEX IF NOT EXISTS idx_customer_replies_ticket ON customer_replies(ticket_no);
CREATE INDEX IF NOT EXISTS idx_customer_replies_contact ON customer_replies(contact_id);
