import Image from "next/image";

export default function Header({
  title,
  sub_title,
  location,
  date,
}: {
  title: string;
  sub_title: string;
  location: string;
  date: Date;
}) {
  const dateConvert = date.toLocaleDateString("id-ID").split("/").join("-");
  const timeConvert = date
    .toLocaleTimeString("id-ID")
    .split(".")
    .slice(0, 2)
    .join(":");

  return (
    <header className="relative flex justify-center items-center bg-linear-to-b from-cyan-500 from-20% to-blue-500 border-b-4 border-amber-500 pt-[4rem] pb-8">
      <section className="flex flex-col items-center max-w-[900px] w-full px-10 text-center">
        <h1 className="text-4xl font-bold text-white max-sm:text-3xl mt-1">
          {title}
        </h1>
        <p className="text-xl font-light text-white mt-1 max-sm:text-lg">
          {sub_title}
        </p>

        <div className="absolute bottom-0 translate-y-1/2 mx-auto bg-white flex gap-4 p-2 rounded-lg shadow-xl max-sm:text-sm">
          <h1 className="flex gap-1 items-center">
            <Image
              src="/icons/redLocation.webp"
              alt="pin"
              width={100}
              height={100}
              className="max-w-[17px] max-h-[17px] w-full"
            />
            <span>{location}</span>
          </h1>
          <h1 className="flex gap-1 items-center">
            <Image
              src="/icons/calendar.png"
              alt="pin"
              width={100}
              height={100}
              className="max-w-[19px] max-h-[19px] w-full"
            />
            <span>{dateConvert}</span>
          </h1>
          <h1 className="flex gap-1 items-center">
            <Image
              src="/icons/clock.png"
              alt="pin"
              width={100}
              height={100}
              className="max-w-[20px] max-h-[20px] w-full"
            />
            <span>{timeConvert}</span>
          </h1>
        </div>
      </section>
    </header>
  );
}
