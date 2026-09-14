import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { Phone, Clock, Star, AlertTriangle, CheckCircle2, MapPin, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

/**
 * Guia "lo que debes saber antes de llamar", por sector y ciudad.
 *
 * POR QUE NO ES UNA GUIA DE PRECIOS
 *   Edu pidio algo tipo Habitissimo ("¿Cuanto cuesta una reforma?"). Se comprobo
 *   que no se puede hacer con honestidad: las fichas de Google Maps no traen
 *   precios y, sondeando 55 webs de negocios reales, solo el 13% publica alguno
 *   —y en formatos que no se pueden comparar—. De 1.377 cerrajeros sacariamos
 *   precio de unos 22. Inventar cifras esta descartado.
 *
 *   Asi que esta pagina responde a lo que la gente busca ANTES de llamar y que
 *   SI podemos contestar con datos: cuanta competencia hay, que nivel tiene el
 *   sector en esa ciudad, cuantos atienden urgencias, a cuantos se puede llamar,
 *   que preguntar por telefono y como detectar que te estan clavando.
 */

interface Guia {
  slug: string;
  categoria_slug: string;
  ciudad_slug: string;
  categoria_nombre: string;
  ciudad_nombre: string;
  total: number;
  media: number;
  opiniones: number;
  con_telefono: number;
  urgencias: number;
  barrios: number;
  barrio_top: string | null;
  barrio_top_n: number;
  sobre45: number;
  preguntar: string[];
  alarma: string[];
  hay_urgencia: boolean;
  top: any[];
}

const fmt = new Intl.NumberFormat("es-ES");
const coma = (x: any) => String(x ?? "").replace(".", ",");

export default function CostesPage() {
  const [, params] = useRoute("/precios/:slug");
  const [guia, setGuia] = useState<Guia | null>(null);
  const [estado, setEstado] = useState<"cargando" | "ok" | "no">("cargando");

  useEffect(() => {
    let vivo = true;
    fetch("/datos/costes.json")
      .then((r) => r.json())
      .then((lista: Guia[]) => {
        if (!vivo) return;
        const g = lista.find((x) => x.slug === params?.slug);
        setGuia(g || null);
        setEstado(g ? "ok" : "no");
      })
      .catch(() => vivo && setEstado("no"));
    return () => {
      vivo = false;
    };
  }, [params?.slug]);

  if (estado === "cargando") {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafaf7]">
        <Header />
        <main className="container py-16 flex-1">
          <div className="h-8 w-2/3 bg-white rounded animate-pulse" />
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!guia) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafaf7]">
        <Header />
        <main className="container py-20 flex-1 text-center">
          <h1 className="text-2xl font-bold">Esa guía no existe</h1>
          <p className="mt-2 text-muted-foreground">
            Solo publicamos guía cuando hay profesionales suficientes y datos útiles.
          </p>
          <Link href="/precios" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Ver todas las guías
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const cat = guia.categoria_nombre.toLowerCase();
  const titulo = `${guia.categoria_nombre} en ${guia.ciudad_nombre}: lo que debes saber antes de llamar`;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title={`${titulo} | Visto en Maps`}
        description={`${guia.total} ${cat} en ${guia.ciudad_nombre} con ficha en Google Maps. Cuántos atienden urgencias, qué preguntar antes de contratar y cómo detectar un sobreprecio.`}
        canonical={`https://vistoenmaps.com/precios/${guia.slug}`}
      />
      <Header />

      <section className="bg-primary text-primary-foreground">
        <div className="container py-10 md:py-14">
          <nav className="text-xs text-primary-foreground/60 mb-3">
            <Link href="/" className="hover:underline">Inicio</Link>
            {" › "}
            <Link href="/precios" className="hover:underline">Antes de contratar</Link>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight max-w-3xl">
            {titulo}
          </h1>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl leading-relaxed">
            No publicamos tarifas porque no las tenemos: en este sector casi nadie
            las hace públicas y las pocas que hay no son comparables. Lo que sí
            podemos decirte es cuánta competencia hay, qué nivel tiene y qué
            preguntar para que no te claven.
          </p>
        </div>
      </section>

      <main className="container py-8 flex-1 max-w-4xl">
        {/* Cifras reales */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[
            { n: fmt.format(guia.total), t: "profesionales", i: MapPin },
            { n: coma(guia.media), t: "nota media", i: Star },
            { n: fmt.format(guia.con_telefono), t: "se pueden llamar", i: Phone },
            { n: fmt.format(guia.urgencias), t: "anuncian 24 horas", i: Clock },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border/60 bg-white p-4">
              <c.i className="w-4 h-4 text-accent" />
              <p className="mt-2 text-2xl font-extrabold text-foreground">{c.n}</p>
              <p className="text-xs text-muted-foreground">{c.t}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          En {guia.ciudad_nombre} hay <strong>{fmt.format(guia.total)} {cat}</strong> con
          ficha en Google Maps, repartidos por {guia.barrios}{" "}
          {guia.barrios === 1 ? "barrio" : "barrios"}
          {guia.barrio_top ? <> (el que más concentra es <strong>{guia.barrio_top}</strong>, con {guia.barrio_top_n})</> : null}.
          Entre todos suman {fmt.format(guia.opiniones)} opiniones y{" "}
          {guia.sobre45} pasan de 4,5 sobre 5.
          {guia.urgencias > 0 ? (
            <> <strong>{guia.urgencias}</strong> anuncian servicio 24 horas, así que a
            deshoras tienes a quién llamar.</>
          ) : null}
        </p>

        {/* Qué preguntar */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Qué preguntar antes de contratar
          </h2>
          <ul className="mt-4 space-y-2.5">
            {guia.preguntar.map((p, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border/60 bg-white p-4">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Señales de alarma */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Señales de que algo no va bien
          </h2>
          <ul className="mt-4 space-y-2.5">
            {guia.alarma.map((p, i) => (
              <li key={i} className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-foreground/80 leading-relaxed">
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* Los mejor valorados */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-foreground">
            Los 5 mejor valorados de {guia.ciudad_nombre}
          </h2>
          <div className="mt-4 space-y-3">
            {guia.top.map((n, i) => (
              <Link
                key={n.slug}
                href={`/${n.categoria_slug}/${n.ciudad_slug}/${n.barrio_slug}/${n.slug}`}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-white p-4 hover:border-primary/40 transition-colors"
              >
                <span className="shrink-0 w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{n.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.valoracion_media ? `${coma(n.valoracion_media)} sobre 5` : "Sin valoraciones"}
                    {n.num_resenas ? ` · ${fmt.format(n.num_resenas)} opiniones` : ""}
                    {n.horario ? ` · ${n.horario}` : ""}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
          <Link
            href={`/${guia.categoria_slug}/${guia.ciudad_slug}`}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Ver los {fmt.format(guia.total)} {cat} de {guia.ciudad_nombre}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>

        <section className="mt-10 rounded-2xl border border-border/60 bg-white p-5">
          <h2 className="text-base font-bold text-foreground">¿Por qué no ponemos precios?</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Porque no los tenemos y no nos los vamos a inventar. Nuestros datos
            salen de las fichas públicas de Google Maps, que no incluyen tarifas.
            Miramos las webs de los propios negocios y solo una de cada ocho
            publica algún precio, en formatos que no se pueden comparar entre sí.
            Preferimos decirte qué preguntar antes que darte una cifra que no se
            sostiene.
          </p>
          <Link href="/criterios" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Cómo trabajamos con los datos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
