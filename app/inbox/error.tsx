"use client";

import { Button } from "@/components/ui/button";

type inboxErrorProps = {
  reset: () => void;
};

export default function InboxError({ reset }: inboxErrorProps) {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Inbox</h1>
      <p className="text-sm text-muted-foreground">
        No pudimos cargar el inbox. Intenta de nuevo.
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Reintentar
      </Button>
    </div>
  );
}
