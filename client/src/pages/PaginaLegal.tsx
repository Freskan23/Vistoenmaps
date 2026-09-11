import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

interface Seccion {
  titulo: string;
  parrafos: string[];
}

/** Estructura comun de las paginas legales, para que se vean iguales. */
export function PaginaLegal({
  titulo,
  descripcion,
  ruta,
  actualizado,
  secciones,
}: {
  titulo: string;
  descripcion: string;
  ruta: string;
  actualizado: string;
  secciones: Seccion[];
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title={`${titulo} | Visto en Maps`}
        description={descripcion}
        canonical={`https://vistoenmaps.com/${ruta}`}
      />
      <Header />

      <main className="container py-10 md:py-14 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{titulo}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última actualización: {actualizado}
          </p>

          <div className="mt-8 space-y-8">
            {secciones.map((s) => (
              <section key={s.titulo}>
                <h2 className="text-lg font-bold text-foreground mb-2">{s.titulo}</h2>
                {s.parrafos.map((p, i) => (
                  <p key={i} className="text-[15px] leading-relaxed text-muted-foreground mb-3">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PaginaLegal;
