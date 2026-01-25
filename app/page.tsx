import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import JobSaveForm from "@/app/jobs/JobSaveForm";
import { saveJobAction } from "@/app/jobs/actions";
import { getUseCases } from "@/src/composition/usecases";

import { formatDate, formatRelativeDate } from "@/src/lib/format";

export default async function Home() {
  const { listInbox, listApplications, listJobs, listApplicationLogs } =
    await getUseCases();
  const { overdue } = await listInbox();
  const applications = await listApplications();
  const totalApplications = applications.length;
  const activeInterviews = applications.filter(
    (item) => item.status === "screen" || item.status === "tech"
  ).length;
  const overdueCount = overdue.length;
  const thisWeek = applications.filter((item) => {
    if (!item.updatedAt) {
      return false;
    }
    const updated = new Date(item.updatedAt);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 7;
  }).length;

  const jobs = await listJobs();
  const savedJobIds = new Set(
    applications
      .map((application) => application.jobId)
      .filter((jobId): jobId is string => Boolean(jobId))
  );
  const recentLogs =
    applications.length > 0
      ? await listApplicationLogs({ applicationId: applications[0].id })
      : [];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Inicio</h1>
        <p className="text-sm text-muted-foreground">
          Descubre, prioriza y da seguimiento a tus postulaciones.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="py-4">
          <CardContent className="space-y-1">
            <p className="text-xs text-muted-foreground">Total postulaciones</p>
            <p className="text-2xl font-semibold">{totalApplications}</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="space-y-1">
            <p className="text-xs text-muted-foreground">Entrevistas activas</p>
            <p className="text-2xl font-semibold">{activeInterviews}</p>
          </CardContent>
        </Card>
        <Link
          href="/inbox?filter=overdue"
          className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Card className="py-4">
            <CardContent className="space-y-1">
              <p className="text-xs text-muted-foreground">Acciones vencidas</p>
              <p className="text-2xl font-semibold">{overdueCount}</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="py-4">
          <CardContent className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Postulaciones esta semana
            </p>
            <p className="text-2xl font-semibold">{thisWeek}</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mejores coincidencias hoy</h2>
          <span className="text-xs text-muted-foreground">
            Basado en actividad reciente
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
              <TableHead>Rol</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Publicado</TableHead>
              <TableHead>Accion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.slice(0, 5).map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.role}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell className="text-muted-foreground">
                  {job.source}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeDate(job.publishedAt)}
                </TableCell>
                <TableCell>
                  <JobSaveForm
                    jobId={job.id}
                    saved={savedJobIds.has(job.id)}
                    action={saveJobAction}
                  />
                </TableCell>
              </TableRow>
            ))}
            {jobs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-4 text-sm text-muted-foreground"
                >
                  Sin trabajos para mostrar.
                </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Actividad reciente</h2>
          <span className="text-xs text-muted-foreground">Ultimos eventos</span>
        </div>
        <div className="rounded-lg border border-border">
          <ul className="divide-y divide-border text-sm">
            {recentLogs.slice(0, 6).map((entry) => (
              <li key={entry.id} className="px-4 py-3">
                <p className="text-sm">{entry.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(entry.createdAt)}
                </p>
              </li>
            ))}
            {recentLogs.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                Sin actividad reciente.
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
