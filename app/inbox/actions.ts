"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUseCases } from "@/src/composition/usecases";
import { HOME_CACHE_PROFILE, HOME_CACHE_TAG } from "@/src/lib/cache-tags";

const revalidateAll = () => {
  revalidatePath("/inbox");
  revalidatePath("/applications");
  revalidateTag(HOME_CACHE_TAG, HOME_CACHE_PROFILE);
};

export async function archiveAction(formData: FormData) {
  const id = formData.get("applicationId");
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("applicationId requerido.");
  }

  const { archiveApplication } = await getUseCases();
  const result = await archiveApplication({ id });
  if (!result.ok) {
    throw result.error;
  }

  revalidateAll();
}

export async function markDoneAction(formData: FormData) {
  const id = formData.get("applicationId");
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("applicationId requerido.");
  }

  const { updateApplication } = await getUseCases();
  const result = await updateApplication({
    id,
    nextActionAt: null,
  });
  if (!result.ok) {
    throw result.error;
  }

  revalidateAll();
}

export async function rescheduleAction(formData: FormData) {
  const id = formData.get("applicationId");
  const nextActionAt = formData.get("nextActionAt");
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("applicationId requerido.");
  }
  if (typeof nextActionAt !== "string" || nextActionAt.length === 0) {
    throw new Error("nextActionAt requerido.");
  }

  const { updateApplication } = await getUseCases();
  const result = await updateApplication({
    id,
    nextActionAt,
  });
  if (!result.ok) {
    throw result.error;
  }

  revalidateAll();
}
