import Navbar from "../navbar/navbar";

export default function AdminLayout({
  children,
  isFixHeight,
  name,
}: {
  children: React.ReactNode;
  isFixHeight?: boolean;
  name?: string;
}) {
  return (
    <section className="w-full h-full flex flex-col items-center">
      <Navbar isFixHeight={isFixHeight} isAdmin name={name} />
      <div className="w-full max-w-2xl bg-[#eee] flex flex-col items-center">
        {children}
      </div>
    </section>
  );
}
