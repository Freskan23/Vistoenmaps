import { ArrowRight, TrendingUp } from "lucide-react";
import type { Negocio } from "@/data/types";
import { MARCAS } from "@/data/marcas";

/**
 * Bloque "¿Es tu negocio?" de la ficha.
 *
 * HONESTIDAD ANTE TODO: solo se dicen cosas que podemos demostrar con nuestros
 * propios datos — en qué puesto sale dentro de su barrio y cuántas reseñas tiene
 * comparado con el primero. NUNCA "te falta el teléfono en Google": que nosotros
 * no lo tengamos scrapeado no significa que él no lo tenga puesto.
 */

interface Props {
  negocio: Negocio;
  /** Negocios del mismo barrio y categoría, YA ordenados como se listan. */
  vecinos: Negocio[];
  categoriaNombre: string;
  barrioNombre: string;
}

export default function EsTuNegocio({ negocio, vecinos, categoriaNombre, barrioNombre }: Props) {
  const total = vecinos.length;
  const puesto = vecinos.findIndex((n) => n.slug === negocio.slug) + 1;

  // Sin contexto suficiente no se dice nada: mejor callar que inventar.
  if (total < 3 || puesto < 1) return null;

  const lider = vecinos[0];
  const misResenas = negocio.num_resenas ?? 0;
  const resenasLider = lider?.num_resenas ?? 0;
  const esElPrimero = puesto === 1;

  // El mensaje sale de SU situación real, no de una plantilla comercial.
  let titular: string;
  let explicacion: string;

  if (esElPrimero) {
    titular = `Sales el primero en ${categoriaNombre.toLowerCase()} de ${barrioNombre}`;
    explicacion =
      "Mantener el primer puesto cuesta más que llegar: basta con que un competidor empiece a pedir reseñas para adelantarte.";
  } else if (resenasLider > misResenas) {
    titular = `Sales el ${puesto}º de ${total} en ${categoriaNombre.toLowerCase()} de ${barrioNombre}`;
    explicacion = `El primero de la lista tiene ${resenasLider} ${
      resenasLider === 1 ? "opinión" : "opiniones"
    } y ${misResenas === 0 ? "tu ficha no tiene ninguna" : `tú ${misResenas}`}. Las opiniones son lo que más pesa para adelantar puestos.`;
  } else {
    titular = `Sales el ${puesto}º de ${total} en ${categoriaNombre.toLowerCase()} de ${barrioNombre}`;
    explicacion =
      "Quien sale por delante no siempre es mejor: casi siempre es que aparece en más búsquedas del barrio.";
  }

  const trafikazo = MARCAS.find((m) => m.slug === "trafikazo")!;

  return (
    <section className="rounded-2xl border border-[#1B4965]/15 bg-gradient-to-br from-[#1B4965]/[0.04] to-transparent p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1B4965]/10 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-[#1B4965]" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#1B4965]/70">
            ¿Es tu negocio?
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground leading-snug">{titular}</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{explicacion}</p>

          <a
            href={trafikazo.url}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#1B4965] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Ver en qué calles apareces
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            Con {trafikazo.nombre}, de Edu Laborda. Aparecer en este directorio es y seguirá siendo gratis.
          </p>
        </div>
      </div>
    </section>
  );
}
