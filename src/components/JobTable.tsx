"use client";

import { useMemo, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import JobSaveForm from "@/app/jobs/JobSaveForm";
import JobDetailDialog from "@/src/components/JobDetailDialog";
import type { job } from "@/src/domain/entities/job";
import { formatRelativeDate } from "@/src/lib/format";
import type { saveJobState } from "@/app/jobs/actions";

type jobTableVariant = "home" | "list";

type jobTableProps = {
  jobs: job[];
  savedJobIds: string[];
  action: (
    prevState: saveJobState | null,
    formData: FormData,
  ) => Promise<saveJobState>;
  variant: jobTableVariant;
};

const stopRowClick = (event: MouseEvent | KeyboardEvent) => {
  event.stopPropagation();
};

const triageDisplay = (status: job["triageStatus"]) => {
  if (status === "shortlist") {
    return { label: "Seleccionado", icon: Check };
  }
  if (status === "maybe") return { label: "Quizas" };
  if (status === "reject") return { label: "Rechazado" };
  return null;
};

const triageBadgeClass = (status: job["triageStatus"]) => {
  if (status === "shortlist") return "border-chart-2 text-chart-2";
  return "";
};

const retriageBadgeClass = "border-amber-400 text-amber-600";

export default function JobTable({
  jobs,
  savedJobIds,
  action,
  variant,
}: jobTableProps) {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const savedSet = useMemo(() => new Set(savedJobIds), [savedJobIds]);
  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === activeJobId) ?? null,
    [jobs, activeJobId],
  );

  const handleOpen = (jobId: string) => setActiveJobId(jobId);
  const handleClose = () => setActiveJobId(null);

  const emptyColSpan = variant === "home" ? 5 : 7;

  return (
    <>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Acción</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Empresa</TableHead>
            {variant === "list" && (
              <>
                <TableHead>Senioridad</TableHead>
              </>
            )}
            <TableHead>Publicado</TableHead>
            {variant === "list" && <TableHead>Fuente</TableHead>}
            {variant === "home" && <TableHead>Fuente</TableHead>}
            {variant === "list" && <TableHead>Tags</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const triageInfo = triageDisplay(job.triageStatus);
            const TriageIcon = triageInfo?.icon;
            const isShortlist = job.triageStatus === "shortlist";
            return (
              <TableRow
                key={job.id}
              tabIndex={0}
              role="button"
              className="cursor-pointer transition hover:bg-muted/30"
              onClick={() => handleOpen(job.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpen(job.id);
                }
              }}
              >
              <TableCell onClick={stopRowClick} onKeyDown={stopRowClick}>
                <JobSaveForm
                  jobId={job.id}
                  saved={savedSet.has(job.id)}
                  action={action}
                />
              </TableCell>
              <TableCell className="font-medium max-w-xs overflow-hidden">
                <div className="space-y-0">
                  {(job.needsRetriage || (triageInfo && !isShortlist)) && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground ">
                      {job.needsRetriage && (
                        <Badge
                          variant="outline"
                          className={`${retriageBadgeClass} px-2`}
                          title="Re-analizar"
                        >
                          <RefreshCw className="size-3" />
                          <span className="sr-only">Re-analizar</span>
                        </Badge>
                      )}
                      {triageInfo && !isShortlist && (
                        <Badge
                          variant="outline"
                          className={`${triageBadgeClass(job.triageStatus)} px-2`}
                          title={triageInfo.label}
                        >
                          {triageInfo.label}
                        </Badge>
                      )}
                    </div>
                  )}
                  {!triageInfo && job.needsRetriage && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className={`${retriageBadgeClass} px-2`}
                        title="Re-analizar"
                      >
                        <RefreshCw className="size-3" />
                        <span className="sr-only">Re-analizar</span>
                      </Badge>
                    </div>
                  )}
                  <div className="space-y-1 pl-1">
                    <div className="flex items-center gap-2 truncate">
                      {isShortlist && TriageIcon && (
                        <span
                          className={`inline-flex size-5 shrink-0 items-center justify-center rounded border ${triageBadgeClass(job.triageStatus)}`}
                          title={triageInfo?.label}
                        >
                          <TriageIcon className="size-3" />
                          <span className="sr-only">{triageInfo?.label}</span>
                        </span>
                      )}
                      {variant === "list" && job.sourceUrl ? (
                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noopener"
                          className="underline-offset-4 hover:underline truncate"
                          onClick={stopRowClick}
                          onKeyDown={stopRowClick}
                        >
                          {job.role}
                        </a>
                      ) : (
                        job.role
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-40">
                <div className="space-y-1">
                  <div className="font-medium">{job.company}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {job.location}
                  </div>
                </div>
              </TableCell>
              {variant === "list" && (
                <>
                  <TableCell className="text-muted-foreground">
                    {job.seniority}
                  </TableCell>
                </>
              )}
              <TableCell className="text-muted-foreground">
                {formatRelativeDate(job.publishedAt)}
              </TableCell>
              {variant === "list" && (
                <TableCell className="text-muted-foreground">
                  {job.source}
                </TableCell>
              )}
              {variant === "home" && (
                <TableCell className="text-muted-foreground">
                  {job.source}
                </TableCell>
              )}
              {variant === "list" && (
                <TableCell className="min-w-[240px]">
                  <div className="flex max-h-12 flex-wrap gap-1 overflow-hidden pr-1">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              )}
              </TableRow>
            );
          })}
          {jobs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={emptyColSpan}
                className="py-4 text-sm text-muted-foreground"
              >
                Sin trabajos para mostrar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <JobDetailDialog
        job={selectedJob}
        open={Boolean(selectedJob)}
        saved={selectedJob ? savedSet.has(selectedJob.id) : false}
        action={action}
        onClose={handleClose}
      />
    </>
  );
}
