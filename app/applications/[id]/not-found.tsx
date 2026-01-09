import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ApplicationNotFound() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Postulacion</h1>
      <p className="text-sm text-muted-foreground">
        No encontramos la postulacion solicitada.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/applications">Volver a postulaciones</Link>
      </Button>
    </div>
  );
}
