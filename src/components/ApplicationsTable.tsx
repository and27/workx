"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import ApplicationAgentActions from "@/src/components/ApplicationAgentActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/src/lib/format";
import type { application } from "@/src/domain/entities/application";

type applicationsTableProps = {
  applications: application[];
};

export default function ApplicationsTable({
  applications,
}: applicationsTableProps) {
  const router = useRouter();

  return (
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
          <TableRow
            key={item.id}
            tabIndex={0}
            role="button"
            className="cursor-pointer transition hover:bg-muted/30"
            onClick={() => router.push(`/applications/${item.id}`)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(`/applications/${item.id}`);
              }
            }}
          >
            <TableCell
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
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
              <span
                className="block max-w-[220px] truncate text-sm font-medium"
                title={item.role}
              >
                {item.role}
              </span>
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
  );
}
