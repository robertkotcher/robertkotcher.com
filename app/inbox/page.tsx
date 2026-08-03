"use client";

import { FormEvent, useEffect, useState } from "react";

type ThreadSummary = {
  id: string;
  sender_email: string;
  sender_name: string | null;
  last_subject: string;
  last_message_at: string;
  message_count: number;
  attachment_count: number;
};

type ThreadMessage = {
  id: string;
  direction: "inbound" | "outbound";
  resend_message_id: string | null;
  from_email: string;
  from_name: string | null;
  to_emails: string[];
  subject: string;
  text_body: string | null;
  html_body: string | null;
  attachments: unknown[];
  created_at: string;
};

type Detail = {
  thread: ThreadSummary;
  messages: ThreadMessage[];
};

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function senderLabel(thread: ThreadSummary) {
  return thread.sender_name ? `${thread.sender_name} <${thread.sender_email}>` : thread.sender_email;
}

function messageSender(message: ThreadMessage) {
  return message.from_name ? `${message.from_name} <${message.from_email}>` : message.from_email;
}

function messageBody(message: ThreadMessage) {
  return message.text_body || message.html_body?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "No message body available.";
}

function attachmentName(attachment: unknown) {
  if (attachment && typeof attachment === "object" && "filename" in attachment && typeof attachment.filename === "string") {
    return attachment.filename;
  }
  return "Attachment";
}

function PaperclipIcon() {
  return (
    <svg aria-hidden="true" className="inbox-attachment-icon" fill="none" height="13" viewBox="0 0 24 24" width="13">
      <path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 0 1-2.8-2.8l8.9-8.9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function replyMessageId(messages: ThreadMessage[]) {
  return [...messages].reverse().find((message) => message.direction === "inbound" && message.resend_message_id)?.resend_message_id || null;
}

export default function InboxPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function loadThreads() {
    const response = await fetch("/api/inbox/messages");
    if (response.status === 401) return setAuthenticated(false);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load threads.");
    setThreads(data.data || []);
    setAuthenticated(true);
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadThreads().catch((e) => setError(e.message)));
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/inbox/auth", { body: JSON.stringify({ password }), headers: { "Content-Type": "application/json" }, method: "POST" });
    if (!response.ok) return setError("Incorrect password.");
    setPassword("");
    await loadThreads();
  }

  async function openThread(id: string) {
    const response = await fetch(`/api/inbox/messages/${encodeURIComponent(id)}`);
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Could not open thread.");
    setSelected(data);
    setReply("");
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setSending(true);
    setError("");
    const response = await fetch("/api/inbox/reply", {
      body: JSON.stringify({
        body: reply,
        messageId: replyMessageId(selected.messages),
        subject: `Re: ${selected.thread.last_subject || "No subject"}`,
        to: selected.thread.sender_email,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const data = await response.json();
    setSending(false);
    if (!response.ok) return setError(data.error || "Reply could not be sent.");
    setReply("");
    setError("Reply sent.");
    await loadThreads();
    await openThread(selected.thread.id);
  }

  if (authenticated === null) return <main className="inbox-shell"><p className="inbox-loading">Loading inbox...</p></main>;
  if (!authenticated) return <main className="inbox-shell inbox-login"><div className="inbox-login-card"><p className="inbox-kicker">DEVELOP</p><h1>Your inbox</h1><p>Enter the inbox password to continue.</p><form onSubmit={signIn}><label htmlFor="inbox-password">Password</label><input id="inbox-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus /><button type="submit">Open inbox</button></form>{error && <p className="inbox-error">{error}</p>}</div></main>;

  return <main className="inbox-shell"><header className="inbox-header"><div><p className="inbox-kicker">DEVELOP</p><h1>Inbox</h1></div><div className="inbox-header-actions"><button onClick={() => loadThreads().catch((e) => setError(e.message))}>Refresh</button><button className="inbox-logout" onClick={async () => { await fetch("/api/inbox/auth", { method: "DELETE" }); setAuthenticated(false); }}>Sign out</button></div></header><div className="inbox-layout"><aside className="inbox-list" aria-label="Threads"><div className="inbox-list-heading"><span>Threads</span><strong>{threads.length}</strong></div>{threads.length === 0 && <p className="inbox-empty">No messages yet.</p>}{threads.map((thread) => <button className={`inbox-row ${selected?.thread.id === thread.id ? "is-selected" : ""}`} key={thread.id} onClick={() => openThread(thread.id)}><span className="inbox-row-top"><strong>{senderLabel(thread)}</strong><time>{displayDate(thread.last_message_at)}</time></span><span className="inbox-row-subject">{thread.last_subject || "No subject"}</span><span className="inbox-row-preview">{thread.message_count} msg{thread.message_count === 1 ? "" : "s"}{thread.attachment_count ? <span className="inbox-row-attachments"><PaperclipIcon />{thread.attachment_count}</span> : null}</span></button>)}</aside><section className="inbox-reader">{selected ? <><div className="inbox-message-head"><p className="inbox-kicker">THREAD</p><h2>{senderLabel(selected.thread)}</h2><p className="inbox-meta">{selected.messages.length} message{selected.messages.length === 1 ? "" : "s"} · Last activity {displayDate(selected.thread.last_message_at)}</p></div><div className="inbox-conversation">{selected.messages.map((message) => <article className={`inbox-conversation-message is-${message.direction}`} key={message.id}><div className="inbox-conversation-meta"><strong>{message.direction === "outbound" ? "You" : messageSender(message)}</strong><time>{displayDate(message.created_at)}</time></div><h3>{message.subject || "No subject"}</h3><div className="inbox-message-body">{messageBody(message)}</div>{message.attachments.length ? <div className="inbox-attachments">{message.attachments.map((attachment, index) => <span key={`${message.id}-${index}`}><PaperclipIcon />{attachmentName(attachment)}</span>)}</div> : null}</article>)}</div><form className="inbox-reply" onSubmit={sendReply}><label htmlFor="reply">Reply to {selected.thread.sender_email}</label><textarea id="reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." required /><button type="submit" disabled={sending}>{sending ? "Sending..." : "Send reply"}</button></form></> : <div className="inbox-reader-empty"><p>Select a thread to read it.</p></div>}</section></div>{error && <p className={error === "Reply sent." ? "inbox-success" : "inbox-error"}>{error}</p>}</main>;
}
