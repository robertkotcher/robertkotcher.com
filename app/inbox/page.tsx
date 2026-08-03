"use client";

import { FormEvent, useEffect, useState } from "react";

type Message = { email_id: string; created_at: string; from: string; subject: string; attachments?: { filename: string }[] };
type Detail = { message: { email_id: string; from: string; to: string[]; subject: string; text?: string; html?: string; message_id?: string; created_at: string }; attachments: { data?: { filename: string; download_url: string; content_type?: string; size?: number }[] } };

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function InboxPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function loadMessages() {
    const response = await fetch("/api/inbox/messages");
    if (response.status === 401) return setAuthenticated(false);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load messages.");
    setMessages(data.data || []);
    setAuthenticated(true);
  }

  useEffect(() => { loadMessages().catch((e) => setError(e.message)); }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/inbox/auth", { body: JSON.stringify({ password }), headers: { "Content-Type": "application/json" }, method: "POST" });
    if (!response.ok) return setError("Incorrect password.");
    setPassword("");
    await loadMessages();
  }

  async function openMessage(id: string) {
    const response = await fetch(`/api/inbox/messages/${encodeURIComponent(id)}`);
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Could not open message.");
    setSelected(data);
    setReply("");
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setSending(true);
    setError("");
    const response = await fetch("/api/inbox/reply", { body: JSON.stringify({ body: reply, messageId: selected.message.message_id, subject: `Re: ${selected.message.subject}`, to: selected.message.from }), headers: { "Content-Type": "application/json" }, method: "POST" });
    const data = await response.json();
    setSending(false);
    if (!response.ok) return setError(data.error || "Reply could not be sent.");
    setReply("");
    setError("Reply sent.");
  }

  if (authenticated === null) return <main className="inbox-shell"><p className="inbox-loading">Loading inbox...</p></main>;
  if (!authenticated) return <main className="inbox-shell inbox-login"><div className="inbox-login-card"><p className="inbox-kicker">DEVELOP</p><h1>Your inbox</h1><p>Enter the inbox password to continue.</p><form onSubmit={signIn}><label htmlFor="inbox-password">Password</label><input id="inbox-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus /><button type="submit">Open inbox</button></form>{error && <p className="inbox-error">{error}</p>}</div></main>;

  return <main className="inbox-shell"><header className="inbox-header"><div><p className="inbox-kicker">DEVELOP</p><h1>Inbox</h1></div><div className="inbox-header-actions"><button onClick={() => loadMessages().catch((e) => setError(e.message))}>Refresh</button><button className="inbox-logout" onClick={async () => { await fetch("/api/inbox/auth", { method: "DELETE" }); setAuthenticated(false); }}>Sign out</button></div></header><div className="inbox-layout"><aside className="inbox-list" aria-label="Messages"><div className="inbox-list-heading"><span>All mail</span><strong>{messages.length}</strong></div>{messages.length === 0 && <p className="inbox-empty">No messages yet.</p>}{messages.map((message) => <button className={`inbox-row ${selected?.message.email_id === message.email_id ? "is-selected" : ""}`} key={message.email_id} onClick={() => openMessage(message.email_id)}><span className="inbox-row-top"><strong>{message.from}</strong><time>{displayDate(message.created_at)}</time></span><span className="inbox-row-subject">{message.subject || "No subject"}</span><span className="inbox-row-preview">{message.attachments?.length ? `${message.attachments.length} attachment${message.attachments.length === 1 ? "" : "s"}` : "Message received"}</span></button>)}</aside><section className="inbox-reader">{selected ? <><div className="inbox-message-head"><p className="inbox-kicker">MESSAGE</p><h2>{selected.message.subject || "No subject"}</h2><p className="inbox-meta">From {selected.message.from} · {displayDate(selected.message.created_at)}</p></div><div className="inbox-message-body">{selected.message.text || selected.message.html?.replace(/<[^>]+>/g, " ") || "No message body available."}</div>{selected.attachments?.data?.length ? <div className="inbox-attachments"><p className="inbox-kicker">ATTACHMENTS</p>{selected.attachments.data.map((attachment) => <a href={attachment.download_url} key={attachment.filename} target="_blank" rel="noreferrer">{attachment.filename}</a>)}</div> : null}<form className="inbox-reply" onSubmit={sendReply}><label htmlFor="reply">Reply</label><textarea id="reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." required /><button type="submit" disabled={sending}>{sending ? "Sending..." : "Send reply"}</button></form></> : <div className="inbox-reader-empty"><p>Select a message to read it.</p></div>}</section></div>{error && <p className={error === "Reply sent." ? "inbox-success" : "inbox-error"}>{error}</p>}</main>;
}
