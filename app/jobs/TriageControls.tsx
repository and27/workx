"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type triageMode = "new" | "recent";

export default function TriageControls() {
  const router = useRouter();
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<triageMode | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => setOpen(false);

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
        openaiUsed?: number;
        openaiSkippedCap?: number;
        error?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "No pudimos analizar trabajos.");
      }
      const skippedByCap = payload.openaiSkippedCap ?? 0;
      toast({
        title: `Analisis listo: ${payload.triaged ?? 0} actualizados.`,
        description:
          skippedByCap > 0
            ? `Se omitieron ${skippedByCap} revisiones por limite diario de OpenAI.`
            : undefined,
        variant: "success",
      });
      handleClose();
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
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Clasificar
      </Button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-lg border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40"
        onCancel={(event) => {
          event.preventDefault();
          handleClose();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            handleClose();
          }
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Clasificar trabajos</h2>
            <p className="text-xs text-muted-foreground">
              Corre el triage para nuevos trabajos o re-analiza recientes.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            Cerrar
          </Button>
        </div>

        <div className="space-y-3 p-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            disabled={pendingMode !== null}
            onClick={() => runTriage("new")}
          >
            <span>Analizar nuevos</span>
            <span className="text-xs text-muted-foreground">Solo sin triage</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            disabled={pendingMode !== null}
            onClick={() => runTriage("recent")}
          >
            <span>Re-analizar recientes</span>
            <span className="text-xs text-muted-foreground">Ultimos 14 dias</span>
          </Button>
          {pendingMode && (
            <p className="text-xs text-muted-foreground">
              Analizando {pendingMode === "new" ? "nuevos" : "recientes"}...
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
