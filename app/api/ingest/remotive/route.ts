import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getUseCases } from "@/src/composition/usecases";
import { HOME_CACHE_TAG } from "@/src/lib/cache-tags";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const safeLimit =
    Number.isFinite(limit) && limit && limit > 0 ? limit : undefined;

  try {
    const { ingestJobs } = await getUseCases();
    const result = await ingestJobs({ source: "Remotive", limit: safeLimit });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: "No pudimos ingestar trabajos." },
        { status: 500 }
      );
    }
    revalidateTag(HOME_CACHE_TAG);
    return NextResponse.json({ ok: true, ...result.value });
  } catch (error) {
    console.error("Remotive ingest failed", error);
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
