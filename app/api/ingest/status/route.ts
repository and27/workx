import { NextResponse } from "next/server";
import { getUseCases } from "@/src/composition/usecases";

export async function GET() {
  try {
    const { getIngestStatus } = await getUseCases();
    const status = await getIngestStatus();
    return NextResponse.json({ ok: true, ...status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No pudimos cargar el estado de ingestas.",
      },
      { status: 500 }
    );
  }
}
