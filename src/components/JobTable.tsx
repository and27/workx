"use client";

import { useMemo, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Badge } from "@/components/ui/badge";
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
    formData: FormData
  ) => Promise<saveJobState>;
  variant: jobTableVariant;
};

const stopRowClick = (event: MouseEvent | KeyboardEvent) => {
  event.stopPropagation();
};

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
    [jobs, activeJobId]
  );

  const handleOpen = (jobId: string) => setActiveJobId(jobId);
  const handleClose = () => setActiveJobId(null);

  const emptyColSpan = variant === "home" ? 5 : 8;

  return (
    <>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Rol</TableHead>
            <TableHead>Empresa</TableHead>
            {variant === "list" && (
              <>
                <TableHead>Ubicacion</TableHead>
                <TableHead>Senioridad</TableHead>
                <TableHead>Tags</TableHead>
              </>
            )}
            <TableHead>Publicado</TableHead>
            <TableHead>Accion</TableHead>
            {variant === "list" && <TableHead>Fuente</TableHead>}
            {variant === "home" && <TableHead>Fuente</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
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
              <TableCell className="font-medium">
                {variant === "list" && job.sourceUrl ? (
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-4 hover:underline"
                    onClick={stopRowClick}
                    onKeyDown={stopRowClick}
                  >
                    {job.role}
                  </a>
                ) : (
                  job.role
                )}
              </TableCell>
              <TableCell>{job.company}</TableCell>
              {variant === "list" && (
                <>
                  <TableCell className="text-muted-foreground">
                    {job.location}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {job.seniority}
                  </TableCell>
                  <TableCell>
                    <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto pr-1">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </>
              )}
              <TableCell className="text-muted-foreground">
                {formatRelativeDate(job.publishedAt)}
              </TableCell>
              <TableCell onClick={stopRowClick} onKeyDown={stopRowClick}>
                <JobSaveForm
                  jobId={job.id}
                  saved={savedSet.has(job.id)}
                  action={action}
                />
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
            </TableRow>
          ))}
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
