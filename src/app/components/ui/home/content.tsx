"use client";
import Card from "./card";
import toDate from "../../utils/toDate";
import { EventInterface } from "../../interfaces/event";
import React from "react";

export default function Content({
  events,
  hasError,
}: {
  events: EventInterface[];
  hasError: boolean;
}) {
  if (hasError) {
    return (
      <div className="bg-white">
        <p className="text-red-500 text-center mt-5">Failed to fetch event</p>
      </div>
    );
  }
  return (
    <section className="mt-7 w-full flex flex-col justify-center items-center">
      <div className="max-w-[900px] w-full grid md:grid-cols-1 grid-cols-1 gap-4 px-5">
        {/* {error ||
          (loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <React.Fragment key={index}>
                <SkeletonCard id={index} />
              </React.Fragment>
            )))} */}
        {!hasError &&
          events?.map((item: EventInterface) => (
            <React.Fragment key={item.id}>
              <Card
                keyId={item.id}
                id={item.id}
                date={toDate(item.timestamp)}
                title={item.title}
                description={item.description}
                src={item.src}
                ticket={item.ticket}
                isSoldOut={item.isSoldOut}
              />
            </React.Fragment>
          ))}
      </div>
    </section>
  );
}
