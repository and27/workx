import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getUseCases } from "@/src/composition/usecases";
import { HOME_CACHE_PROFILE, HOME_CACHE_TAG } from "@/src/lib/cache-tags";

type triageMode = "new" | "recent";

const toMode = (value: unknown): triageMode =>
  value === "recent" ? "recent" : "new";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mode = toMode(body?.mode);
  const days =
    typeof body?.days === "number" && body.days > 0 ? body.days : 14;

  try {
    const { triageJobs } = await getUseCases();
    const result = await triageJobs({ mode, days });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error.message },
        { status: 500 }
      );
    }

    revalidatePath("/jobs");
    revalidatePath("/");
    revalidateTag(HOME_CACHE_TAG, HOME_CACHE_PROFILE);

    return NextResponse.json({ ok: true, ...result.value });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No pudimos analizar trabajos.",
      },
      { status: 500 }
    );
  }
}
