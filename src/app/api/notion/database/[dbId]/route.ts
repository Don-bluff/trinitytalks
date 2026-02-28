import { NextResponse } from "next/server";
import { queryDatabaseItems } from "@/lib/notion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dbId: string }> },
) {
  try {
    const { dbId } = await params;
    if (!dbId) {
      return NextResponse.json({ error: "Database id is required" }, { status: 400 });
    }

    const items = await queryDatabaseItems(decodeURIComponent(dbId));
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch database";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
