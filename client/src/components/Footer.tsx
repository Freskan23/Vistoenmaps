import { Link } from "wouter";
import resumen from "@/data/resumen.json";
import EyeLogo from "@/components/EyeLogo";
import { ArrowRight } from "lucide-react";

/**
 * Pie de pagina.
 *
 * OJO con el tamaño: antes pintaba TODAS las ciudades y, al pasar de 12 a 1.069,
 * el pie se quedo en 1.082 enlaces y 34.000 px de alto en cada pagina. Eso se
 * come el presupuesto de rastreo de Google y en movil es un scroll infinito.
 * Ahora se muestra un numero fijo y corto de enlaces, elegidos por volumen real
 * de negocios, que es justo lo que interesa enlazar desde todas las paginas.
 */

const MAX_POR_COLUMNA = 8;

/**
 * Los contadores salen de `resumen.json` (88 KB): totales y rankings ya
 * calculados. NO se puede importar negocios.json aqui — son 20 MB y el pie
 * esta en TODAS las paginas.
 */
const topCategorias = resumen.topCategorias.slice(0, MAX_POR_COLUMNA);
const topCombos = resumen.topCombos.slice(0, MAX_POR_COLUMNA).map((c) => ({
  href: `/${c.categoria}/${c.ciudad}`,
  texto: c.texto,
}));
const TOTAL_NEGOCIOS = resumen.totalNegocios;
const TOTAL_CATEGORIAS = resumen.totalCategorias;
const totalCiudades = resumen.totalCiudades;

const formato = new Intl.NumberFormat("es-ES", { useGrouping: "always" } as Intl.NumberFormatOptions);

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto relative overflow-hidden">
      {/* Halo suave de fondo */}
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />

      <div className="relative container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Marca + cifras reales */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <EyeLogo size={32} />
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              El directorio de negocios locales de España. Teléfonos, horarios,
              direcciones y valoraciones reales, sin registros ni intermediarios.
            </p>

            <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-primary-foreground/5 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-primary-foreground/90">
                  Negocios
                </dt>
                <dd className="text-base font-bold">{formato.format(TOTAL_NEGOCIOS)}</dd>
              </div>
              <div className="rounded-lg bg-primary-foreground/5 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-primary-foreground/90">
                  Sectores
                </dt>
                <dd className="text-base font-bold">{TOTAL_CATEGORIAS}</dd>
              </div>
              <div className="rounded-lg bg-primary-foreground/5 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-primary-foreground/90">
                  Ciudades
                </dt>
                <dd className="text-base font-bold">{formato.format(totalCiudades)}</dd>
              </div>
            </dl>

            <Link
              href="/contacto"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
            >
              Destaca tu negocio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Sectores con mas negocios */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Servicios
            </h3>
            <ul className="space-y-2">
              {topCategorias.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {cat.nombre}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/directorios"
                  className="text-sm font-semibold text-[#FCC44E] hover:underline"
                >
                  Ver los {TOTAL_CATEGORIAS} sectores
                </Link>
              </li>
            </ul>
          </div>

          {/* Lo mas buscado: categoria + ciudad (paginas que existen y tienen negocios) */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Lo más buscado
            </h3>
            <ul className="space-y-2">
              {topCombos.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {c.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos y legal */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Visto en Maps
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/herramientas", label: "Herramientas" },
                { href: "/blog", label: "Blog" },
                { href: "/eventos", label: "Eventos" },
                { href: "/directorios", label: "Directorios" },
                { href: "/contacto", label: "Contacto" },
                { href: "/aviso-legal", label: "Aviso legal" },
                { href: "/privacidad", label: "Privacidad" },
                { href: "/cookies", label: "Cookies" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Visto en Maps · Directorio de negocios locales de España
          </p>
          <p className="text-xs text-primary-foreground/40">
            Datos públicos de fichas de Google Maps · Mapas de OpenStreetMap
          </p>
        </div>
      </div>
    </footer>
  );
}
