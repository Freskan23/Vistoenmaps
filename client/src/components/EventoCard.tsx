import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { Evento } from "@/data/types";
import { cn } from "@/lib/utils";

interface EventoCardProps {
  evento: Evento;
}

const MESES_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const CLASIFICACION_COLORS: Record<string, string> = {
  music: "bg-purple-100 text-purple-700",
  sports: "bg-emerald-100 text-emerald-700",
  arts: "bg-amber-100 text-amber-700",
  film: "bg-rose-100 text-rose-700",
  misc: "bg-blue-100 text-blue-700",
};

const CLASIFICACION_LABELS: Record<string, string> = {
  music: "Musica",
  sports: "Deportes",
  arts: "Artes",
  film: "Cine",
  misc: "Evento",
};

function parseFecha(isoDate: string) {
  if (!isoDate) return { dia: "--", mes: "---" };
  const parts = isoDate.split("-");
  const monthIndex = parseInt(parts[1], 10) - 1;
  return {
    dia: String(parseInt(parts[2], 10)),
    mes: MESES_ES[monthIndex] || "---",
  };
}

export default function EventoCard({ evento }: EventoCardProps) {
  const { dia, mes } = parseFecha(evento.fecha);
  const clasColor =
    CLASIFICACION_COLORS[evento.clasificacion] || CLASIFICACION_COLORS.misc;
  const clasLabel =
    CLASIFICACION_LABELS[evento.clasificacion] ||
    evento.clasificacion.charAt(0).toUpperCase() + evento.clasificacion.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35 }}
    >
      <a
        href={evento.url_compra}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full group"
      >
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {evento.imagen ? (
              <img
                src={evento.imagen}
                alt={evento.nombre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10 flex items-center justify-center">
                <span className="text-4xl opacity-30">🎫</span>
              </div>
            )}

            {/* Date badge */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm text-center min-w-[52px]">
              <span className="block text-lg font-extrabold leading-tight text-foreground">
                {dia}
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {mes}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Classification badge */}
            <span
              className={cn(
                "self-start text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2",
                clasColor
              )}
            >
              {clasLabel}
            </span>

            {/* Event name */}
            <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2 leading-snug">
              {evento.nombre}
            </h3>

            {/* Venue + City */}
            <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/60" />
              <span className="line-clamp-1">
                {evento.lugar}
                {evento.ciudad ? `, ${evento.ciudad}` : ""}
              </span>
            </div>

            {/* Hora */}
            {evento.hora && (
              <p className="text-xs text-muted-foreground mb-2">
                {evento.hora} h
              </p>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price range */}
            {evento.precio_min != null && (
              <p className="text-sm font-semibold text-foreground mt-1">
                Desde {evento.precio_min.toFixed(2).replace(".", ",")}€
                {evento.precio_max != null &&
                  evento.precio_max !== evento.precio_min && (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      - {evento.precio_max.toFixed(2).replace(".", ",")}€
                    </span>
                  )}
              </p>
            )}
          </div>
        </div>
      </a>
    </motion.div>
  );
}
