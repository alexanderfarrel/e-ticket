export default async function FetchDetailEvent(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_DEFAULT_URL}/api/event?id=${id}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch event");
  return data;
}
