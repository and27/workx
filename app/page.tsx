import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { saveJobAction } from "@/app/jobs/actions";
import { getUseCases } from "@/src/composition/usecases";

import { formatDate } from "@/src/lib/format";
import JobTable from "@/src/components/JobTable";

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
  const savedJobIds = applications
    .map((application) => application.jobId)
    .filter((jobId): jobId is string => Boolean(jobId));
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
          <JobTable
            jobs={jobs.slice(0, 5)}
            savedJobIds={savedJobIds}
            action={saveJobAction}
            variant="home"
          />
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
