import { Link } from "wouter";
import { Calendar, Ticket, ChevronRight } from "lucide-react";
import { useEventos } from "@/hooks/useEventos";
import {
  ATRIBUTOS_AFILIADO,
  enlaceCompra,
  registrarClicAfiliado,
} from "@/lib/afiliados";

/**
 * Eventos de una ciudad, para colocar en las paginas que YA tienen visitas.
 *
 * POR QUE AQUI: los enlaces de Ticketmaster llevan el afiliado de Edu, pero
 * solo estaban en /eventos, una pagina a la que casi nadie llega. El trafico
 * de verdad esta en las paginas de ciudad y de sector (/cerrajeros/madrid).
 * Poner aqui los proximos conciertos convierte visitas que ya existen en
 * posibles comisiones, y ademas le da una razon al visitante para volver.
 *
 * Reglas que se respetan:
 *  - solo sale si HAY eventos de verdad en esa ciudad (nada de huecos vacios)
 *  - va al final, despues del contenido util: no estorba a quien busca un
 *    fontanero
 *  - se avisa de que es un enlace con comision
 */

interface Props {
  ciudadSlug: string;
  ciudadNombre: string;
  /** Sector de la pagina donde se va a pintar. Decide si tiene sentido. */
  categoriaSlug?: string;
}

/**
 * Sectores donde los eventos NO pintan nada.
 *
 * Quien busca un cerrajero a las 3 de la madrugada, o un fontanero con un
 * escape, o un abogado, NO quiere conciertos. Ahi el bloque es publicidad
 * metida con calzador y ensucia la pagina.
 *
 * En cambio, quien mira restaurantes, bares, hoteles o turismo en una ciudad
 * SI esta haciendo planes: ahi los eventos encajan y ayudan.
 */
const SECTORES_SIN_EVENTOS = new Set([
  "cerrajeros", "fontaneros", "electricistas", "desatascos", "reformas",
  "mudanzas-trasteros", "limpieza", "reparaciones-electrodomesticos",
  "climatizacion", "seguridad-alarmas", "cristaleria", "albaniles",
  "abogados", "gestorias", "asesorias", "dentistas", "fisioterapeutas",
  "veterinarios", "farmacias", "psicologos", "medicos", "clinicas",
  "funerarias", "talleres", "grúas", "gruas", "informatica",
  "energia-solar", "toldos-persianas", "tapicerias", "pavimentos-suelos",
  "carpinteria-muebles", "pintores", "jardineria", "inmobiliarias",
  "arquitectura", "autoescuelas", "academias-formacion", "gimnasios",
  "marketing-diseno", "servicios-empresas",
]);

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function fecha(iso: string) {
  if (!iso) return { dia: "--", mes: "" };
  const p = iso.split("-");
  return { dia: String(parseInt(p[2], 10)), mes: MESES[parseInt(p[1], 10) - 1] || "" };
}

export default function EventosCiudad({ ciudadSlug, ciudadNombre, categoriaSlug }: Props) {
  const fuera = categoriaSlug ? SECTORES_SIN_EVENTOS.has(categoriaSlug) : false;
  const { eventos, loading } = useEventos({
    ciudad: fuera ? undefined : ciudadNombre,
    limit: 3,
  });

  // En sectores de urgencia o tramites, ni se pinta ni se pide nada
  if (fuera) return null;
  // Si no hay eventos, NO se pinta nada: mejor eso que una seccion vacia
  if (loading || !eventos.length) return null;

  return (
    <section className="container py-10 border-t border-border/60">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-5 h-5 text-accent" />
        <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
          Qué hacer estos días en {ciudadNombre}
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Los próximos conciertos y espectáculos con entradas a la venta.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {eventos.map((e: any) => {
          const f = fecha(e.fecha);
          return (
            <a
              key={e.id}
              href={enlaceCompra(e.url_compra)}
              {...ATRIBUTOS_AFILIADO}
              onClick={() =>
                registrarClicAfiliado({
                  evento: e.nombre,
                  ciudad: e.ciudad,
                  clasificacion: e.clasificacion,
                  url: e.url_compra,
                })
              }
              className="group flex gap-3 rounded-2xl border border-border/60 bg-white p-3 hover:border-accent/50 hover:shadow-sm transition-all"
            >
              <div className="shrink-0 w-12 rounded-xl bg-primary text-primary-foreground text-center py-1.5">
                <span className="block text-lg font-extrabold leading-none">{f.dia}</span>
                <span className="block text-[10px] uppercase tracking-wide opacity-80">{f.mes}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {e.nombre}
                </p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{e.lugar}</p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-accent">
                  <Ticket className="w-3 h-3" />
                  Ver entradas
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link
          href={`/eventos/${ciudadSlug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Ver todos los eventos de {ciudadNombre}
          <ChevronRight className="w-4 h-4" />
        </Link>
        <span className="text-[11px] text-muted-foreground">
          Las entradas se compran en Ticketmaster. Nos llevamos una comisión y a
          ti no te cuesta más.
        </span>
      </div>
    </section>
  );
}
