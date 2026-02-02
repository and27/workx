"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type ingestSource = "all" | "Remotive" | "WWR" | "Web3";

type ingestPayload = {
  ok: boolean;
  fetched?: number;
  created?: number;
  updated?: number;
  error?: string;
};

const DEFAULT_LIMIT = 50;

export default function IngestControls() {
  const { toast } = useToast();
  const [source, setSource] = useState<ingestSource>("all");
  const [limitInput, setLimitInput] = useState(String(DEFAULT_LIMIT));
  const [pending, setPending] = useState(false);

  const limitValue = useMemo(() => {
    const parsed = Number(limitInput);
    if (!Number.isFinite(parsed)) return null;
    if (parsed <= 0) return null;
    return Math.floor(parsed);
  }, [limitInput]);

  const handleIngest = async () => {
    if (pending) return;
    if (!limitValue) {
      toast({
        title: "Limite invalido.",
        description: "Ingresa un numero mayor que 0.",
        variant: "destructive",
      });
      return;
    }

    setPending(true);
    try {
      const params = new URLSearchParams({
        source,
        limit: String(limitValue),
      });
      const response = await fetch(`/api/ingest?${params.toString()}`);
      const payload = (await response.json()) as ingestPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "No pudimos ingestar trabajos.");
      }

      toast({
        title: "Ingesta completada.",
        description: `Nuevos: ${payload.created ?? 0} • Actualizados: ${payload.updated ?? 0}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "No pudimos ingestar trabajos.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-[140px]">
        <label className="text-xs text-muted-foreground" htmlFor="ingest-source">
          Ingestar
        </label>
        <Select value={source} onValueChange={(value) => setSource(value as ingestSource)}>
          <SelectTrigger id="ingest-source" className="mt-1 w-full">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Remotive">Remotive</SelectItem>
            <SelectItem value="WWR">WWR</SelectItem>
            <SelectItem value="Web3">Web3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[120px]">
        <label className="text-xs text-muted-foreground" htmlFor="ingest-limit">
          Limite
        </label>
        <Input
          id="ingest-limit"
          value={limitInput}
          onChange={(event) => setLimitInput(event.target.value)}
          inputMode="numeric"
          className="mt-1"
        />
      </div>
      <div className="flex items-center">
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleIngest}>
          {pending ? "Ingestando..." : "Ingestar"}
        </Button>
      </div>
    </div>
  );
}
