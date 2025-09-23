export async function FetchEvents() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/event`, {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch event");
  return data;
}
