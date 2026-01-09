"use client";

import { Button } from "@/components/ui/button";

type applicationsErrorProps = {
  reset: () => void;
};

export default function ApplicationsError({ reset }: applicationsErrorProps) {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Postulaciones</h1>
      <p className="text-sm text-muted-foreground">
        No pudimos cargar las postulaciones. Intenta de nuevo.
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Reintentar
      </Button>
    </div>
  );
}
