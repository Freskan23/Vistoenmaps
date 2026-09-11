import { ArrowRight, Building2 } from "lucide-react";
import { MARCAS } from "@/data/marcas";

/**
 * Bloque para agencias, en las paginas de ciudad.
 *
 * Aqui el visitante ya ha visto cuantos negocios hay en esa ciudad: si gestiona
 * clientes, el numero le dice solo el trabajo que hay. Un unico bloque discreto
 * al final del listado, nunca intercalado entre los negocios.
 */

interface Props {
  ciudadNombre: string;
  categoriaNombre: string;
  totalNegocios: number;
}

export default function ParaAgencias({ ciudadNombre, categoriaNombre, totalNegocios }: Props) {
  // Con pocos negocios el mensaje no se sostiene: mejor no ponerlo.
  if (totalNegocios < 15) return null;

  const localBrain = MARCAS.find((m) => m.slug === "local-brain")!;

  return (
    <section className="mt-10 rounded-2xl border border-border/60 bg-white p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2a6d94]/10 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-[#2a6d94]" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#2a6d94]/80">
            ¿Llevas varios clientes?
          </p>
          <h2 className="mt-1 text-base md:text-lg font-bold text-foreground leading-snug">
            {totalNegocios} {categoriaNombre.toLowerCase()} compiten en {ciudadNombre}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Si gestionas fichas de Google de varios negocios, hacerlo una por una se come
            el día. {localBrain.nombre} centraliza publicaciones, reseñas, posiciones y
            citaciones de todas tus ubicaciones en un panel.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={localBrain.url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#2a6d94] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Ver {localBrain.nombre}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/herramientas"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              Todas las herramientas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
