import { EventInterface } from "../../interfaces/event";
import Navbar from "../../layouts/navbar/navbar";
import Content from "../../ui/home/content";
import Header from "../../ui/home/header";

export default function HomeView({
  events,
  hasError,
}: {
  events: EventInterface[];
  hasError: boolean;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Header />
      <div className="flex-grow">
        <Content events={events} hasError={hasError} />
      </div>
      <footer className="pb-3 text-center">All rights reserved</footer>
    </div>
  );
}
