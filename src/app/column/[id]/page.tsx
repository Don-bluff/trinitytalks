import NotionDetailClient from "@/components/NotionDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ColumnDetailPage({ params }: Props) {
  const { id } = await params;
  return <NotionDetailClient pageId={id} backHref="/column" />;
}
