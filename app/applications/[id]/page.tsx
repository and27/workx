import { notFound } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  getApplication,
  listApplicationLogs,
  updateApplication,
} from "@/src/composition/usecases";

const statusOptions = [
  "saved",
  "applied",
  "screen",
  "tech",
  "offer",
  "rejected",
  "ghosted",
] as const;

const priorityOptions = ["low", "medium", "high"] as const;

type statusOption = (typeof statusOptions)[number];
type priorityOption = (typeof priorityOptions)[number];

const isStatusOption = (value: FormDataEntryValue | null): value is statusOption =>
  typeof value === "string" && statusOptions.includes(value as statusOption);

const isPriorityOption = (
  value: FormDataEntryValue | null
): value is priorityOption =>
  typeof value === "string" && priorityOptions.includes(value as priorityOption);

type applicationDetailProps = {
  params: {
    id: string;
  };
};

export default async function ApplicationDetailPage({
  params,
}: applicationDetailProps) {
  const application = await getApplication({ id: params.id });
  if (!application) {
    notFound();
  }

  const logs = await listApplicationLogs({ applicationId: application.id });

  async function saveChanges(formData: FormData) {
    "use server";
    const id = formData.get("applicationId");
    const status = formData.get("status");
    const priority = formData.get("priority");
    const nextActionAt = formData.get("nextActionAt");
    const notes = formData.get("notes");

    if (typeof id !== "string" || id.length === 0) {
      throw new Error("applicationId requerido.");
    }

    const result = await updateApplication({
      id,
      status: isStatusOption(status) ? status : undefined,
      priority: isPriorityOption(priority) ? priority : undefined,
      nextActionAt:
        typeof nextActionAt === "string" && nextActionAt.length > 0
          ? nextActionAt
          : null,
      notes: typeof notes === "string" ? notes : undefined,
    });

    if (!result.ok) {
      throw result.error;
    }

    revalidatePath(`/applications/${id}`);
    revalidatePath("/applications");
    revalidatePath("/inbox");
  }

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
        <form className="space-y-4" action={saveChanges}>
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
                    {new Date(entry.createdAt).toLocaleString("es-MX")}
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
