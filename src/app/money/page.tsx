import NotionListClient from "@/components/NotionListClient";
import { DEFAULT_MONEY_PATH_DB_ID } from "@/lib/notion";

export default function MoneyPage() {
  return (
    <NotionListClient
      dbId={DEFAULT_MONEY_PATH_DB_ID}
      basePath="/money"
      pageTitle="搞钱之路"
      pageSubtitle="商业智慧"
    />
  );
}
