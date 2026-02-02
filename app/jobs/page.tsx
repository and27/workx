import { saveJobAction } from "@/app/jobs/actions";
import { getUseCases } from "@/src/composition/usecases";
import IngestDialog from "@/src/components/IngestDialog";
import JobsFilters from "@/src/components/JobsFilters";
import JobTable from "@/src/components/JobTable";
import TriageControls from "@/app/jobs/TriageControls";

type jobsPageProps = {
  searchParams?: Promise<{
    q?: string;
    source?: string;
    triage?: string;
  }>;
};

export default async function JobsPage({ searchParams }: jobsPageProps) {
  const { listApplications, listJobs } = await getUseCases();
  const params = (await searchParams) ?? {};
  const search = params.q?.trim() ?? "";
  const rawSource = params.source;
  const rawTriage = params.triage;
  const triageValue = rawTriage?.trim() || "shortlist";
  const source = rawSource && rawSource !== "all" ? rawSource : undefined;
  const needsRetriage = triageValue === "retriage" ? true : undefined;
  const triageStatus =
    triageValue === "shortlist" ||
    triageValue === "maybe" ||
    triageValue === "reject"
      ? triageValue
      : undefined;

  const jobs = await listJobs({
    search: search || undefined,
    source,
    triageStatus,
    needsRetriage,
  });
  const allJobs = await listJobs();
  const applications = await listApplications();
  const savedJobIds = applications
    .map((application) => application.jobId)
    .filter((jobId): jobId is string => Boolean(jobId));

  const sources = Array.from(new Set(allJobs.map((job) => job.source))).sort();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Trabajos</h1>
          <p className="text-sm text-muted-foreground">
            Revisa oportunidades y conviertelas en postulaciones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IngestDialog />
          <TriageControls />
        </div>
      </header>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-end gap-3 border-b border-border px-4 py-3">
          <JobsFilters
            sources={sources}
            initialSearch={search}
            initialSource={rawSource ?? "all"}
            initialTriage={triageValue}
          />
        </div>

        <JobTable
          jobs={jobs}
          savedJobIds={savedJobIds}
          action={saveJobAction}
          variant="list"
        />
      </section>
    </div>
  );
}
