import { repositories } from "@/src/composition/repositories";
import { createListInboxUseCase } from "@/src/services/usecases/list-inbox";

const listInbox = createListInboxUseCase({
  applicationRepository: repositories.applicationRepository,
});

export default async function Home() {
  const { overdue } = await listInbox();
  const applications = await repositories.applicationRepository.list({});
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

  const jobs = await repositories.jobRepository.list({});
  const recentLogs =
    applications.length > 0
      ? await repositories.applicationLogRepository.listByApplicationId({
          applicationId: applications[0].id,
        })
      : [];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Descubre, prioriza y da seguimiento a tus postulaciones.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total postulaciones</p>
          <p className="text-2xl font-semibold">{totalApplications}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Entrevistas activas</p>
          <p className="text-2xl font-semibold">{activeInterviews}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Acciones vencidas</p>
          <p className="text-2xl font-semibold">{overdueCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Postulaciones semana</p>
          <p className="text-2xl font-semibold">{thisWeek}</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Top matches hoy</h2>
          <span className="text-xs text-muted-foreground">Basado en recientes</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Rol</th>
                <th className="px-3 py-2">Empresa</th>
                <th className="px-3 py-2">Fuente</th>
                <th className="px-3 py-2">Accion</th>
              </tr>
            </thead>
            <tbody>
              {jobs.slice(0, 5).map((job) => (
                <tr key={job.id} className="border-t border-border">
                  <td className="px-3 py-2">{job.role}</td>
                  <td className="px-3 py-2">{job.company}</td>
                  <td className="px-3 py-2 text-muted-foreground">{job.source}</td>
                  <td className="px-3 py-2">
                    <button className="rounded-md border border-border px-3 py-1 text-xs hover:bg-muted">
                      Guardar
                    </button>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-muted-foreground" colSpan={4}>
                    Sin trabajos para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  {new Date(entry.createdAt).toLocaleDateString("es-MX")}
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
