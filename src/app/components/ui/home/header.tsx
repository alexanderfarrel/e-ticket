"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="flex justify-center items-center bg-linear-to-b from-cyan-500 from-20% to-blue-500 border-b-4 border-amber-500 max-sm:pt-[4.4rem] pt-[3.4rem]">
      <section className="flex max-sm:flex-col flex-row justify-between items-center max-w-[900px] w-full px-10 pb-10">
        <div className="flex flex-col justify-center max-sm:text-center">
          <h1 className="text-3xl font-bold text-white max-sm:text-2xl">
            SMA Negeri 1 Madiun
          </h1>
          <h1 className="text-3xl font-bold text-orange-300 max-sm:text-2xl">
            E-Ticket
          </h1>
          <input
            type="text"
            placeholder="Cari Tiket"
            className="bg-white outline-none p-2 py-1 rounded-lg mt-3"
          />
        </div>
        <div className="">
          {/* <div className="flex justify-end">
            <Image
              src="https://sman1madiun.sch.id/wp-content/uploads/2024/10/logo-banner.png"
              alt=""
              width={1000}
              height={1000}
              className="max-w-[300px]"
            />
          </div> */}
        </div>
      </section>
    </header>
  );
}
