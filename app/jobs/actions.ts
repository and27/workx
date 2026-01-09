"use server";

import { revalidatePath } from "next/cache";
import { createApplicationFromJob } from "@/src/composition/usecases";

export type saveJobState = {
  ok: boolean;
  message: string;
};

export async function saveJobAction(
  _prevState: saveJobState | null,
  formData: FormData
): Promise<saveJobState> {
  const jobId = formData.get("jobId");
  if (typeof jobId !== "string" || jobId.length === 0) {
    return { ok: false, message: "ID de trabajo requerido." };
  }

  const result = await createApplicationFromJob({ jobId });
  if (!result.ok) {
    return { ok: false, message: "No pudimos guardar la postulacion." };
  }

  revalidatePath("/jobs");
  revalidatePath("/applications");

  return { ok: true, message: "Postulacion guardada." };
}
