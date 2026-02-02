import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveJobAction } from "@/app/jobs/actions";
import { getUseCases } from "@/src/composition/usecases";
import IngestControls from "@/src/components/IngestControls";
import JobTable from "@/src/components/JobTable";
import TriageControls from "@/app/jobs/TriageControls";

type jobsPageProps = {
  searchParams?: Promise<{
    q?: string;
    source?: string;
    seniority?: string;
    triage?: string;
  }>;
};

export default async function JobsPage({ searchParams }: jobsPageProps) {
  const { listApplications, listJobs } = await getUseCases();
  const params = (await searchParams) ?? {};
  const search = params.q?.trim() ?? "";
  const rawSource = params.source;
  const rawSeniority = params.seniority;
  const rawTriage = params.triage;
  const source = rawSource && rawSource !== "all" ? rawSource : undefined;
  const seniority =
    rawSeniority && rawSeniority !== "all" ? rawSeniority : undefined;
  const needsRetriage = rawTriage === "retriage" ? true : undefined;
  const triageStatus =
    rawTriage === "shortlist" ||
    rawTriage === "maybe" ||
    rawTriage === "reject"
      ? rawTriage
      : undefined;

  const jobs = await listJobs({
    search: search || undefined,
    source,
    seniority,
    triageStatus,
    needsRetriage,
  });
  const allJobs = await listJobs();
  const applications = await listApplications();
  const savedJobIds = applications
    .map((application) => application.jobId)
    .filter((jobId): jobId is string => Boolean(jobId));

  const sources = Array.from(new Set(allJobs.map((job) => job.source))).sort();
  const seniorities = Array.from(
    new Set(allJobs.map((job) => job.seniority))
  ).sort();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Trabajos</h1>
        <p className="text-sm text-muted-foreground">
          Revisa oportunidades y conviertelas en postulaciones.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-end gap-3 border-b border-border px-4 py-3">
          <form className="flex flex-1 flex-wrap items-end gap-3" method="get">
            <div className="min-w-[200px] flex-1">
              <label className="text-xs text-muted-foreground" htmlFor="q">
                Buscar
              </label>
              <Input
                id="q"
                name="q"
                defaultValue={search}
                className="mt-1"
                placeholder="Empresa o rol"
              />
            </div>
            <div className="min-w-[160px]">
              <label className="text-xs text-muted-foreground" htmlFor="source">
                Fuente
              </label>
              <Select name="source" defaultValue={rawSource ?? "all"}>
                <SelectTrigger id="source" className="mt-1 w-full">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {sources.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[160px]">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="seniority"
              >
                Senioridad
              </label>
              <Select name="seniority" defaultValue={rawSeniority ?? "all"}>
                <SelectTrigger id="seniority" className="mt-1 w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {seniorities.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[160px]">
              <label className="text-xs text-muted-foreground" htmlFor="triage">
                Triage
              </label>
              <Select name="triage" defaultValue={rawTriage ?? "all"}>
                <SelectTrigger id="triage" className="mt-1 w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="shortlist">Seleccionados</SelectItem>
                  <SelectItem value="maybe">Quizas</SelectItem>
                  <SelectItem value="reject">Rechazados</SelectItem>
                  <SelectItem value="retriage">Re-analizar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="outline" size="sm">
                Filtrar
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/jobs">Limpiar</Link>
              </Button>
            </div>
          </form>
          <div className="flex flex-wrap items-end gap-3">
            <IngestControls />
            <TriageControls />
          </div>
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
