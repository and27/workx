"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type ingestSource = "all" | "Remotive" | "WWR" | "Web3" | "Remote OK";

type ingestPayload = {
  ok: boolean;
  fetched?: number;
  created?: number;
  updated?: number;
  used?: number;
  limit?: number;
  remaining?: number;
  error?: string;
};

type ingestStatusPayload = {
  ok: boolean;
  used?: number;
  limit?: number;
  remaining?: number;
  error?: string;
};

const DEFAULT_LIMIT = 50;

export default function IngestDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<ingestSource>("all");
  const [limitInput, setLimitInput] = useState(String(DEFAULT_LIMIT));
  const [pending, setPending] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(
    null
  );
  const [loadingUsage, setLoadingUsage] = useState(false);

  const limitValue = useMemo(() => {
    const parsed = Number(limitInput);
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

  const fetchUsage = async () => {
    setLoadingUsage(true);
    try {
      const response = await fetch("/api/ingest/status");
      const payload = (await response.json()) as ingestStatusPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "No pudimos cargar el estado.");
      }
      if (typeof payload.used === "number" && typeof payload.limit === "number") {
        setUsage({ used: payload.used, limit: payload.limit });
      }
    } catch {
      setUsage(null);
    } finally {
      setLoadingUsage(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsage();
    }
  }, [open]);

  const handleClose = () => setOpen(false);

  const handleIngest = async () => {
    if (pending) return;
    const limitReached =
      usage && usage.limit > 0 && usage.used >= usage.limit;
    if (limitReached) {
      toast({
        title: `Limite diario alcanzado (${usage.used}/${usage.limit}).`,
        variant: "destructive",
      });
      return;
    }
    if (!limitValue) {
      toast({
        title: "Limite invalido.",
        description: "Ingresa un numero mayor que 0.",
        variant: "destructive",
      });
      return;
    }

    setPending(true);
    try {
      const params = new URLSearchParams({
        source,
        limit: String(limitValue),
      });
      const response = await fetch(`/api/ingest?${params.toString()}`);
      const payload = (await response.json()) as ingestPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "No pudimos ingestar trabajos.");
      }

      toast({
        title: "Ingesta completada.",
        description: `Nuevos: ${payload.created ?? 0} • Actualizados: ${payload.updated ?? 0}`,
        variant: "success",
      });
      if (typeof payload.used === "number" && typeof payload.limit === "number") {
        setUsage({ used: payload.used, limit: payload.limit });
      } else {
        fetchUsage();
      }
      handleClose();
      router.refresh();
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "No pudimos ingestar trabajos.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        Ingestar
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
                <h2 className="text-lg font-semibold">Ingestar trabajos</h2>
                <p className="text-xs text-muted-foreground">
                  Selecciona la fuente y el limite para traer trabajos.
                </p>
                <div className="text-xs text-muted-foreground">
                  {loadingUsage ? (
                    "Cargando estado..."
                  ) : usage ? (
                    `Ingestas hoy: ${usage.used}/${usage.limit}`
                  ) : (
                    "Estado de ingestas no disponible"
                  )}
                </div>
                {usage && usage.limit > 0 && usage.used >= usage.limit && (
                  <p className="text-xs text-amber-600">
                    Limite diario alcanzado.
                  </p>
                )}
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

            <div className="space-y-4 p-4">
              <div>
                <label
                  className="text-xs text-muted-foreground"
                  htmlFor="ingest-source"
                >
                  Fuente
                </label>
                <Select
                  value={source}
                  onValueChange={(value) => setSource(value as ingestSource)}
                >
                  <SelectTrigger id="ingest-source" className="mt-1 w-full">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent portalContainer={dialogRef.current}>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Remotive">Remotive</SelectItem>
                    <SelectItem value="WWR">WWR</SelectItem>
                    <SelectItem value="Web3">Web3</SelectItem>
                    <SelectItem value="Remote OK">Remote OK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  className="text-xs text-muted-foreground"
                  htmlFor="ingest-limit"
                >
                  Limite
                </label>
                <Input
                  id="ingest-limit"
                  value={limitInput}
                  onChange={(event) => setLimitInput(event.target.value)}
                  inputMode="numeric"
                  className="mt-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ¿Quieres agregar un job manual?{" "}
                <Link
                  href="/manual"
                  onClick={handleClose}
                  className="font-medium text-foreground hover:underline"
                >
                  Ir a crear job
                </Link>
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
                onClick={handleIngest}
                disabled={
                  pending ||
                  (usage ? usage.limit > 0 && usage.used >= usage.limit : false)
                }
              >
                {pending ? "Ingestando..." : "Ingestar"}
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
