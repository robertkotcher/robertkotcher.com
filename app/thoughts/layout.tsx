import Link from "next/link";
import "./thoughts.css";

export default function ThoughtsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="thoughts-shell">
      <div className="thoughts-container">
        <header className="thoughts-header">
          <span className="thoughts-wordmark">How I code with AI</span>
          <span className="thoughts-author">by <Link href="/">Robert Kotcher</Link></span>
        </header>
        {children}
      </div>
    </main>
  );
}
