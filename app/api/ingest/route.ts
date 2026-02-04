import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getUseCases } from "@/src/composition/usecases";
import { isIngestCapError } from "@/src/services/usecases/ingest-jobs-with-cap";
import { HOME_CACHE_PROFILE, HOME_CACHE_TAG } from "@/src/lib/cache-tags";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const sourceParam = searchParams.get("source");
  const limit = limitParam ? Number(limitParam) : undefined;
  const safeLimit =
    Number.isFinite(limit) && limit && limit > 0 ? limit : undefined;
  const source = sourceParam?.trim() || undefined;

  try {
    const { ingestJobsWithCap } = await getUseCases();
    const result = await ingestJobsWithCap({ source, limit: safeLimit });
    if (!result.ok) {
      const status = isIngestCapError(result.error) ? 429 : 500;
      return NextResponse.json(
        { ok: false, error: result.error.message },
        { status }
      );
    }
    revalidateTag(HOME_CACHE_TAG, HOME_CACHE_PROFILE);
    return NextResponse.json({ ok: true, ...result.value });
  } catch (error) {
    console.error("Ingest failed", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No pudimos ingestar trabajos.",
      },
      { status: 500 }
    );
  }
}
