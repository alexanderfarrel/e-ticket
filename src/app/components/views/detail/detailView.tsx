import Navbar from "../../layouts/navbar/navbar";
import Header from "../../ui/detail/header";
import toDate from "../../utils/toDate";
import Content from "../../ui/detail/content";
import { EventInterface } from "../../interfaces/event";

export default function DetailView({
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
        </>
      )}

      <footer className="mt-10 mb-3 text-center">All rights reserved</footer>
    </>
  );
}
