export async function FetchEvents() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_DEFAULT_URL}/api/event`, {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch event");
  return data;
}
