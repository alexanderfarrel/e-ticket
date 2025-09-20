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
    <header className="relative flex justify-center items-center bg-linear-to-b from-cyan-500 from-20% to-blue-500 border-b-4 border-amber-500 pt-[4rem] pb-12">
      <section className="flex flex-col items-center max-w-[900px] w-full px-10 text">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-xl font-light text-white">{sub_title}</p>

        <div className="absolute bottom-0 translate-y-1/2 mx-auto bg-white flex gap-3 p-2 rounded-lg shadow-xl">
          <h1>{location}</h1>
          <h1>{dateConvert}</h1>
          <h1>{timeConvert}</h1>
        </div>
      </section>
    </header>
  );
}
