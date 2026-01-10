import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { dateOnly } from "@/src/domain/types/date-only";
import { getUseCases } from "@/src/composition/usecases";
import { markDoneAction, rescheduleAction } from "@/app/inbox/actions";

type inboxSectionProps = {
  title: string;
  emptyLabel: string;
  items: {
    id: string;
    company: string;
    role: string;
    status: string;
    nextActionAt: dateOnly | null;
  }[];
  onMarkDone: (formData: FormData) => Promise<void>;
  onReschedule: (formData: FormData) => Promise<void>;
};

const InboxSection = ({
  title,
  emptyLabel,
  items,
  onMarkDone,
  onReschedule,
}: inboxSectionProps) => (
  <Card>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="divide-y divide-border rounded-md border border-border">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-4 p-3">
            <div className="min-w-[220px] flex-1">
              <p className="text-sm font-medium">
                {item.company} - {item.role}
              </p>
              <p className="text-xs text-muted-foreground">
                Siguiente accion: {item.nextActionAt ?? "-"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{item.status}</Badge>
              <span className="text-xs text-muted-foreground">
                {item.nextActionAt ?? "-"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <form action={onMarkDone}>
                <input type="hidden" name="applicationId" value={item.id} />
                <Button type="submit" variant="outline" size="sm">
                  Marcar hecho
                </Button>
              </form>
              <form action={onReschedule} className="flex items-center gap-2">
                <input type="hidden" name="applicationId" value={item.id} />
                <Input
                  type="date"
                  name="nextActionAt"
                  defaultValue={item.nextActionAt ?? undefined}
                  className="h-8 w-[150px] text-xs"
                />
                <Button type="submit" variant="outline" size="sm">
                  Reprogramar
                </Button>
              </form>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="px-3 py-6 text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default async function InboxPage() {
  const { listInbox } = await getUseCases();
  const { overdue, today, upcoming } = await listInbox();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Acciones de seguimiento para hoy y proximos dias.
        </p>
      </header>

      <div className="grid gap-4">
        <InboxSection
          title="Vencidas"
          emptyLabel="No tienes acciones vencidas."
          items={overdue}
          onMarkDone={markDoneAction}
          onReschedule={rescheduleAction}
        />
        <InboxSection
          title="Hoy"
          emptyLabel="Sin acciones para hoy."
          items={today}
          onMarkDone={markDoneAction}
          onReschedule={rescheduleAction}
        />
        <InboxSection
          title="Proximas"
          emptyLabel="Sin acciones proximas."
          items={upcoming}
          onMarkDone={markDoneAction}
          onReschedule={rescheduleAction}
        />
      </div>
    </div>
  );
}
