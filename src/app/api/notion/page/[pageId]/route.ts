import { NextResponse } from "next/server";
import { getPageBlocks, getPageTitle } from "@/lib/notion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  try {
    const { pageId } = await params;
    if (!pageId) {
      return NextResponse.json({ error: "Page id is required" }, { status: 400 });
    }

    const id = decodeURIComponent(pageId);
    const [blocks, title] = await Promise.all([getPageBlocks(id), getPageTitle(id)]);
    return NextResponse.json({ blocks, title });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch page blocks";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
