import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ApplicationsFilters from "@/src/components/ApplicationsFilters";
import ApplicationAgentActions from "@/src/components/ApplicationAgentActions";
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
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Acciones</TableHead>
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
                  <ApplicationAgentActions jobId={item.jobId} />
                </TableCell>
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
                  colSpan={8}
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
