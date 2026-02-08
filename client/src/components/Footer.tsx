import { Link } from "wouter";
import { ciudades } from "@/data";
import { superCategorias } from "@/data/superCategorias";
import EyeLogo from "@/components/EyeLogo";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto relative overflow-hidden">
      {/* Subtle ambient orb */}
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      <div className="relative container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <EyeLogo size={32} />
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Directorio de profesionales y negocios locales verificados en Google Maps.
              Encuentra el servicio que necesitas cerca de ti.
            </p>
          </div>

          {/* Directorio */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Directorio
            </h3>
            <ul className="space-y-2">
              {superCategorias.map((sc) => (
                <li key={sc.slug}>
                  <Link
                    href={`/directorio/${sc.slug}`}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {sc.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ciudades */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Ciudades
            </h3>
            <ul className="space-y-2">
              {ciudades.map((ciudad) => (
                <li key={ciudad.slug}>
                  <Link
                    href={`/cerrajeros/${ciudad.slug}`}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {ciudad.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Recursos
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/eventos", label: "Eventos" },
                { href: "/blog", label: "Blog" },
                { href: "/directorios", label: "Directorios" },
                { href: "/contacto", label: "Contacto" },
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
            © {new Date().getFullYear()} Visto en Maps. Todos los derechos reservados.
          </p>
          <Link
            href="/contacto"
            className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}
