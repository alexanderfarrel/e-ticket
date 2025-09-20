import FetchDetailEvent from "@/app/components/hooks/detail/fetchDetailEvent";
import DetailView from "@/app/components/views/detail/detailView";

async function DetailPage({ params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const detailEvent = await FetchDetailEvent(slug);
    return (
      <DetailView detailEvent={detailEvent} hasError={false} slug={slug} />
    );
  } catch {
    return <DetailView detailEvent={null} hasError={true} slug={null} />;
  }
}

export default DetailPage;
