"use client";

import { useEffect, useMemo, useRef } from "react";
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
};

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export default function JobDetailDialog({
  job,
  open,
  saved,
  action,
  onClose,
}: jobDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const description = useMemo(() => {
    if (!job?.description) return "Sin descripcion disponible.";
    const plainText = stripHtml(job.description);
    return plainText.length > 0 ? plainText : "Sin descripcion disponible.";
  }, [job]);
  const publishedLabel = job
    ? formatRelativeDate(job.publishedAt)
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

  if (!job) {
    return null;
  }

  const titleId = `job-detail-title-${job.id}`;
  const descriptionId = `job-detail-desc-${job.id}`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="w-full max-w-2xl rounded-lg border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40"
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
      <div className="flex items-start justify-between gap-4 border-b border-border p-4">
        <div className="space-y-1">
          <h2 id={titleId} className="text-lg font-semibold">
            {job.role}
          </h2>
          <p className="text-sm text-muted-foreground">
            {job.company} • {job.location}
          </p>
          <p className="text-xs text-muted-foreground">
            {job.seniority} • {job.source} • {publishedText}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          {job.tags.length === 0 && (
            <span className="text-xs text-muted-foreground">Sin tags</span>
          )}
        </div>

        {(job.triageStatus || job.triageReasons?.length) && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Razones del triage</h3>
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              {job.triageReasons && job.triageReasons.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4">
                  {job.triageReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <span>Sin razones registradas.</span>
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
          <JobSaveForm jobId={job.id} saved={saved} action={action} />
        </div>
        {job.sourceUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={job.sourceUrl} target="_blank" rel="noopener">
              Abrir vacante
            </a>
          </Button>
        )}
      </div>
    </dialog>
  );
}
