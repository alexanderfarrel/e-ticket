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
    <>
      <Navbar />
      <Header />
      <Content events={events} hasError={hasError} />
      <footer className="mt-10 mb-3 text-center">All rights reserved</footer>
    </>
  );
}
