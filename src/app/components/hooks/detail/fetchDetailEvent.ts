export default async function FetchDetailEvent(id: string) {
  const res = await fetch(`http://localhost:3000/api/event?id=${id}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch event");
  return data;
}
