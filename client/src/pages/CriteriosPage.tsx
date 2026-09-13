import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import resumen from "@/data/resumen.json";
import { Check, X, Info } from "lucide-react";

/**
 * Pagina de criterios.
 *
 * Existe porque sin esto el directorio no es creible: cualquiera puede decir
 * "los mejores". Aqui se explica de donde salen los datos, como se ordenan y
 * que hacen (y que NO hacen) los espacios destacados.
 *
 * REGLA: aqui no se promete nada que no se cumpla en el codigo. Si cambia el
 * orden de los listados, esta pagina cambia el mismo dia.
 */
export default function CriteriosPage() {
  const fmt = new Intl.NumberFormat("es-ES");

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Cómo seleccionamos y ordenamos los negocios | Visto en Maps"
        description="De dónde salen los datos del directorio, cómo se ordenan los listados y qué hacen los espacios destacados. Sin letra pequeña."
        canonical="https://vistoenmaps.com/criterios"
      />
      <Header />

      <section className="bg-primary text-primary-foreground">
        <div className="container py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
              Criterios
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">
              Cómo seleccionamos y ordenamos los negocios
            </h1>
            <p className="mt-4 text-primary-foreground/80 leading-relaxed">
              Cualquiera puede titular «los mejores». Esto es lo que hay detrás de cada
              listado de este directorio, para que puedas juzgar si te sirve.
            </p>
          </div>
        </div>
      </section>

      <main className="container py-10 md:py-14 flex-1 max-w-3xl">
        <article className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-foreground">De dónde salen los datos</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              De las fichas públicas de Google Maps: nombre, dirección, teléfono, horario,
              la nota y el número de opiniones. No pedimos nada a los negocios para
              aparecer y no hace falta que hagan nada.
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Decimos <strong>«valoraciones publicadas en Google Maps»</strong> y no
              «reseñas reales» a propósito: no tenemos forma de comprobar una por una si
              cada opinión es auténtica. Lo que sí hacemos es dar más peso a los negocios
              con muchas opiniones, porque son más difíciles de manipular.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">
              Cómo comprobamos que un negocio pertenece a su categoría
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              El nombre no basta. Una inmobiliaria llamada «Parque de las Avenidas» no es
              un parque, y llegó a salir la primera en un listado de parques. Ahora
              comparamos con el tipo que Google asigna a cada ficha: un parque de verdad
              está etiquetado como «Parque» o «Atracción turística».
            </p>
            <ul className="mt-4 space-y-2.5">
              <li className="flex gap-2.5 text-sm">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Confirmado:</strong> el tipo de Google
                  coincide con la categoría. Son los únicos que entran en las guías.
                </span>
              </li>
              <li className="flex gap-2.5 text-sm">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Sin confirmar:</strong> Google no
                  publica el tipo de esa ficha. Aparece en el listado, pero nunca lidera
                  una guía.
                </span>
              </li>
              <li className="flex gap-2.5 text-sm">
                <X className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Descartado:</strong> el tipo o el
                  nombre indican otro negocio. Fuera de las guías.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Cómo se ordenan los listados</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              No por la nota a secas. Un 5,0 con tres opiniones no dice lo mismo que un 4,7
              con veinte mil, y ordenar por nota pura ponía negocios desconocidos por
              delante del Parque de El Retiro. Combinamos la nota con el número de
              opiniones: cuantas más opiniones, más peso tiene su nota.
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              El orden final es: primero que el negocio pertenezca de verdad a la
              categoría, después las fichas verificadas por su propietario, y después la
              calidad medida así.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">
              Qué hacen los espacios destacados
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Un negocio puede verificar su ficha y aparecer marcado como verificado. Eso
              le da visibilidad dentro de su listado, y lo decimos claramente con una
              etiqueta.
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              <strong>Lo que no hace:</strong> no cambia el orden de las guías ni la nota
              de nadie, y no saca a ningún competidor del listado. Si alguna vez eso
              cambiara, estaría escrito aquí antes que en ningún otro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Qué falta por mejorar</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Preferimos decirlo a que lo descubras tú:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
              <li>
                Muchas fichas no tienen teléfono, horario o web porque Google no los
                publica. Cuando falta un dato, no lo inventamos: no aparece.
              </li>
              <li>
                Aún no hay fotografías propias de los sitios.
              </li>
              <li>
                Las guías cubren {fmt.format(resumen.totalCiudades)} ciudades, pero solo
                las combinaciones con suficientes negocios comprobados tienen guía propia.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/60 bg-white p-5">
            <h2 className="text-base font-bold text-foreground">
              ¿Has visto algo mal?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Si un negocio está mal clasificado, tiene datos incorrectos o quieres que
              retiremos tu ficha, escríbenos y lo corregimos.
            </p>
            <a
              href="/contacto"
              className="mt-4 inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Avisar de un error
            </a>
          </section>

          <p className="text-xs text-muted-foreground">
            Última revisión de estos criterios: 13 de septiembre de 2026.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
