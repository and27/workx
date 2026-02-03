"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { emitRankStatus } from "@/src/lib/rank-status";

type rankPayload = {
  ok: boolean;
  processed?: number;
  ranked?: number;
  skipped?: number;
  provider?: string;
  error?: string;
};

export default function RankControls() {
  const router = useRouter();
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  const [limitInput, setLimitInput] = useState("");
  const [pending, setPending] = useState(false);

  const limitValue = useMemo(() => {
    const trimmed = limitInput.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return null;
    if (parsed <= 0) return null;
    return Math.floor(parsed);
  }, [limitInput]);

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

  const handleRank = async () => {
    if (pending) return;
    if (limitValue === null) {
      toast({
        title: "Limite invalido.",
        description: "Ingresa un numero mayor que 0 o deja vacio.",
        variant: "destructive",
      });
      return;
    }

    setPending(true);
    emitRankStatus(true);
    try {
      const response = await fetch("/api/rank/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          limitValue === undefined ? {} : { limit: limitValue }
        ),
      });
      const payload = (await response.json()) as rankPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "No pudimos rankear trabajos.");
      }

      const processed = payload.processed ?? 0;
      const ranked = payload.ranked ?? 0;
      const skipped = payload.skipped ?? 0;
      const provider = payload.provider ?? "proveedor";
      toast({
        title: "Ranking listo.",
        description: `Procesados: ${processed} • Actualizados: ${ranked} • Omitidos: ${skipped} • ${provider}`,
        variant: "success",
      });
      handleClose();
      router.refresh();
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "No pudimos rankear trabajos.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
      emitRankStatus(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Rankear
      </Button>

      <dialog
        ref={dialogRef}
        className="w-full h-full bg-transparent p-0 text-foreground backdrop:bg-black/40"
        onCancel={(event) => {
          event.preventDefault();
          handleClose();
        }}
      >
        <div className="flex h-full items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-0 text-foreground shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-border p-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Rankear seleccionados</h2>
                <p className="text-xs text-muted-foreground">
                  Ordena los shortlist usando el proveedor configurado.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                Cerrar
              </Button>
            </div>

            <div className="space-y-2 p-4">
              <label className="text-xs text-muted-foreground" htmlFor="rank-limit">
                Limite (opcional)
              </label>
              <Input
                id="rank-limit"
                value={limitInput}
                onChange={(event) => setLimitInput(event.target.value)}
                inputMode="numeric"
                placeholder="Sin limite"
              />
              <p className="text-xs text-muted-foreground">
                Deja vacio para rankear todos los shortlist.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border p-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRank}
                disabled={pending}
              >
                {pending ? "Ranking..." : "Rankear"}
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
