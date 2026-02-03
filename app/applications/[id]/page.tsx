import { notFound } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/src/lib/format";
import { getUseCases } from "@/src/composition/usecases";
import ApplicationJobDetail from "@/src/components/ApplicationJobDetail";
import { saveJobAction } from "@/app/jobs/actions";
import {
  priorityOptions,
  statusOptions,
} from "@/app/applications/[id]/options";
import { saveChangesAction } from "@/app/applications/[id]/actions";

type applicationDetailProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ApplicationDetailPage({
  params,
}: applicationDetailProps) {
  const { listApplicationLogs, getApplication, getJob } = await getUseCases();
  const routeParams = await params;
  const application = await getApplication({ id: routeParams.id });
  if (!application) {
    notFound();
  }

  const [job, logs] = await Promise.all([
    application.jobId ? getJob({ id: application.jobId }) : Promise.resolve(null),
    listApplicationLogs({ applicationId: application.id }),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {application.company} - {application.role}
        </h1>
        <p className="text-sm text-muted-foreground">
          Seguimiento y decisiones de la postulacion.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-4">
        <form className="space-y-4" action={saveChangesAction}>
          <input type="hidden" name="applicationId" value={application.id} />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="status">
                Estado
              </label>
              <Select name="status" defaultValue={application.status}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="priority"
              >
                Prioridad
              </label>
              <Select name="priority" defaultValue={application.priority}>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="nextActionAt"
              >
                Siguiente accion
              </label>
              <Input
                type="date"
                id="nextActionAt"
                name="nextActionAt"
                defaultValue={application.nextActionAt ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground" htmlFor="notes">
              Notas
            </label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={application.notes}
              placeholder="Escribe notas clave sobre la postulacion"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="outline" size="sm">
              Guardar cambios
            </Button>
          </div>
        </form>

        {job && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3">
            <div>
              <p className="text-sm font-medium">Vacante asociada</p>
              <p className="text-xs text-muted-foreground">
                {job.role} · {job.company}
              </p>
            </div>
            <ApplicationJobDetail
              job={job}
              saved={Boolean(application.jobId)}
              action={saveJobAction}
            />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Historial</h2>
          <Badge variant="outline">{logs.length} eventos</Badge>
        </div>
        <div className="rounded-lg border border-border bg-card">
          <ul className="divide-y divide-border">
            {logs.map((entry) => (
              <li key={entry.id} className="space-y-2 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{entry.message}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">{entry.type}</p>
              </li>
            ))}
            {logs.length === 0 && (
              <li className="px-4 py-6 text-sm text-muted-foreground">
                Sin actividad registrada.
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
