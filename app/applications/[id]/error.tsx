"use client";

import { Button } from "@/components/ui/button";

type applicationDetailErrorProps = {
  reset: () => void;
};

export default function ApplicationDetailError({
  reset,
}: applicationDetailErrorProps) {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Postulacion</h1>
      <p className="text-sm text-muted-foreground">
        No pudimos cargar la postulacion. Intenta de nuevo.
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Reintentar
      </Button>
    </div>
  );
}
