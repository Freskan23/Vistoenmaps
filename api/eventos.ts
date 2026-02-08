import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const TM_KEY = process.env.TICKETMASTER_API_KEY;
  if (!TM_KEY) {
    res.status(500).json({ error: "API key missing" });
    return;
  }

  const { city, classificationName, size = "12", page = "0" } = req.query;

  const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
  url.searchParams.set("apikey", TM_KEY);
  url.searchParams.set("countryCode", "ES");
  url.searchParams.set("locale", "es");
  url.searchParams.set("sort", "date,asc");
  url.searchParams.set("size", String(size));
  url.searchParams.set("page", String(page));
  if (city) url.searchParams.set("city", String(city));
  if (classificationName)
    url.searchParams.set("classificationName", String(classificationName));

  res.setHeader(
    "Cache-Control",
    "s-maxage=1800, stale-while-revalidate=3600"
  );

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

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

    res.status(200).json({ events, total: data?.page?.totalElements || 0 });
  } catch (err: any) {
    res.status(502).json({ error: err.message || "Ticketmaster API error" });
  }
}
