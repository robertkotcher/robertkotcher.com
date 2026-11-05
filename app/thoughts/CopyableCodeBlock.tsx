"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyableCodeBlock({ children }: { children: ReactNode }) {
  const codeRef = useRef<HTMLPreElement>(null);
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyCode() {
    if (!codeRef.current) return;
    try {
      await navigator.clipboard.writeText(codeRef.current.textContent ?? "");
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="thought-code-block">
      <div className="thought-code-toolbar">
        <span>AGENTS.md</span>
        <span role="status">{status === "copied" ? "Copied" : status === "error" ? "Couldn't copy. Select the text to copy manually." : ""}</span>
        <button type="button" onClick={copyCode} aria-label="Copy AGENTS.md text" title="Copy AGENTS.md text">
          {status === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        </button>
      </div>
      <pre ref={codeRef}>{children}</pre>
    </div>
  );
}
