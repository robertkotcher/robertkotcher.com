CREATE TABLE IF NOT EXISTS email_threads (
  id TEXT PRIMARY KEY,
  sender_email TEXT NOT NULL UNIQUE,
  sender_name TEXT,
  last_subject TEXT NOT NULL DEFAULT '',
  last_message_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES email_threads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  resend_email_id TEXT UNIQUE,
  resend_message_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  cc_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  bcc_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  subject TEXT NOT NULL DEFAULT '',
  text_body TEXT,
  html_body TEXT,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  headers JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw JSONB,
  in_reply_to TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  stored_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resend_webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  event_created_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_messages_thread_created_idx ON email_messages (thread_id, created_at);
CREATE INDEX IF NOT EXISTS email_threads_last_message_idx ON email_threads (last_message_at DESC);
