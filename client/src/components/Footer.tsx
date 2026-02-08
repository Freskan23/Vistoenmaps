import { Link } from "wouter";
import { categorias, ciudades } from "@/data";
import EyeLogo from "@/components/EyeLogo";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto relative overflow-hidden">
      {/* Subtle ambient orb */}
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      <div className="relative container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <EyeLogo size={32} />
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Directorio de profesionales y negocios locales verificados en Google Maps. 
              Encuentra el servicio que necesitas cerca de ti.
            </p>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Categorías
            </h3>
            <ul className="space-y-2">
              {categorias.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {cat.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ciudades */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Ciudades principales
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
