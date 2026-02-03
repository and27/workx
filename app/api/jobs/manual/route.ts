import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getUseCases } from "@/src/composition/usecases";
import { HOME_CACHE_PROFILE, HOME_CACHE_TAG } from "@/src/lib/cache-tags";

type manualJobRequest = {
  role?: string;
  company?: string;
  sourceUrl?: string | null;
  location?: string | null;
  seniority?: string | null;
  tags?: string[];
  description?: string | null;
  autoTriage?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as manualJobRequest;

  try {
    const { createManualJob } = await getUseCases();
    const result = await createManualJob({
      role: body.role,
      company: body.company,
      sourceUrl: body.sourceUrl,
      location: body.location,
      seniority: body.seniority,
      tags: body.tags,
      description: body.description,
      autoTriage: body.autoTriage,
    });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error.message },
        { status: 400 }
      );
    }

    revalidatePath("/jobs");
    revalidatePath("/");
    revalidateTag(HOME_CACHE_TAG, HOME_CACHE_PROFILE);

    return NextResponse.json({
      ok: true,
      jobId: result.value.job.id,
      triage: result.value.triage,
      triageStatus: result.value.job.triageStatus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No pudimos crear el job.",
      },
      { status: 500 }
    );
  }
}
