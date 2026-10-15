import type { ReactNode } from "react";

export default function ResumeFocus({ children }: { children: ReactNode }) {
  return <div className="focus-view">{children}</div>;
}
