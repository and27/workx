import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createApplicationFromJob, listJobs } from "@/src/composition/usecases";

type jobsPageProps = {
  searchParams?: {
    q?: string;
    source?: string;
    seniority?: string;
  };
};

export default async function JobsPage({ searchParams }: jobsPageProps) {
  const search = searchParams?.q?.trim() ?? "";
  const rawSource = searchParams?.source;
  const rawSeniority = searchParams?.seniority;
  const source = rawSource && rawSource !== "all" ? rawSource : undefined;
  const seniority =
    rawSeniority && rawSeniority !== "all" ? rawSeniority : undefined;

  const jobs = await listJobs({
    search: search || undefined,
    source,
    seniority,
  });
  const allJobs = await listJobs();

  const sources = Array.from(new Set(allJobs.map((job) => job.source))).sort();
  const seniorities = Array.from(
    new Set(allJobs.map((job) => job.seniority))
  ).sort();

  async function saveJob(formData: FormData) {
    "use server";
    const jobId = formData.get("jobId");
    if (typeof jobId !== "string" || jobId.length === 0) {
      throw new Error("Job id requerido.");
    }
    const result = await createApplicationFromJob({ jobId });
    if (!result.ok) {
      throw result.error;
    }
    revalidatePath("/jobs");
    revalidatePath("/applications");
  }

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
              <label className="text-xs text-muted-foreground" htmlFor="seniority">
                Seniority
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
            <div className="flex items-center gap-2">
              <Button type="submit" variant="outline" size="sm">
                Filtrar
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/jobs">Limpiar</Link>
              </Button>
            </div>
          </form>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Rol</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Ubicacion</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Accion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.role}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell className="text-muted-foreground">
                  {job.source}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {job.location}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {job.seniority}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <form action={saveJob}>
                    <input type="hidden" name="jobId" value={job.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Guardar como postulacion
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {jobs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Sin trabajos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
