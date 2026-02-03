import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { unstable_cache } from "next/cache";
import { saveJobAction } from "@/app/jobs/actions";
import { getUseCases } from "@/src/composition/usecases";
import { HOME_CACHE_TAG, HOME_CACHE_TTL } from "@/src/lib/cache-tags";
import { formatDate } from "@/src/lib/format";
import JobTable from "@/src/components/JobTable";

const HOME_JOBS_LIMIT = 5;
const HOME_LOGS_LIMIT = 6;

const getHomeData = unstable_cache(
  async () => {
    const {
      listHomeOverview,
      listJobsPage,
      listApplicationLogs,
      listApplications,
    } = await getUseCases();
    const [overview, jobsPage] = await Promise.all([
      listHomeOverview(),
      listJobsPage({ page: 1, pageSize: HOME_JOBS_LIMIT }),
    ]);
    const jobs = jobsPage.items;
    const jobIds = jobs.map((job) => job.id);
    const savedJobIds =
      jobIds.length > 0
        ? Array.from(
            new Set(
              (await listApplications({ jobIds }))
                .map((application) => application.jobId)
                .filter((jobId): jobId is string => Boolean(jobId))
            )
          )
        : [];
    const recentLogs = overview.latestApplicationId
      ? await listApplicationLogs({
          applicationId: overview.latestApplicationId,
          limit: HOME_LOGS_LIMIT,
        })
      : [];
    return {
      overview,
      jobs,
      savedJobIds,
      recentLogs,
    };
  },
  ["home-data"],
  { revalidate: HOME_CACHE_TTL, tags: [HOME_CACHE_TAG] }
);

export default async function Home() {
  const { overview, jobs, savedJobIds, recentLogs } = await getHomeData();
  const {
    totalApplications,
    activeInterviews,
    overdueCount,
    thisWeek,
  } = overview;

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
        <Link
          href="/applications?recent=week"
          className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Card className="py-4">
            <CardContent className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Postulaciones esta semana
              </p>
              <p className="text-2xl font-semibold">{thisWeek}</p>
            </CardContent>
          </Card>
        </Link>
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
            jobs={jobs}
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
            {recentLogs.map((entry) => (
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
