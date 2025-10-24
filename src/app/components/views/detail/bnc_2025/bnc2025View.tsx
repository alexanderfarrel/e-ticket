import { EventInterface } from "@/app/components/interfaces/event";
import Navbar from "@/app/components/layouts/navbar/navbar";
import Content from "@/app/components/ui/bnc_2025/content";
import Header from "@/app/components/ui/bnc_2025/header";
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
      <div className="bg-white min-h-[100vh]">
        <p className="text-red-500 text-center">Failed to fetch event</p>
      </div>
    );
  }
  return (
    <>
      {!hasError && detailEvent !== null && (
        <>
          <Navbar />
          <Header
            title={detailEvent.title}
            sub_title={detailEvent.sub_title}
            date={toDate(detailEvent.timestamp)}
            location={detailEvent.location}
          />
          <Content detailEvent={detailEvent} slug={slug} />
          <footer className="py-3 pt-8 text-center bg-[#0b0105] text-white z-50">
            All rights reserved
          </footer>
        </>
      )}
    </>
  );
}
