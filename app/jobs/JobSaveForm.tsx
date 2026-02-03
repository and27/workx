"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Bookmark, Check, Loader2 } from "lucide-react";
import type { saveJobState } from "@/app/jobs/actions";

type jobSaveFormProps = {
  jobId: string;
  saved: boolean;
  action: (
    prevState: saveJobState | null,
    formData: FormData,
  ) => Promise<saveJobState>;
};

type submitButtonProps = {
  saved: boolean;
};

const SubmitButton = ({ saved }: submitButtonProps) => {
  const { pending } = useFormStatus();
  const disabled = pending || saved;
  const label = pending ? "Guardando" : saved ? "Guardada" : "Guardar";
  return (
    <Button
      type="submit"
      variant="outline"
      size="icon-sm"
      disabled={disabled}
      title={label}
    >
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : saved ? (
        <Check />
      ) : (
        <Bookmark />
      )}
      <span className="sr-only">{label}</span>
    </Button>
  );
};

export default function JobSaveForm({
  jobId,
  saved,
  action,
}: jobSaveFormProps) {
  const [state, formAction] = useActionState(action, null);
  const hasMounted = useRef(false);
  const [isSaved, setIsSaved] = useState(saved);
  const { toast } = useToast();

  useEffect(() => {
    setIsSaved(saved);
  }, [saved]);

  useEffect(() => {
    if (state?.ok) {
      setIsSaved(true);
    }
  }, [state]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (!state) {
      return;
    }
    if (state.ok) {
      setIsSaved(true);
      toast({
        title: state.message,
        variant: "success",
      });
    } else {
      toast({
        title: state.message,
        variant: "destructive",
      });
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="jobId" value={jobId} />
      <SubmitButton saved={isSaved} />
    </form>
  );
}
