import { saveJobAction } from "@/app/jobs/actions";
import { getUseCases } from "@/src/composition/usecases";
import IngestDialog from "@/src/components/IngestDialog";
import JobsFilters from "@/src/components/JobsFilters";
import JobTable from "@/src/components/JobTable";
import JobsPagination from "@/src/components/JobsPagination";
import TriageControls from "@/app/jobs/TriageControls";

type jobsPageProps = {
  searchParams?: Promise<{
    q?: string;
    source?: string;
    triage?: string;
    page?: string;
    pageSize?: string;
  }>;
};

const PAGE_SIZE_OPTIONS = [25, 50];
const DEFAULT_PAGE_SIZE = 25;

const parsePositiveInt = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export default async function JobsPage({ searchParams }: jobsPageProps) {
  const { listApplications, listJobs } = await getUseCases();
  const params = (await searchParams) ?? {};
  const search = params.q?.trim() ?? "";
  const rawSource = params.source;
  const rawTriage = params.triage;
  const requestedPage = parsePositiveInt(params.page);
  const requestedPageSize = parsePositiveInt(params.pageSize);
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
  const pageSize =
    requestedPageSize && PAGE_SIZE_OPTIONS.includes(requestedPageSize)
      ? requestedPageSize
      : DEFAULT_PAGE_SIZE;
  const totalJobs = jobs.length;
  const totalPages = Math.max(1, Math.ceil(totalJobs / pageSize));
  const currentPage = Math.min(Math.max(requestedPage ?? 1, 1), totalPages);
  const paginatedJobs = jobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
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
          jobs={paginatedJobs}
          savedJobIds={savedJobIds}
          action={saveJobAction}
          variant="list"
        />
        <JobsPagination
          total={totalJobs}
          page={currentPage}
          pageSize={pageSize}
          defaultPageSize={DEFAULT_PAGE_SIZE}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      </section>
    </div>
  );
}
