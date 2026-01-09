"use client";

import { Button } from "@/components/ui/button";

type jobsErrorProps = {
  reset: () => void;
};

export default function JobsError({ reset }: jobsErrorProps) {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Trabajos</h1>
      <p className="text-sm text-muted-foreground">
        No pudimos cargar los trabajos. Intenta de nuevo.
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Reintentar
      </Button>
    </div>
  );
}
