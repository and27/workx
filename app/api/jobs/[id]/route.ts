import { NextResponse } from "next/server";
import { getUseCases } from "@/src/composition/usecases";

type routeContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: routeContext) {
  const { getJob } = await getUseCases();
  const { id } = await context.params;
  const job = await getJob({ id });

  if (!job) {
    return NextResponse.json(
      { ok: false, error: "Job no encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, job });
}
