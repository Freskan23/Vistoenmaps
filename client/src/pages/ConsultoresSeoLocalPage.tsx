import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ExternalLink } from "lucide-react";

/**
 * Guia editorial: consultores de SEO local en España.
 *
 * Distinta de las 105 guias automaticas de /precios (esas salen de datos de
 * Google Maps de negocios locales). Esta es una pieza escrita a mano sobre
 * consultores y agencias de SEO local, un sector que vive DENTRO del mismo
 * espacio que este directorio.
 *
 * REGLA: cada cifra que aparece aqui tiene que poder rastrearse a una fuente
 * verificada con navegador real, citada en <Fuente>. Nada de estimaciones,
 * nada de estrellas puestas a ojo.
 *
 * Edu (14/09/2026): "los errores, el registro mercantil... no lo veo
 * necesario... meter mierda no mola". Se quitaron los avisos de
 * contradicciones entre las propias cifras de cada consultor (Aviso en ambar)
 * y los detalles de registro mercantil (CIF, administrador). La pagina se
 * queda en positivo: lo que cada uno hace bien, con su fuente. No es un
 * ejercicio de cazar gazapos a la competencia.
 *
 * Verificado por navegador real el 24/09/2026 (8 investigaciones paralelas).
 */

function Fuente({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

function Perfil({
  nombre,
  proyecto,
  ubicacion,
  children,
}: {
  nombre: string;
  proyecto: string;
  ubicacion: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border/60 bg-white p-6 md:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-xl font-extrabold text-foreground">{nombre}</h2>
        <span className="text-xs text-muted-foreground">{ubicacion}</span>
      </div>
      <p className="text-sm text-accent font-semibold mt-0.5">{proyecto}</p>
      <div className="mt-4 space-y-3 text-sm text-foreground/85 leading-relaxed">
        {children}
      </div>
    </article>
  );
}

export default function ConsultoresSeoLocalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Consultores de SEO local en España: quién es quién | Visto en Maps"
        description="Siete perfiles de SEO local en España, con lo que cada uno hace bien y con fuentes verificables para cada dato."
        canonical="https://vistoenmaps.com/blog/consultores-seo-local-espana"
      />
      <Header />

      <section className="bg-primary text-primary-foreground">
        <div className="container py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
              Sector
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">
              Consultores de SEO local en España: quién es quién
            </h1>
            <p className="mt-4 text-primary-foreground/80 leading-relaxed">
              No es un ranking con estrellas. Es lo que hemos podido verificar de
              siete perfiles del sector, con la fuente de cada dato.
            </p>
          </div>
        </div>
      </section>

      <main className="container py-10 md:py-14 flex-1 max-w-3xl">
        <article className="space-y-8">
          <section>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El SEO local en España lo trabajan desde consultores que llevan
              quince años con una libreta y un cliente a la vez, hasta agencias
              con un equipo en plantilla y un reportaje en Forbes. Aquí van siete
              perfiles con presencia pública verificable, cada uno con lo que le
              hace destacar, visitado con navegador real, web por web y perfil
              por perfil.
            </p>
          </section>

          <Perfil nombre="Edu Laborda" proyecto="Trafikazo · Local Brain · YinyangSEO Academy" ubicacion="España">
            <p>
              Consultor de SEO local desde 2011, cuando gestionó su primera
              cuenta de Google Places. En 2019 cofunda YinyangSEO, la academia
              con la que empieza a formar a otros consultores.
            </p>
            <p>
              Su ecosistema no es solo consultoría: <strong>Trafikazo</strong>{" "}
              (SaaS de posicionamiento y tráfico local), <strong>Local
              Brain</strong> (gestión de fichas de Google Business Profile para
              agencias) y la propia academia, con podcast y directos semanales
              en Twitch analizando fichas reales. Su web declara +500 negocios
              posicionados y +2.000 alumnos formados. Tiene una entrevista en
              el medio digital OpenNemas (feb. 2026).
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Fuente url="https://edulaborda.com/">edulaborda.com</Fuente>
              <Fuente url="https://blog.opennemas.es/articulo/openpodcast/entrevista-edu-laborda-seo-local/20250204214223003507.html">
                Entrevista en OpenNemas
              </Fuente>
              <Fuente url="https://trafikazo.com/">Trafikazo</Fuente>
            </div>
          </Perfil>

          <Perfil
            nombre="Javier Agote y Jaime Toural"
            proyecto="LocalMetric — SEO local para restaurantes"
            ubicacion="Torrelodones, Madrid"
          >
            <p>
              LocalMetric es la agencia más especializada en un solo vertical
              de las que hemos revisado: restaurantes, en España y varios
              países más. Han trabajado con miles de restaurantes según su
              propia comunicación, con casos como un local en Ibiza que
              cuadruplicó su facturación diaria.
            </p>
            <p>
              Agote y Toural aparecen en <strong>Forbes España</strong>, número
              de septiembre de 2026, con un reportaje titulado «Si no
              apareces, no existes».
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Fuente url="https://www.localmetric.es/">localmetric.es</Fuente>
              <Fuente url="https://www.zinio.com/es/publications/forbes-espana/7311/issues/728393/articles">
                Forbes España, sept. 2026
              </Fuente>
            </div>
          </Perfil>

          <Perfil nombre="Guillermo Suils" proyecto="Consultor SEO Local" ubicacion="Zaragoza">
            <p>
              El más grande en arquitectura de páginas por ciudad de los que
              hemos revisado: su web cubre cerca de 235 ciudades repartidas por
              comunidad autónoma, con página propia para cada una.
            </p>
            <p>
              La Cámara de Comercio de Zaragoza le dedicó un artículo el 18 de
              junio de 2026 al incorporarse a su Club de socios, describiéndolo
              como especialista en SEO local y Google Maps.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Fuente url="https://guillermosuils.com/">guillermosuils.com</Fuente>
              <Fuente url="https://redaccion.camarazaragoza.com/guillermo-suils-seo-local-zaragoza/">
                Cámara de Comercio de Zaragoza
              </Fuente>
            </div>
          </Perfil>

          <Perfil nombre="Rubén Santaella" proyecto="Consultor SEO freelance" ubicacion="Torremolinos, Málaga">
            <p>
              El de trayectoria más larga del grupo: ingeniero informático por
              la Universidad de Málaga, trabajó como responsable de
              informática en el parque de atracciones Tívoli World antes de
              montar su propia consultora en 2012. Cubre Málaga capital,
              Torremolinos y Marbella.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Fuente url="https://www.rubensantaella.es">rubensantaella.es</Fuente>
              <Fuente url="https://portfolio.rubensantaella.es/">Portfolio</Fuente>
            </div>
          </Perfil>

          <Perfil nombre="Marc García" proyecto="La Tribu Local · Rank & Rent" ubicacion="Sabadell, Barcelona">
            <p>
              El más orientado a comunidad de pago: «La Tribu Local» enseña el
              modelo Rank & Rent (crear fichas y webs que posicionan, y
              alquilarlas a negocios), con dos herramientas propias —RANKIT y
              GestionaLeads— y sesiones semanales en directo.
            </p>
            <p>
              Ficha en Trustpilot con 4,4 sobre 5 y 10 opiniones.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Fuente url="https://marcgarciaseo.es">marcgarciaseo.es</Fuente>
              <Fuente url="https://es.trustpilot.com/review/marcgarciaseo.es">
                Trustpilot
              </Fuente>
            </div>
          </Perfil>

          <Perfil nombre="Irene Lázaro" proyecto="Academia GEO" ubicacion="Madrid">
            <p>
              La propuesta más clara de explicar en una frase: consultora
              especializada solo en SEO local y Google Business Profile, con
              clientes declarados en Ávila, Segovia, Madrid, Valencia y
              Salamanca. Ha creado Academia GEO, una plataforma gratuita sobre
              posicionamiento en buscadores de IA (GEO/AEO), con un curso de 18
              módulos.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Fuente url="https://soyirenelazaro.com/">soyirenelazaro.com</Fuente>
              <Fuente url="https://academiageo.saaslab.es/">Academia GEO</Fuente>
            </div>
          </Perfil>

          <Perfil nombre="Toni Valls" proyecto="Aistudio — SEO local + IA" ubicacion="España">
            <p>
              Consultoría centrada en combinar SEO local con inteligencia
              artificial: auditorías, webs con SEO local incluido y mentoría
              intensiva para negocios que quieren dar el salto con IA.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Fuente url="https://aistudio.com.es">aistudio.com.es</Fuente>
            </div>
          </Perfil>

          <section className="pt-4 border-t border-border/60">
            <h2 className="text-lg font-bold text-foreground">
              Cómo hemos verificado esto
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Cada dato de esta página se comprobó visitando la web o la fuente
              de prensa citada, con navegador real, el 24 de septiembre de
              2026. Si detectas un dato desactualizado o un enlace roto,
              escríbenos desde{" "}
              <a href="/contacto" className="text-primary underline">
                la página de contacto
              </a>
              .
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
