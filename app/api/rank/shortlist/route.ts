import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getUseCases } from "@/src/composition/usecases";
import { HOME_CACHE_PROFILE, HOME_CACHE_TAG } from "@/src/lib/cache-tags";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const limit =
    typeof body?.limit === "number" && body.limit > 0 ? body.limit : undefined;

  try {
    const { rankShortlist } = await getUseCases();
    const result = await rankShortlist({ limit });
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
            : "No pudimos rankear trabajos.",
      },
      { status: 500 }
    );
  }
}
