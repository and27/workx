"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { RANK_STATUS_EVENT } from "@/src/lib/rank-status";
import { TRIAGE_STATUS_EVENT } from "@/src/lib/triage-status";

export default function JobsTriageStatus() {
  const [triageActive, setTriageActive] = useState(false);
  const [rankActive, setRankActive] = useState(false);

  useEffect(() => {
    const triageHandler = (event: Event) => {
      const detail = (event as CustomEvent<{ active: boolean }>).detail;
      setTriageActive(Boolean(detail?.active));
    };
    const rankHandler = (event: Event) => {
      const detail = (event as CustomEvent<{ active: boolean }>).detail;
      setRankActive(Boolean(detail?.active));
    };

    window.addEventListener(TRIAGE_STATUS_EVENT, triageHandler);
    window.addEventListener(RANK_STATUS_EVENT, rankHandler);
    return () => {
      window.removeEventListener(TRIAGE_STATUS_EVENT, triageHandler);
      window.removeEventListener(RANK_STATUS_EVENT, rankHandler);
    };
  }, []);

  if (!triageActive && !rankActive) return null;

  return (
    <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
      {triageActive && (
        <span className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Clasificacion en curso...</span>
        </span>
      )}
      {rankActive && (
        <span className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Ranking en curso...</span>
        </span>
      )}
    </div>
  );
}
