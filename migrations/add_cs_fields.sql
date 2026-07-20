ALTER TABLE contact_submissions ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE contact_submissions ADD COLUMN memo TEXT NOT NULL DEFAULT '';
