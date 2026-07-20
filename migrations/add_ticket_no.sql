ALTER TABLE contact_submissions ADD COLUMN ticket_no TEXT;
UPDATE contact_submissions SET ticket_no = REPLACE(REPLACE(REPLACE(substr(created_at,1,19), '-', ''), ' ', ''), ':', '') || printf('%04d', id % 10000) WHERE ticket_no IS NULL;
