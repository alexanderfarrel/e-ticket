export async function FetchEvents() {
  const res = await fetch("http://localhost:3000/api/event", {
    next: { revalidate: 60 },
  });
  console.log({ res });
  const data = await res.json();
  console.log({ data });
  if (!res.ok) throw new Error("Failed to fetch event");
  return data;
}
