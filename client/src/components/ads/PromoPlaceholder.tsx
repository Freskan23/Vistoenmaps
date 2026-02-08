import { Link } from "wouter";
import { Sparkles, TrendingUp, ArrowRight, Star, Megaphone } from "lucide-react";
import { useMemo } from "react";
import type { AdFormat } from "@/lib/adConfig";

interface PromoPlaceholderProps {
  format: AdFormat;
  slot: string;
  className?: string;
}

/* ── Copy variantes con rotación basada en slot ── */
const PROMOS_HORIZONTAL = [
  {
    icon: Sparkles,
    iconColor: "text-amber-500",
    iconBg: "from-amber-500/15 to-orange-500/10",
    titulo: "Tu negocio aquí",
    texto: "Más de 2.000 personas ven esta página cada semana. Haz que te encuentren.",
    cta: "Destaca tu negocio",
  },
  {
    icon: TrendingUp,
    iconColor: "text-emerald-500",
    iconBg: "from-emerald-500/15 to-teal-500/10",
    titulo: "¿Quieres aparecer el primero?",
    texto: "Los negocios destacados reciben 3x más contactos que el resto.",
    cta: "Saber más",
  },
  {
    icon: Megaphone,
    iconColor: "text-blue-500",
    iconBg: "from-blue-500/15 to-cyan-500/10",
    titulo: "Espacio disponible",
    texto: "Destaca tu negocio y llega a clientes que buscan exactamente lo que ofreces.",
    cta: "Empezar ahora",
  },
  {
    icon: Star,
    iconColor: "text-purple-500",
    iconBg: "from-purple-500/15 to-pink-500/10",
    titulo: "Posición premium",
    texto: "Los negocios destacados reciben un 70% más de llamadas. Compruébalo.",
    cta: "Ver planes",
  },
];

const PROMOS_CARD = [
  {
    titulo: "Tu negocio podría estar aquí",
    texto: "Destaca entre la competencia y recibe más clientes.",
    cta: "Más info",
  },
  {
    titulo: "Espacio destacado",
    texto: "Los negocios destacados reciben 3x más visitas.",
    cta: "Destacar",
  },
  {
    titulo: "¿Es tu negocio?",
    texto: "Aparece aquí y llega a quien te busca.",
    cta: "Ver planes",
  },
];

function hashSlot(slot: string): number {
  let h = 0;
  for (let i = 0; i < slot.length; i++) {
    h = (h * 31 + slot.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function PromoPlaceholder({ format, slot, className = "" }: PromoPlaceholderProps) {
  const promo = useMemo(() => {
    const idx = hashSlot(slot);
    if (format === "card") return PROMOS_CARD[idx % PROMOS_CARD.length];
    return PROMOS_HORIZONTAL[idx % PROMOS_HORIZONTAL.length];
  }, [slot, format]);

  if (format === "card") {
    return (
      <div
        className={`group relative bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 border-2 border-dashed border-amber-300/50 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400/70 hover:shadow-md transition-all duration-300 ${className}`}
      >
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 mb-3">
            <Sparkles className="w-3 h-3" />
            Espacio destacado
          </div>
          <p className="font-bold text-sm text-foreground leading-snug mb-1.5">
            {promo.titulo}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {promo.texto}
          </p>
        </div>
        <Link
          href="/contacto"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors group-hover:gap-2"
        >
          {promo.cta}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  /* ── Formato horizontal (entre secciones) ── */
  const h = promo as (typeof PROMOS_HORIZONTAL)[number];
  const Icon = "icon" in h ? h.icon : Sparkles;
  const iconColor = "iconColor" in h ? h.iconColor : "text-amber-500";
  const iconBg = "iconBg" in h ? h.iconBg : "from-amber-500/15 to-orange-500/10";

  return (
    <div
      className={`relative bg-gradient-to-r from-amber-50/60 via-white to-orange-50/40 border border-dashed border-amber-300/50 rounded-2xl p-5 md:p-6 hover:border-amber-400/60 hover:shadow-sm transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div
          className={`w-11 h-11 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-foreground mb-0.5">
            {h.titulo}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {h.texto}
          </p>
        </div>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all hover:scale-105 shadow-sm shadow-amber-500/20 shrink-0"
        >
          {h.cta}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
