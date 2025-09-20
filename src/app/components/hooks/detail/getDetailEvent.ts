"use client";

import { useCallback, useEffect, useState } from "react";
import { EventInterface } from "../../interfaces/event";

export default function useGetEventDetail({ id }: { id: string }) {
  const [data, setData] = useState<EventInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/event?id=${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch event");
      }
      const data = await res.json();
      setData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(true);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { data, loading, error, refetch: fetchEvent };
}
