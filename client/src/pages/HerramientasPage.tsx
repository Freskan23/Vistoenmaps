import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { MARCAS } from "@/data/marcas";
import resumen from "@/data/resumen.json";
import { ArrowRight, Check } from "lucide-react";

/**
 * Pagina de herramientas.
 *
 * No es una landing de publicidad: explica que hace cada producto y para quien
 * es, con enlaces a sus webs. Esta enlazada desde el pie de todas las paginas,
 * asi que tambien trabaja para el SEO del directorio.
 */
export default function HerramientasPage() {
  const formato = new Intl.NumberFormat("es-ES", {
    useGrouping: "always",
  } as Intl.NumberFormatOptions);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Herramientas para posicionar tu negocio en Google Maps | Visto en Maps"
        description="Qué usamos para medir posiciones en Google Maps, conseguir reseñas y gestionar fichas: Trafikazo, Local Brain y YinYang SEO. Para dueños de negocio y para agencias."
        canonical="https://vistoenmaps.com/herramientas"
      />
      <Header />

      <section className="bg-primary text-primary-foreground">
        <div className="container py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
              Herramientas
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">
              Aparecer aquí es gratis. Salir el primero en Google es otra cosa.
            </h1>
            <p className="mt-4 text-primary-foreground/80 leading-relaxed">
              Este directorio reúne {formato.format(resumen.totalNegocios)} negocios de{" "}
              {formato.format(resumen.totalCiudades)} ciudades. Al montarlo vimos lo mismo una
              y otra vez: negocios buenos que nadie encuentra porque su ficha de Google está
              por detrás de la del vecino. Estas son las herramientas que usamos para
              arreglarlo.
            </p>
          </div>
        </div>
      </section>

      <main className="container py-10 md:py-14 flex-1">
        <div className="grid gap-6 md:grid-cols-3">
          {MARCAS.map((m) => (
            <article
              key={m.slug}
              className="flex flex-col rounded-2xl border border-border/60 bg-white p-6 shadow-sm"
            >
              <div
                className="inline-flex self-start items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                style={{ background: m.colorFondo, color: m.colorTexto }}
              >
                {m.nombre}
              </div>

              <h2 className="mt-4 text-lg font-bold text-foreground leading-snug">
                {m.promesa}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {m.descripcion}
              </p>

              <ul className="mt-4 space-y-2">
                {m.puntos.map((punto) => (
                  <li key={punto} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                    <span>{punto}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-muted-foreground">
                {m.publico === "agencia"
                  ? "Para agencias y consultores SEO"
                  : "Para dueños de negocio y para agencias"}
              </p>

              <a
                href={m.url}
                target="_blank"
                rel="noopener"
                className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03]"
                style={{ background: m.colorFondo, color: m.colorTexto }}
              >
                Ver {m.nombre}
                <ArrowRight className="w-4 h-4" />
              </a>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Las tres son proyectos de Edu Laborda. Aparecer en el directorio no cuesta nada
          y no hace falta contratar nada.
        </p>
      </main>

      <Footer />
    </div>
  );
}
