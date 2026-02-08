import { useState, useEffect } from "react";
import type { Evento } from "@/data/types";

interface UseEventosOptions {
  ciudad?: string;
  clasificacion?: string;
  limit?: number;
}

const cache = new Map<string, { data: Evento[]; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000;

export function useEventos({
  ciudad,
  clasificacion,
  limit = 12,
}: UseEventosOptions = {}) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = `${ciudad || "all"}-${clasificacion || "all"}-${limit}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setEventos(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (ciudad) params.set("city", ciudad);
    if (clasificacion) params.set("classificationName", clasificacion);
    params.set("size", String(limit));

    fetch(`/api/eventos?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const evts: Evento[] = data.events || [];
        cache.set(key, { data: evts, ts: Date.now() });
        setEventos(evts);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ciudad, clasificacion, limit]);

  return { eventos, loading, error };
}
