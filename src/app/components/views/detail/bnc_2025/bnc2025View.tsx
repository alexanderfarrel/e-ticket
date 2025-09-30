import { EventInterface } from "@/app/components/interfaces/event";
import Navbar from "@/app/components/layouts/navbar/navbar";
import Content from "@/app/components/ui/detail/content";
import Header from "@/app/components/ui/detail/header";
import toDate from "@/app/components/utils/toDate";

export default function Bnc2025View({
  detailEvent,
  hasError,
  slug,
}: {
  detailEvent: EventInterface | null;
  hasError: boolean;
  slug: string | null;
}) {
  if (hasError) {
    return (
      <p className="text-red-500 text-center mt-5">Failed to fetch event</p>
    );
  }
  return (
    <>
      {!hasError && detailEvent && (
        <>
          <Navbar />
          <Header
            title={detailEvent.title}
            sub_title={detailEvent.sub_title}
            date={toDate(detailEvent.timestamp)}
            location={detailEvent.location}
          />
          <Content detailEvent={detailEvent} slug={slug} />
          <footer className="py-3 text-center bg-[#0b0105] text-white z-50">
            All rights reserved
          </footer>
        </>
      )}
    </>
  );
}
