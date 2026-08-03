import { Pool, type QueryResultRow } from "pg";
import { randomUUID } from "node:crypto";

type QueryParams = readonly unknown[];

export type EmailAddress = {
  email: string;
  name: string | null;
  raw: string;
};

export type ReceivedEmail = {
  id: string;
  to?: string[];
  from: string;
  created_at: string;
  subject?: string | null;
  html?: string | null;
  text?: string | null;
  headers?: Record<string, string>;
  bcc?: string[];
  cc?: string[];
  reply_to?: string[];
  message_id?: string | null;
  raw?: unknown;
  attachments?: unknown[];
};

export type InboxThreadSummary = {
  id: string;
  sender_email: string;
  sender_name: string | null;
  last_subject: string;
  last_message_at: string;
  message_count: number;
  attachment_count: number;
};

export type InboxMessage = {
  id: string;
  direction: "inbound" | "outbound";
  resend_email_id: string | null;
  resend_message_id: string | null;
  from_email: string;
  from_name: string | null;
  to_emails: string[];
  cc_emails: string[];
  bcc_emails: string[];
  subject: string;
  text_body: string | null;
  html_body: string | null;
  attachments: unknown[];
  headers: Record<string, unknown>;
  in_reply_to: string | null;
  created_at: string;
};

export type InboxThreadDetail = {
  thread: InboxThreadSummary;
  messages: InboxMessage[];
};

const globalForPg = globalThis as typeof globalThis & { inboxPool?: Pool };
let schemaReady: Promise<void> | null = null;

function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return url;
}

function shouldUseSsl(connectionString: string) {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");
  if (sslMode === "disable") return false;
  return !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
}

function getPool() {
  globalForPg.inboxPool ??= new Pool({
    connectionString: databaseUrl(),
    max: 5,
    ssl: shouldUseSsl(databaseUrl()) ? { rejectUnauthorized: false } : undefined,
  });

  return globalForPg.inboxPool;
}

async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: QueryParams = []) {
  return getPool().query<T>(text, [...params]);
}

function jsonArray(value: unknown) {
  return JSON.stringify(Array.isArray(value) ? value : []);
}

function jsonObject(value: unknown) {
  return JSON.stringify(value && typeof value === "object" && !Array.isArray(value) ? value : {});
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return (value as T) ?? fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parseEmailAddress(value: string): EmailAddress {
  const raw = value.trim();
  const match = raw.match(/^(?:"?([^"<]*)"?\s*)?<([^<>@\s]+@[^<>\s]+)>$/);
  if (match) {
    const name = match[1]?.trim() || null;
    return { email: match[2].toLowerCase(), name, raw };
  }

  const email = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]?.toLowerCase() || raw.toLowerCase();
  const name = raw === email ? null : raw.replace(email, "").replace(/[<>"()]/g, "").trim() || null;
  return { email, name, raw };
}

export async function ensureInboxSchema() {
  schemaReady ??= (async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS email_threads (
        id TEXT PRIMARY KEY,
        sender_email TEXT NOT NULL UNIQUE,
        sender_name TEXT,
        last_subject TEXT NOT NULL DEFAULT '',
        last_message_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query(`
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
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS resend_webhook_events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        payload JSONB NOT NULL,
        event_created_at TIMESTAMPTZ,
        processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query("CREATE INDEX IF NOT EXISTS email_messages_thread_created_idx ON email_messages (thread_id, created_at)");
    await query("CREATE INDEX IF NOT EXISTS email_threads_last_message_idx ON email_threads (last_message_at DESC)");
  })();

  return schemaReady;
}

async function upsertThread(sender: EmailAddress, subject: string, createdAt: string) {
  await query(
    `
      INSERT INTO email_threads (id, sender_email, sender_name, last_subject, last_message_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (sender_email) DO UPDATE SET
        sender_name = COALESCE(EXCLUDED.sender_name, email_threads.sender_name),
        last_subject = CASE
          WHEN EXCLUDED.last_message_at >= email_threads.last_message_at THEN EXCLUDED.last_subject
          ELSE email_threads.last_subject
        END,
        last_message_at = GREATEST(email_threads.last_message_at, EXCLUDED.last_message_at),
        updated_at = NOW()
    `,
    [sender.email, sender.email, sender.name, subject, createdAt],
  );
}

export async function storeInboundEmail(email: ReceivedEmail) {
  await ensureInboxSchema();

  const sender = parseEmailAddress(email.headers?.from || email.from);
  const createdAt = email.created_at || new Date().toISOString();
  const subject = email.subject?.trim() || "No subject";

  await upsertThread(sender, subject, createdAt);
  await query(
    `
      INSERT INTO email_messages (
        id, thread_id, direction, resend_email_id, resend_message_id, from_email, from_name,
        to_emails, cc_emails, bcc_emails, subject, text_body, html_body, attachments,
        headers, raw, created_at
      )
      VALUES (
        $1, $2, 'inbound', $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb,
        $10, $11, $12, $13::jsonb, $14::jsonb, $15::jsonb, $16
      )
      ON CONFLICT (id) DO UPDATE SET
        resend_message_id = EXCLUDED.resend_message_id,
        from_email = EXCLUDED.from_email,
        from_name = EXCLUDED.from_name,
        to_emails = EXCLUDED.to_emails,
        cc_emails = EXCLUDED.cc_emails,
        bcc_emails = EXCLUDED.bcc_emails,
        subject = EXCLUDED.subject,
        text_body = EXCLUDED.text_body,
        html_body = EXCLUDED.html_body,
        attachments = EXCLUDED.attachments,
        headers = EXCLUDED.headers,
        raw = EXCLUDED.raw
    `,
    [
      email.id,
      sender.email,
      email.id,
      email.message_id || null,
      sender.email,
      sender.name,
      jsonArray(email.to),
      jsonArray(email.cc),
      jsonArray(email.bcc),
      subject,
      email.text || null,
      email.html || null,
      jsonArray(email.attachments),
      jsonObject(email.headers),
      JSON.stringify(email.raw ?? null),
      createdAt,
    ],
  );
}

export async function storeOutboundEmail(input: {
  resendEmailId?: string | null;
  from: string;
  to: string;
  subject: string;
  text: string;
  inReplyTo?: string | null;
}) {
  await ensureInboxSchema();

  const recipient = parseEmailAddress(input.to);
  const from = parseEmailAddress(input.from);
  const createdAt = new Date().toISOString();

  await upsertThread(recipient, input.subject, createdAt);
  await query(
    `
      INSERT INTO email_messages (
        id, thread_id, direction, resend_email_id, from_email, from_name, to_emails,
        subject, text_body, headers, in_reply_to, created_at
      )
      VALUES ($1, $2, 'outbound', $3, $4, $5, $6::jsonb, $7, $8, $9::jsonb, $10, $11)
    `,
    [
      randomUUID(),
      recipient.email,
      input.resendEmailId || null,
      from.email,
      from.name,
      jsonArray([recipient.email]),
      input.subject,
      input.text,
      jsonObject({ "in-reply-to": input.inReplyTo || null }),
      input.inReplyTo || null,
      createdAt,
    ],
  );
}

export async function storeWebhookEvent(input: {
  id: string;
  type: string;
  payload: unknown;
  eventCreatedAt?: string | null;
}) {
  await ensureInboxSchema();

  await query(
    `
      INSERT INTO resend_webhook_events (id, type, payload, event_created_at)
      VALUES ($1, $2, $3::jsonb, $4)
      ON CONFLICT (id) DO UPDATE SET
        payload = EXCLUDED.payload,
        processed_at = NOW()
    `,
    [input.id, input.type, JSON.stringify(input.payload), input.eventCreatedAt || null],
  );
}

export async function listInboxThreads(): Promise<InboxThreadSummary[]> {
  await ensureInboxSchema();

  const { rows } = await query<InboxThreadSummary & QueryResultRow>(`
    SELECT
      t.id,
      t.sender_email,
      t.sender_name,
      t.last_subject,
      t.last_message_at::text,
      COUNT(m.id)::int AS message_count,
      COALESCE(SUM(CASE WHEN jsonb_array_length(m.attachments) > 0 THEN 1 ELSE 0 END), 0)::int AS attachment_count
    FROM email_threads t
    LEFT JOIN email_messages m ON m.thread_id = t.id
    GROUP BY t.id, t.sender_email, t.sender_name, t.last_subject, t.last_message_at
    ORDER BY t.last_message_at DESC
  `);

  return rows.map((row) => ({
    id: String(row.id),
    sender_email: String(row.sender_email),
    sender_name: row.sender_name ? String(row.sender_name) : null,
    last_subject: String(row.last_subject || "No subject"),
    last_message_at: String(row.last_message_at),
    message_count: Number(row.message_count || 0),
    attachment_count: Number(row.attachment_count || 0),
  }));
}

export async function getInboxThread(id: string): Promise<InboxThreadDetail | null> {
  await ensureInboxSchema();

  const { rows: threads } = await query<InboxThreadSummary & QueryResultRow>(
    `
      SELECT
        t.id,
        t.sender_email,
        t.sender_name,
        t.last_subject,
        t.last_message_at::text,
        COUNT(m.id)::int AS message_count,
        COALESCE(SUM(CASE WHEN jsonb_array_length(m.attachments) > 0 THEN 1 ELSE 0 END), 0)::int AS attachment_count
      FROM email_threads t
      LEFT JOIN email_messages m ON m.thread_id = t.id
      WHERE t.id = $1
      GROUP BY t.id, t.sender_email, t.sender_name, t.last_subject, t.last_message_at
    `,
    [id],
  );

  if (!threads[0]) return null;

  const { rows: messages } = await query<InboxMessage & QueryResultRow>(
    `
      SELECT
        id,
        direction,
        resend_email_id,
        resend_message_id,
        from_email,
        from_name,
        to_emails,
        cc_emails,
        bcc_emails,
        subject,
        text_body,
        html_body,
        attachments,
        headers,
        in_reply_to,
        created_at::text
      FROM email_messages
      WHERE thread_id = $1
      ORDER BY created_at ASC, stored_at ASC
    `,
    [id],
  );

  const thread = threads[0];
  return {
    thread: {
      id: String(thread.id),
      sender_email: String(thread.sender_email),
      sender_name: thread.sender_name ? String(thread.sender_name) : null,
      last_subject: String(thread.last_subject || "No subject"),
      last_message_at: String(thread.last_message_at),
      message_count: Number(thread.message_count || 0),
      attachment_count: Number(thread.attachment_count || 0),
    },
    messages: messages.map((message) => ({
      id: String(message.id),
      direction: message.direction === "outbound" ? "outbound" : "inbound",
      resend_email_id: message.resend_email_id ? String(message.resend_email_id) : null,
      resend_message_id: message.resend_message_id ? String(message.resend_message_id) : null,
      from_email: String(message.from_email),
      from_name: message.from_name ? String(message.from_name) : null,
      to_emails: parseJson<string[]>(message.to_emails, []),
      cc_emails: parseJson<string[]>(message.cc_emails, []),
      bcc_emails: parseJson<string[]>(message.bcc_emails, []),
      subject: String(message.subject || "No subject"),
      text_body: message.text_body ? String(message.text_body) : null,
      html_body: message.html_body ? String(message.html_body) : null,
      attachments: parseJson<unknown[]>(message.attachments, []),
      headers: parseJson<Record<string, unknown>>(message.headers, {}),
      in_reply_to: message.in_reply_to ? String(message.in_reply_to) : null,
      created_at: String(message.created_at),
    })),
  };
}
