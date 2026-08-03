ALTER TABLE resend_webhook_events
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'processed';

ALTER TABLE resend_webhook_events
  ADD COLUMN IF NOT EXISTS error_text TEXT;

CREATE INDEX IF NOT EXISTS resend_webhook_events_status_idx ON resend_webhook_events (status, processed_at DESC);
