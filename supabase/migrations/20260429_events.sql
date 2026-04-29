CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  source_url TEXT,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_school_id_idx ON events(school_id);
CREATE INDEX IF NOT EXISTS events_starts_at_idx ON events(starts_at);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "events_read_own_school" ON events FOR SELECT USING (
    school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "events_insert_own_school" ON events FOR INSERT WITH CHECK (
    school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO events (school_id, title, description, location, category, starts_at, ends_at, source_url)
SELECT
  s.id,
  e.title,
  e.description,
  e.location,
  e.category,
  (now() + e.offset_start)::timestamptz,
  (now() + e.offset_end)::timestamptz,
  e.source_url
FROM schools s
CROSS JOIN (VALUES
  (
    'STEM Career Fair',
    'Meet recruiters from tech, engineering, and government agencies. Bring resumes and dress professionally.',
    'Student Union Ballroom',
    'Career',
    interval '2 days',
    interval '2 days 4 hours',
    'https://uapb.edu/events'
  ),
  (
    'Spring Research Symposium',
    'Undergraduate and graduate students present original research across all disciplines.',
    'Caldwell Hall Auditorium',
    'Academic',
    interval '5 days',
    interval '5 days 6 hours',
    'https://uapb.edu/events'
  ),
  (
    'Free Mental Health Workshop',
    'Student Counseling Services hosts an open session on stress management and academic burnout.',
    'Health & Wellness Center Room 102',
    'Wellness',
    interval '3 days',
    interval '3 days 2 hours',
    'https://uapb.edu/student-services'
  ),
  (
    'New Student Orientation Q&A',
    'Freshmen and transfer students can ask questions about campus life, registration, and resources.',
    'Corbin Hall Room 101',
    'Orientation',
    interval '1 day',
    interval '1 day 2 hours',
    'https://uapb.edu/admissions'
  ),
  (
    'SGA General Assembly Meeting',
    'Monthly student government meeting open to all students. Voice concerns and vote on proposals.',
    'Student Union Room 204',
    'Governance',
    interval '4 days',
    interval '4 days 2 hours',
    'https://uapb.edu/sga'
  ),
  (
    'Internship Application Workshop',
    'Career Services walks through resume building, cover letters, and how to apply on Handshake.',
    'Business and Education Building Room 110',
    'Career',
    interval '6 days',
    interval '6 days 3 hours',
    'https://uapb.edu/career-services'
  )
) AS e(title, description, location, category, offset_start, offset_end, source_url)
WHERE s.domain = 'uapb.edu';
