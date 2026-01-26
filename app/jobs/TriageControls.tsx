"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type triageMode = "new" | "recent";

export default function TriageControls() {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingMode, setPendingMode] = useState<triageMode | null>(null);

  const runTriage = async (mode: triageMode) => {
    if (pendingMode) return;
    setPendingMode(mode);
    try {
      const response = await fetch("/api/triage/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, days: 14 }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        processed?: number;
        triaged?: number;
        skipped?: number;
        error?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "No pudimos analizar trabajos.");
      }
      toast({
        title: `Analisis listo: ${payload.triaged ?? 0} actualizados.`,
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "No pudimos analizar trabajos.",
        variant: "destructive",
      });
    } finally {
      setPendingMode(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pendingMode !== null}
        onClick={() => runTriage("new")}
      >
        {pendingMode === "new" ? "Analizando..." : "Analizar nuevos"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pendingMode !== null}
        onClick={() => runTriage("recent")}
      >
        {pendingMode === "recent"
          ? "Analizando..."
          : "Re-analizar recientes"}
      </Button>
    </div>
  );
}
