"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import JobDetailDialog from "@/src/components/JobDetailDialog";
import { saveJobAction } from "@/app/jobs/actions";
import type { job } from "@/src/domain/entities/job";

type applicationJobDetailProps = {
  job: job;
  saved: boolean;
};

export default function ApplicationJobDetail({
  job,
  saved,
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
        action={saveJobAction}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
