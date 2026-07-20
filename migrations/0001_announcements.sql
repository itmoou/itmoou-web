-- 공고 테이블
CREATE TABLE IF NOT EXISTS announcements (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  number      INTEGER NOT NULL UNIQUE,          -- 공고 번호 (자동 부여)
  category    TEXT    NOT NULL DEFAULT '일반공고', -- 일반공고 / 주주총회 / 인사공고 / 기타
  title       TEXT    NOT NULL,
  content     TEXT    NOT NULL,
  notice_date TEXT    NOT NULL,                  -- 공고 날짜 (YYYY-MM-DD)
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', '+9 hours')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now', '+9 hours'))
);

-- 첨부파일 테이블
CREATE TABLE IF NOT EXISTS attachments (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  announcement_id INTEGER NOT NULL,
  filename        TEXT    NOT NULL,   -- 원본 파일명
  storage_key     TEXT    NOT NULL,   -- R2 저장 키
  size            INTEGER,            -- 파일 크기 (bytes)
  created_at      TEXT    NOT NULL DEFAULT (datetime('now', '+9 hours')),
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
);

-- 공고 번호 자동 증가를 위한 시퀀스 테이블
CREATE TABLE IF NOT EXISTS sequences (
  name  TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO sequences (name, value) VALUES ('announcement_number', 0);
