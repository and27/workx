"use client";

import { lazy, Suspense, useMemo, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import JobSaveForm from "@/app/jobs/JobSaveForm";
import type { job } from "@/src/domain/entities/job";
import { formatRelativeDate } from "@/src/lib/format";
import type { saveJobState } from "@/app/jobs/actions";

const LazyJobDetailDialog = lazy(() => import("@/src/components/JobDetailDialog"));

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

type jobDetailLoadingDialogProps = {
  job: job;
  onClose: () => void;
};

const JobDetailLoadingDialog = ({
  job,
  onClose,
}: jobDetailLoadingDialogProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-lg border border-border bg-background text-foreground shadow-xl">
      <div className="flex items-start justify-between gap-4 border-b border-border p-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{job.role}</h2>
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>
      <div className="p-4 text-sm text-muted-foreground">
        Cargando detalle...
      </div>
    </div>
  </div>
);

export default function JobTable({
  jobs,
  savedJobIds,
  action,
  variant,
}: jobTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const savedSet = useMemo(() => new Set(savedJobIds), [savedJobIds]);
  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === activeJobId) ?? null,
    [jobs, activeJobId],
  );

  const handleOpen = (jobId: string) => setActiveJobId(jobId);
  const handleClose = () => setActiveJobId(null);
  const handleOpenVacancy = (url?: string | null) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const emptyColSpan = variant === "home" ? 5 : 7;
  const sortKey = searchParams.get("sort");
  const sortOrder = searchParams.get("order") === "asc" ? "asc" : "desc";
  const isPublishedSort = sortKey === "publishedAt";
  const ariaSort =
    variant === "list"
      ? isPublishedSort
        ? sortOrder === "asc"
          ? "ascending"
          : "descending"
        : "none"
      : undefined;

  const handlePublishedSort = () => {
    if (variant !== "list") return;
    const params = new URLSearchParams(searchParams.toString());
    const nextOrder = !isPublishedSort
      ? "desc"
      : sortOrder === "desc"
        ? "asc"
        : "desc";
    params.set("sort", "publishedAt");
    params.set("order", nextOrder);
    params.delete("page");
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  };

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
            <TableHead aria-sort={ariaSort}>
              {variant === "list" ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
                  onClick={handlePublishedSort}
                >
                  <span>Publicado</span>
                  {isPublishedSort ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="size-3.5" />
                    ) : (
                      <ArrowDown className="size-3.5" />
                    )
                  ) : (
                    <ArrowUpDown className="size-3.5" />
                  )}
                </button>
              ) : (
                "Publicado"
              )}
            </TableHead>
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
                  <div className="flex items-center gap-2">
                    <JobSaveForm
                      jobId={job.id}
                      saved={savedSet.has(job.id)}
                      action={action}
                    />
                    {variant === "list" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleOpenVacancy(job.sourceUrl)}
                        disabled={!job.sourceUrl}
                        title={
                          job.sourceUrl
                            ? "Abrir vacante"
                            : "Vacante sin link"
                        }
                      >
                        <ExternalLink />
                        <span className="sr-only">Abrir vacante</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-xs overflow-hidden">
                  <div className="space-y-0">
                    {((job.needsRetriage && !isShortlist) ||
                      (triageInfo && !isShortlist)) && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground ">
                        {job.needsRetriage && !isShortlist && (
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
                          <span className="inline-flex items-center gap-1">
                            <span
                              className={`inline-flex size-5 shrink-0 items-center justify-center rounded border ${triageBadgeClass(job.triageStatus)}`}
                              title={triageInfo?.label}
                            >
                              <TriageIcon className="size-3" />
                              <span className="sr-only">
                                {triageInfo?.label}
                              </span>
                            </span>
                            {job.needsRetriage && (
                              <span
                                className={`inline-flex size-5 shrink-0 items-center justify-center rounded border ${retriageBadgeClass}`}
                                title="Re-analizar"
                              >
                                <RefreshCw className="size-3" />
                                <span className="sr-only">Re-analizar</span>
                              </span>
                            )}
                          </span>
                        )}
                        {job.role}
                      </div>
                      {isShortlist && job.rankScore !== null && (
                        <div className="text-xs text-muted-foreground">
                          Ranking {job.rankScore}/100
                        </div>
                      )}
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

      {selectedJob && (
        <Suspense
          fallback={
            <JobDetailLoadingDialog
              job={selectedJob}
              onClose={handleClose}
            />
          }
        >
          <LazyJobDetailDialog
            job={selectedJob}
            open
            saved={savedSet.has(selectedJob.id)}
            action={action}
            onClose={handleClose}
          />
        </Suspense>
      )}
    </>
  );
}
