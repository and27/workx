"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import JobSaveForm from "@/app/jobs/JobSaveForm";
import type { job } from "@/src/domain/entities/job";
import { formatRelativeDate } from "@/src/lib/format";
import type { saveJobState } from "@/app/jobs/actions";

type jobDetailDialogProps = {
  job: job | null;
  open: boolean;
  saved: boolean;
  action: (
    prevState: saveJobState | null,
    formData: FormData
  ) => Promise<saveJobState>;
  onClose: () => void;
  fetchOnOpen?: boolean;
};

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export default function JobDetailDialog({
  job,
  open,
  saved,
  action,
  onClose,
  fetchOnOpen = false,
}: jobDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [detailJob, setDetailJob] = useState<job | null>(job);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const activeJob = detailJob ?? job;
  const description = useMemo(() => {
    if (loadingDetail) return "Cargando detalle...";
    if (!activeJob?.description) return "Sin descripcion disponible.";
    const plainText = stripHtml(activeJob.description);
    return plainText.length > 0 ? plainText : "Sin descripcion disponible.";
  }, [activeJob, loadingDetail]);
  const publishedLabel = activeJob
    ? formatRelativeDate(activeJob.publishedAt)
    : "Sin fecha";
  const publishedText =
    publishedLabel === "Sin fecha"
      ? "Publicado sin fecha"
      : `Publicado ${publishedLabel.toLowerCase()}`;

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

  useEffect(() => {
    setDetailJob(job);
    setLoadingDetail(false);
  }, [job]);

  useEffect(() => {
    if (!open) {
      setLoadingDetail(false);
    }
  }, [open]);

  useEffect(() => {
    if (!fetchOnOpen || !open || !job) {
      return;
    }
    const controller = new AbortController();
    let active = true;
    setLoadingDetail(true);
    fetch(`/api/jobs/${job.id}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No pudimos cargar el detalle.");
        }
        return (await response.json()) as { ok: boolean; job?: job };
      })
      .then((payload) => {
        if (!active || !payload.ok || !payload.job) {
          return;
        }
        setDetailJob(payload.job);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setLoadingDetail(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [fetchOnOpen, open, job?.id]);

  if (!activeJob) {
    return null;
  }

  const titleId = `job-detail-title-${activeJob.id}`;
  const descriptionId = `job-detail-desc-${activeJob.id}`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="h-full w-full bg-transparent p-0 text-foreground backdrop:bg-black/40"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="flex h-full items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg border border-border bg-background p-0 text-foreground shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-border p-4">
            <div className="space-y-1">
              <h2 id={titleId} className="text-lg font-semibold">
                {activeJob.role}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeJob.company} • {activeJob.location}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeJob.seniority} • {activeJob.source} • {publishedText}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              {activeJob.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
              {activeJob.tags.length === 0 && (
                <span className="text-xs text-muted-foreground">Sin tags</span>
              )}
            </div>

            {(activeJob.triageStatus || activeJob.triageReasons?.length) && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Razones del triage</h3>
                <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  {activeJob.triageReasons &&
                  activeJob.triageReasons.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-4">
                      {activeJob.triageReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>Sin razones registradas.</span>
                  )}
                </div>
              </div>
            )}

            {(activeJob.rankScore !== null || activeJob.rankReason) && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Ranking</h3>
                <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <p>
                    {activeJob.rankScore !== null
                      ? `Score ${activeJob.rankScore}/100`
                      : "Sin score"}
                  </p>
                  {activeJob.rankReason && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {activeJob.rankReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Descripcion</h3>
              <div
                id={descriptionId}
                className="max-h-64 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground"
              >
                {description}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
            <div className="flex items-center gap-2">
              <JobSaveForm jobId={activeJob.id} saved={saved} action={action} />
            </div>
            {activeJob.sourceUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={activeJob.sourceUrl} target="_blank" rel="noopener">
                  Abrir vacante
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
