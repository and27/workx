"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import JobDetailDialog from "@/src/components/JobDetailDialog";
import type { job } from "@/src/domain/entities/job";
import type { saveJobState } from "@/app/jobs/actions";

type applicationJobDetailProps = {
  job: job;
  saved: boolean;
  action: (
    prevState: saveJobState | null,
    formData: FormData
  ) => Promise<saveJobState>;
};

export default function ApplicationJobDetail({
  job,
  saved,
  action,
}: applicationJobDetailProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Ver JD
      </Button>
      <JobDetailDialog
        job={job}
        open={open}
        saved={saved}
        action={action}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
