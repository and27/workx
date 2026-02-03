import ApplicationsFilters from "@/src/components/ApplicationsFilters";
import ApplicationsTable from "@/src/components/ApplicationsTable";
import { applicationStatus } from "@/src/domain/types/application-status";
import { priority } from "@/src/domain/types/priority";
import { getUseCases } from "@/src/composition/usecases";

type applicationsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: applicationStatus | "all";
    priority?: priority | "all";
    recent?: string;
  }>;
};

export default async function ApplicationsPage({
  searchParams,
}: applicationsPageProps) {
  const { listApplications } = await getUseCases();
  const params = (await searchParams) ?? {};
  const search = params.q?.trim() ?? "";
  const rawStatus = params.status;
  const rawPriority = params.priority;
  const recent = params.recent;
  const status = rawStatus && rawStatus !== "all" ? rawStatus : undefined;
  const priority =
    rawPriority && rawPriority !== "all" ? rawPriority : undefined;
  const updatedAfter =
    recent === "week"
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

  const applications = await listApplications({
    search: search || undefined,
    status,
    priority,
    updatedAfter,
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Postulaciones</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona el estado y las prioridades de tu pipeline.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-end gap-3 border-b border-border px-4 py-3">
          <ApplicationsFilters
            initialSearch={search}
            initialStatus={(rawStatus ?? "all") as applicationStatus | "all"}
            initialPriority={(rawPriority ?? "all") as priority | "all"}
          />
        </div>
        <ApplicationsTable applications={applications} />
      </section>
    </div>
  );
}
