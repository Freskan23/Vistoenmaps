import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "light" | "dark";
}

export default function Breadcrumb({ items, variant = "dark" }: BreadcrumbProps) {
  const isOnDark = variant === "dark";
  const linkClass = isOnDark
    ? "text-white/60 hover:text-white transition-colors"
    : "text-muted-foreground hover:text-primary transition-colors";
  const activeClass = isOnDark
    ? "text-white font-medium"
    : "text-foreground font-medium";
  const separatorClass = isOnDark
    ? "text-white/30"
    : "text-muted-foreground/60";

  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex items-center gap-1.5 text-sm flex-wrap">
        <li>
          <Link href="/" className={`${linkClass} flex items-center gap-1`}>
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className={`w-3.5 h-3.5 ${separatorClass}`} />
            {item.href ? (
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ) : (
              <span className={activeClass}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
