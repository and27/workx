import { NextResponse } from "next/server";
import { ingestJobs } from "@/src/composition/usecases";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const safeLimit =
    Number.isFinite(limit) && limit && limit > 0 ? limit : undefined;

  try {
    const result = await ingestJobs({ source: "Remotive", limit: safeLimit });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: "No pudimos ingestar trabajos." },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, ...result.value });
  } catch (_error) {
    return NextResponse.json(
      { ok: false, error: "No pudimos ingestar trabajos." },
      { status: 500 }
    );
  }
}
