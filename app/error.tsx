"use client";

import { Button } from "@/components/ui/button";

type homeErrorProps = {
  reset: () => void;
};

export default function HomeError({ reset }: homeErrorProps) {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Inicio</h1>
      <p className="text-sm text-muted-foreground">
        No pudimos cargar la vista principal. Intenta de nuevo.
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Reintentar
      </Button>
    </div>
  );
}
