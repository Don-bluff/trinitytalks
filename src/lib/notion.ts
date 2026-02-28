import { Client } from "@notionhq/client";

type NotionPageProperty = {
  type?: string;
  checkbox?: boolean;
  title?: Array<{ plain_text?: string }>;
};

type NotionPageObject = {
  id: string;
  object: "page";
  cover?:
    | {
        type: "external";
        external?: { url?: string };
      }
    | {
        type: "file";
        file?: { url?: string };
      }
    | null;
  properties?: Record<string, NotionPageProperty>;
};

export type NotionListItem = {
  id: string;
  title: string;
  cover: string | null;
  isDraft: boolean;
  isEng: boolean;
};

export type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  children?: NotionBlock[];
  [key: string]: unknown;
};

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const DEFAULT_TRINITY_COLUMN_DB_ID =
  process.env.TRINITY_COLUMN_DB_ID ?? "29c1768e-4579-8055-a801-c5b0b0a09624";

export const DEFAULT_MONEY_PATH_DB_ID =
  process.env.MONEY_PATH_DB_ID ?? "29d1768e-4579-802b-9e1d-f29b4eb88cde";

function normalizeNotionId(id: string): string {
  return id.replace(/-/g, "");
}

function getTitle(properties: Record<string, NotionPageProperty> | undefined): string {
  if (!properties) return "Untitled";
  const nameProperty = properties.Name;
  if (!nameProperty?.title?.length) return "Untitled";
  return nameProperty.title.map((item) => item.plain_text ?? "").join("").trim() || "Untitled";
}

function getCheckbox(
  properties: Record<string, NotionPageProperty> | undefined,
  name: "isDraft" | "isEng",
): boolean {
  return Boolean(properties?.[name]?.checkbox);
}

function getCover(page: NotionPageObject): string | null {
  if (!page.cover) return null;
  if (page.cover.type === "external") {
    return page.cover.external?.url ?? null;
  }
  if (page.cover.type === "file") {
    return page.cover.file?.url ?? null;
  }
  return null;
}

export async function queryDatabaseItems(dbId: string): Promise<NotionListItem[]> {
  const normalizedId = normalizeNotionId(dbId);
  const pages: NotionPageObject[] = [];
  let hasMore = true;
  let startCursor: string | undefined;

  while (hasMore) {
    const response = await notion.dataSources.query({
      data_source_id: normalizedId,
      start_cursor: startCursor,
      page_size: 100,
    });

    for (const result of response.results) {
      if (result.object === "page") {
        pages.push(result as unknown as NotionPageObject);
      }
    }

    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }

  return pages
    .map((page) => {
      const isDraft = getCheckbox(page.properties, "isDraft");
      return {
        id: page.id,
        title: getTitle(page.properties),
        cover: getCover(page),
        isDraft,
        isEng: getCheckbox(page.properties, "isEng"),
      };
    })
    .filter((item) => item.isDraft !== true);
}

async function fetchBlocksPage(blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let hasMore = true;
  let startCursor: string | undefined;

  while (hasMore) {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: startCursor,
      page_size: 100,
    });

    for (const block of response.results) {
      if ("type" in block && "id" in block) {
        blocks.push(block as unknown as NotionBlock);
      }
    }

    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }

  return blocks;
}

async function fetchChildrenRecursively(blockId: string): Promise<NotionBlock[]> {
  const blocks = await fetchBlocksPage(blockId);

  await Promise.all(
    blocks.map(async (block) => {
      if (block.has_children) {
        try {
          block.children = await fetchChildrenRecursively(block.id);
        } catch {
          block.children = [];
        }
      }
    }),
  );

  return blocks;
}

export async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  return fetchChildrenRecursively(pageId);
}

export async function getPageTitle(pageId: string): Promise<string> {
  try {
    const normalizedId = normalizeNotionId(pageId);
    const page = await notion.pages.retrieve({ page_id: normalizedId }) as NotionPageObject;
    const titleProp = Object.values(page.properties ?? {}).find(
      (p: Record<string, unknown>) => p.type === "title"
    ) as Record<string, unknown> | undefined;
    if (!titleProp) return "";
    const titleArr = titleProp.title as Array<{ plain_text?: string }> | undefined;
    return titleArr?.map((t) => t.plain_text ?? "").join("") ?? "";
  } catch {
    return "";
  }
}
