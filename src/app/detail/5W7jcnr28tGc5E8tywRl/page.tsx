import FetchDetailEvent from "@/app/components/hooks/detail/fetchDetailEvent";
import Bnc2025View from "@/app/components/views/detail/bnc_2025/bnc2025View";

async function DetailPage() {
  try {
    const detailEvent = await FetchDetailEvent("5W7jcnr28tGc5E8tywRl");
    return (
      <Bnc2025View
        detailEvent={detailEvent}
        hasError={false}
        slug={"5W7jcnr28tGc5E8tywRl"}
      />
    );
  } catch {
    return <Bnc2025View detailEvent={null} hasError={true} slug={null} />;
  }
}

export default DetailPage;
