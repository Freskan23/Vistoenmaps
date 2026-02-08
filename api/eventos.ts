import type { VercelRequest, VercelResponse } from "@vercel/node";

/* ── Eventos demo para fallback cuando la API falla o la key aún no se ha propagado ── */
function getFallbackEvents(city?: string, size = 12) {
  const now = new Date();
  const demo = [
    { id: "demo-1", nombre: "Festival Primavera Sound 2026", slug: "festival-primavera-sound-2026", fecha: fmt(now, 14), hora: "18:00", imagen: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80", lugar: "Parc del Fòrum", ciudad: "Barcelona", ciudad_slug: "barcelona", clasificacion: "music", precio_min: 75, precio_max: 195, url_compra: "https://www.primaverasound.com" },
    { id: "demo-2", nombre: "Concierto Orquesta Sinfónica", slug: "concierto-orquesta-sinfonica", fecha: fmt(now, 7), hora: "20:30", imagen: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80", lugar: "Auditorio Nacional", ciudad: "Madrid", ciudad_slug: "madrid", clasificacion: "music", precio_min: 25, precio_max: 60, url_compra: "#" },
    { id: "demo-3", nombre: "Real Madrid vs FC Barcelona", slug: "real-madrid-vs-fc-barcelona", fecha: fmt(now, 21), hora: "21:00", imagen: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80", lugar: "Santiago Bernabéu", ciudad: "Madrid", ciudad_slug: "madrid", clasificacion: "sports", precio_min: 90, precio_max: 350, url_compra: "#" },
    { id: "demo-4", nombre: "Feria de Abril", slug: "feria-de-abril-sevilla", fecha: fmt(now, 30), hora: "12:00", imagen: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80", lugar: "Real de la Feria", ciudad: "Sevilla", ciudad_slug: "sevilla", clasificacion: "arts", precio_min: undefined, precio_max: undefined, url_compra: "#" },
    { id: "demo-5", nombre: "Musical El Rey León", slug: "musical-el-rey-leon", fecha: fmt(now, 5), hora: "19:00", imagen: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80", lugar: "Teatro Lope de Vega", ciudad: "Madrid", ciudad_slug: "madrid", clasificacion: "arts", precio_min: 30, precio_max: 120, url_compra: "#" },
    { id: "demo-6", nombre: "Valencia Open de Tenis", slug: "valencia-open-tenis", fecha: fmt(now, 45), hora: "10:00", imagen: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80", lugar: "Ciudad de las Artes", ciudad: "Valencia", ciudad_slug: "valencia", clasificacion: "sports", precio_min: 20, precio_max: 85, url_compra: "#" },
    { id: "demo-7", nombre: "Festival de Jazz de Málaga", slug: "festival-jazz-malaga", fecha: fmt(now, 10), hora: "21:30", imagen: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80", lugar: "Teatro Cervantes", ciudad: "Málaga", ciudad_slug: "malaga", clasificacion: "music", precio_min: 15, precio_max: 45, url_compra: "#" },
    { id: "demo-8", nombre: "Expo Arte Contemporáneo", slug: "expo-arte-contemporaneo-barcelona", fecha: fmt(now, 3), hora: "10:00", imagen: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80", lugar: "MACBA", ciudad: "Barcelona", ciudad_slug: "barcelona", clasificacion: "arts", precio_min: 12, precio_max: 12, url_compra: "#" },
  ];

  const filtered = city
    ? demo.filter((e) => e.ciudad_slug === city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"))
    : demo;

  return filtered.slice(0, size);
}

function fmt(base: Date, addDays: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + addDays);
  return d.toISOString().slice(0, 10);
}

/* ── Handler ── */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const TM_KEY = process.env.TICKETMASTER_API_KEY;
  const { city, classificationName, size = "12", page = "0" } = req.query;
  const sizeNum = Math.min(Number(size) || 12, 50);

  res.setHeader(
    "Cache-Control",
    "s-maxage=1800, stale-while-revalidate=3600"
  );

  /* Sin API key → fallback */
  if (!TM_KEY) {
    const events = getFallbackEvents(city as string, sizeNum);
    res.status(200).json({ events, total: events.length, fallback: true });
    return;
  }

  const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
  url.searchParams.set("apikey", TM_KEY);
  url.searchParams.set("countryCode", "ES");
  url.searchParams.set("locale", "es");
  url.searchParams.set("sort", "date,asc");
  url.searchParams.set("size", String(sizeNum));
  url.searchParams.set("page", String(page));
  if (city) url.searchParams.set("city", String(city));
  if (classificationName)
    url.searchParams.set("classificationName", String(classificationName));

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    /* Ticketmaster devuelve error (ej: Invalid ApiKey) → fallback */
    if (data?.fault || !response.ok) {
      console.warn("Ticketmaster API error, using fallback:", data?.fault?.faultstring || response.status);
      const events = getFallbackEvents(city as string, sizeNum);
      res.status(200).json({ events, total: events.length, fallback: true });
      return;
    }

    const slugify = (t: string) =>
      t
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const events = (data?._embedded?.events || []).map((e: any) => ({
      id: e.id,
      nombre: e.name,
      slug: slugify(e.name + "-" + e.id.slice(-6)),
      fecha: e.dates?.start?.localDate || "",
      hora: e.dates?.start?.localTime?.slice(0, 5) || "",
      imagen:
        (e.images || []).sort(
          (a: any, b: any) => (b.width || 0) - (a.width || 0)
        )[0]?.url || "",
      lugar: e._embedded?.venues?.[0]?.name || "",
      ciudad: e._embedded?.venues?.[0]?.city?.name || "",
      ciudad_slug: slugify(
        e._embedded?.venues?.[0]?.city?.name || ""
      ),
      clasificacion:
        e.classifications?.[0]?.segment?.name?.toLowerCase() || "misc",
      precio_min: e.priceRanges?.[0]?.min,
      precio_max: e.priceRanges?.[0]?.max,
      url_compra: e.url || "",
    }));

    /* Si Ticketmaster devuelve 0 eventos para España, también usar fallback */
    if (events.length === 0) {
      const fb = getFallbackEvents(city as string, sizeNum);
      res.status(200).json({ events: fb, total: fb.length, fallback: true });
      return;
    }

    res.status(200).json({ events, total: data?.page?.totalElements || 0 });
  } catch (err: any) {
    /* Error de red → fallback en lugar de 502 */
    console.error("Ticketmaster fetch error:", err.message);
    const events = getFallbackEvents(city as string, sizeNum);
    res.status(200).json({ events, total: events.length, fallback: true });
  }
}
