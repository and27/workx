"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUseCases } from "@/src/composition/usecases";
import { isPriorityOption, isStatusOption } from "@/app/applications/[id]/options";
import { HOME_CACHE_TAG } from "@/src/lib/cache-tags";

const revalidateAll = (id: string) => {
  revalidatePath(`/applications/${id}`);
  revalidatePath("/applications");
  revalidatePath("/inbox");
  revalidateTag(HOME_CACHE_TAG);
};

export async function saveChangesAction(formData: FormData) {
  const id = formData.get("applicationId");
  const status = formData.get("status");
  const priority = formData.get("priority");
  const nextActionAt = formData.get("nextActionAt");
  const notes = formData.get("notes");

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("applicationId requerido.");
  }

  const { updateApplication } = await getUseCases();
  const result = await updateApplication({
    id,
    status: isStatusOption(status) ? status : undefined,
    priority: isPriorityOption(priority) ? priority : undefined,
    nextActionAt:
      typeof nextActionAt === "string" && nextActionAt.length > 0
        ? nextActionAt
        : null,
    notes: typeof notes === "string" ? notes : undefined,
  });

  if (!result.ok) {
    throw result.error;
  }

  revalidateAll(id);
}
