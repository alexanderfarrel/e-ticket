export async function FetchEvents() {
  const res = await fetch("http://localhost:3000/api/event", {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch event");
  return data;
}
