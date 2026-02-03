import ManualJobForm from "@/src/components/ManualJobForm";

export default function ManualPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Crear job</h1>
        <p className="text-sm text-muted-foreground">
          Agrega oportunidades que no vengan de una fuente automatica.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-6">
        <ManualJobForm />
      </section>
    </div>
  );
}
