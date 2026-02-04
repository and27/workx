"use client";

import { useCallback, useState } from "react";
import { Bot, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { job } from "@/src/domain/entities/job";

const AGENT_URL =
  "https://chatgpt.com/g/g-697ab0f6283c8191a2165b3aaf509df4-guille-projects-shipper";

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

type applicationAgentActionsProps = {
  jobId: string | null;
};

export default function ApplicationAgentActions({
  jobId,
}: applicationAgentActionsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jobDetail, setJobDetail] = useState<job | null>(null);

  const loadJob = useCallback(async () => {
    if (!jobId) {
      throw new Error("La postulacion no tiene job asociado.");
    }
    if (jobDetail) {
      return jobDetail;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const payload = (await response.json()) as { ok: boolean; job?: job };
      if (!response.ok || !payload.ok || !payload.job) {
        throw new Error("No pudimos cargar el JD.");
      }
      setJobDetail(payload.job);
      return payload.job;
    } finally {
      setLoading(false);
    }
  }, [jobDetail, jobId]);

  const handleOpenAgent = async () => {
    try {
      const detail = await loadJob();
      const description = detail.description
        ? stripHtml(detail.description)
        : "";
      if (!description) {
        throw new Error("Este job no tiene JD para copiar.");
      }
      if (!navigator.clipboard) {
        throw new Error("Clipboard no disponible.");
      }
      await navigator.clipboard.writeText(description);
      toast({
        title: "JD copiado.",
        description: "Puedes pegarlo en el agente.",
        variant: "success",
      });
      window.open(AGENT_URL, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "No pudimos preparar el agente.",
        variant: "destructive",
      });
    }
  };

  const handleOpenVacancy = async () => {
    try {
      const detail = await loadJob();
      if (!detail.sourceUrl) {
        throw new Error("La vacante no tiene link.");
      }
      window.open(detail.sourceUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title:
          error instanceof Error ? error.message : "No pudimos abrir la vacante.",
        variant: "destructive",
      });
    }
  };

  const isDisabled = loading || !jobId;

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={handleOpenAgent}
        disabled={isDisabled}
        title="Abrir agente y copiar JD"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Bot />}
        <span className="sr-only">Abrir agente</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={handleOpenVacancy}
        disabled={isDisabled}
        title="Abrir vacante"
      >
        <ExternalLink />
        <span className="sr-only">Abrir vacante</span>
      </Button>
    </div>
  );
}
