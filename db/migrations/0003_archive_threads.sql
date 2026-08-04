ALTER TABLE email_threads
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS email_threads_unarchived_last_message_idx
  ON email_threads (last_message_at DESC)
  WHERE archived_at IS NULL;
