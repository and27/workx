export default function HomeLoading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 rounded-md bg-muted" />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="h-20 rounded-lg border border-border bg-card" />
        <div className="h-20 rounded-lg border border-border bg-card" />
        <div className="h-20 rounded-lg border border-border bg-card" />
        <div className="h-20 rounded-lg border border-border bg-card" />
      </div>
      <div className="h-40 rounded-lg border border-border bg-card" />
      <div className="h-32 rounded-lg border border-border bg-card" />
    </div>
  );
}
