"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

type manualJobPayload = {
  ok: boolean;
  jobId?: string;
  triage?: {
    attempted: boolean;
    updated: boolean;
    error?: string;
  };
  triageStatus?: string | null;
  error?: string;
};

const DEFAULT_LOCATION = "Remoto";

export default function ManualJobDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [seniority, setSeniority] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [autoTriage, setAutoTriage] = useState(true);
  const [pending, setPending] = useState(false);

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

  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags]
  );

  const handleCreate = async () => {
    if (pending) return;
    const trimmedRole = role.trim();
    const trimmedCompany = company.trim();
    if (!trimmedRole) {
      toast({
        title: "El rol es requerido.",
        variant: "destructive",
      });
      return;
    }
    if (!trimmedCompany) {
      toast({
        title: "La empresa es requerida.",
        variant: "destructive",
      });
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/jobs/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: trimmedRole,
          company: trimmedCompany,
          sourceUrl: sourceUrl.trim() || null,
          location: location.trim() || DEFAULT_LOCATION,
          seniority: seniority.trim() || null,
          tags: tagList,
          description: description.trim() || null,
          autoTriage,
        }),
      });
      const payload = (await response.json()) as manualJobPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "No pudimos crear el job.");
      }

      const triage = payload.triage;
      let descriptionText = "Job creado.";
      if (triage?.attempted) {
        if (triage.updated) {
          descriptionText = `Job creado • Triage: ${payload.triageStatus ?? "actualizado"}`;
        } else if (triage.error) {
          descriptionText = `Job creado • Triage omitido: ${triage.error}`;
        } else {
          descriptionText = "Job creado • Triage omitido.";
        }
      }

      toast({
        title: "Manual agregado.",
        description: descriptionText,
        variant: "success",
      });
      handleClose();
      setRole("");
      setCompany("");
      setSourceUrl("");
      setLocation(DEFAULT_LOCATION);
      setSeniority("");
      setTags("");
      setDescription("");
      setAutoTriage(true);
      router.refresh();
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "No pudimos crear el job.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Manual
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
          <div className="w-full max-w-xl rounded-lg border border-border bg-background p-0 text-foreground shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-border p-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Agregar job manual</h2>
                <p className="text-xs text-muted-foreground">
                  Crea una oportunidad fuera de las fuentes actuales.
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

            <div className="grid gap-4 p-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground" htmlFor="job-role">
                  Rol
                </label>
                <Input
                  id="job-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground" htmlFor="job-company">
                  Empresa
                </label>
                <Input
                  id="job-company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-muted-foreground" htmlFor="job-url">
                  Link (opcional)
                </label>
                <Input
                  id="job-url"
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground" htmlFor="job-location">
                  Ubicacion
                </label>
                <Input
                  id="job-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground" htmlFor="job-seniority">
                  Senioridad
                </label>
                <Input
                  id="job-seniority"
                  value={seniority}
                  onChange={(event) => setSeniority(event.target.value)}
                  placeholder="Mid, Senior..."
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-muted-foreground" htmlFor="job-tags">
                  Tags (coma separada)
                </label>
                <Input
                  id="job-tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="React, TypeScript, Backend"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-muted-foreground" htmlFor="job-description">
                  JD / Descripcion
                </label>
                <Textarea
                  id="job-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="job-auto-triage"
                  type="checkbox"
                  className="size-4"
                  checked={autoTriage}
                  onChange={(event) => setAutoTriage(event.target.checked)}
                />
                <label
                  htmlFor="job-auto-triage"
                  className="text-xs text-muted-foreground"
                >
                  Auto-analizar si hay JD suficiente
                </label>
              </div>
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
                onClick={handleCreate}
                disabled={pending}
              >
                {pending ? "Guardando..." : "Crear job"}
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
