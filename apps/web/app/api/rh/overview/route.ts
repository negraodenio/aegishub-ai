import { NextResponse } from "next/server";
import { getRHOverview } from "@mindops/database";
import { z } from "zod";

const QuerySchema = z.object({
  tenantId: z.string().uuid()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  const parsed = QuerySchema.safeParse({ tenantId });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tenantId" }, { status: 400 });
  }

  try {
    const data = await getRHOverview(parsed.data.tenantId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("RH Overview Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
