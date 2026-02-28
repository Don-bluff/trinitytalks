import NotionListClient from "@/components/NotionListClient";
import { DEFAULT_TRINITY_COLUMN_DB_ID } from "@/lib/notion";

export default function ColumnPage() {
  return (
    <NotionListClient
      dbId={DEFAULT_TRINITY_COLUMN_DB_ID}
      basePath="/column"
      pageTitle="三元专栏"
      pageSubtitle="知识探索"
    />
  );
}
