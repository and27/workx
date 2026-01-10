import Link from "next/link";
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
import { applicationStatus } from "@/src/domain/types/application-status";
import { priority } from "@/src/domain/types/priority";
import { formatDate } from "@/src/lib/format";
import { getUseCases } from "@/src/composition/usecases";

type applicationsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: applicationStatus | "all";
    priority?: priority | "all";
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
  const status = rawStatus && rawStatus !== "all" ? rawStatus : undefined;
  const priority =
    rawPriority && rawPriority !== "all" ? rawPriority : undefined;

  const applications = await listApplications({
    search: search || undefined,
    status,
    priority,
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
              <label className="text-xs text-muted-foreground" htmlFor="status">
                Estado
              </label>
              <Select name="status" defaultValue={rawStatus ?? "all"}>
                <SelectTrigger id="status" className="mt-1 w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="saved">saved</SelectItem>
                  <SelectItem value="applied">applied</SelectItem>
                  <SelectItem value="screen">screen</SelectItem>
                  <SelectItem value="tech">tech</SelectItem>
                  <SelectItem value="offer">offer</SelectItem>
                  <SelectItem value="rejected">rejected</SelectItem>
                  <SelectItem value="ghosted">ghosted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px]">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="priority"
              >
                Prioridad
              </label>
              <Select name="priority" defaultValue={rawPriority ?? "all"}>
                <SelectTrigger id="priority" className="mt-1 w-full">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">low</SelectItem>
                  <SelectItem value="medium">medium</SelectItem>
                  <SelectItem value="high">high</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="outline" size="sm">
                Filtrar
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/applications">Limpiar</Link>
              </Button>
            </div>
          </form>
        </div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Siguiente accion</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Actualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span
                    className="block max-w-[180px] truncate"
                    title={item.company}
                  >
                    {item.company}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/applications/${item.id}`}
                    className="block max-w-[220px] truncate text-sm font-medium hover:underline"
                    title={item.role}
                  >
                    {item.role}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.priority}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.nextActionAt ?? "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.source}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
            {applications.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Sin postulaciones para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
