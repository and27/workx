"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { TRIAGE_STATUS_EVENT } from "@/src/lib/triage-status";

export default function JobsTriageStatus() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ active: boolean }>).detail;
      setActive(Boolean(detail?.active));
    };

    window.addEventListener(TRIAGE_STATUS_EVENT, handler);
    return () => window.removeEventListener(TRIAGE_STATUS_EVENT, handler);
  }, []);

  if (!active) return null;

  return (
    <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      <span>Clasificacion en curso...</span>
    </div>
  );
}
