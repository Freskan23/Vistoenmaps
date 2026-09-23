import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * Guia editorial: consultores de SEO local en España.
 *
 * Distinta de las 105 guias automaticas de /precios (esas salen de datos de
 * Google Maps de negocios locales). Esta es una pieza escrita a mano sobre
 * consultores y agencias de SEO local, un sector que vive DENTRO del mismo
 * espacio que este directorio.
 *
 * REGLA DE ESTA PAGINA (motivo por el que existe este comentario):
 * cada cifra que aparece aqui tiene que poder rastrearse a una fuente
 * verificada con navegador real, citada en <Fuente>. Nada de estimaciones,
 * nada de "segun IA", nada de estrellas puestas a ojo. Si una cifra es
 * autopublicada por el propio consultor (su web, su LinkedIn) se dice tal
 * cual: "declara", "afirma en su web" — nunca se presenta como un hecho
 * auditado si no lo es.
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

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>{children}</span>
    </p>
  );
}

export default function ConsultoresSeoLocalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Consultores de SEO local en España: quién es quién | Visto en Maps"
        description="Siete perfiles de SEO local en España, con lo que cada uno hace bien y con fuentes verificables para cada dato. Sin ranking de estrellas inventado."
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
              siete perfiles del sector, con la fuente de cada dato. Donde solo
              hay una cifra autopublicada, lo decimos así.
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
              con nueve personas en plantilla y un reportaje en Forbes. No hay
              un examen oficial que diga quién es «el mejor»: lo único que se
              puede hacer honestamente es mirar qué tiene cada uno detrás y de
              dónde sale cada cifra que presume. Eso es lo que hemos hecho aquí,
              con navegador real, visitando cada web y cada perfil uno por uno.
            </p>
          </section>

          <Perfil nombre="Edu Laborda" proyecto="Trafikazo · Local Brain · YinyangSEO Academy" ubicacion="España">
            <p>
              Consultor de SEO local desde 2011 (primera carta de verificación
              de Google Places, según su web). En 2019 cofunda YinyangSEO, la
              academia con la que empieza a formar a otros consultores; son dos
              hitos distintos, no una contradicción.
            </p>
            <p>
              Su ecosistema no es solo consultoría: <strong>Trafikazo</strong>{" "}
              (SaaS de posicionamiento y tráfico local, desde 186,25 €/año),{" "}
              <strong>Local Brain</strong> (gestión de fichas de Google Business
              Profile para agencias) y la propia academia, con podcast y directos
              semanales en Twitch analizando fichas reales.
            </p>
            <p>
              Su web declara +500 negocios posicionados y +2.000 alumnos
              formados; son cifras autopublicadas, sin auditoría externa que las
              confirme. Tiene una entrevista real en el medio digital OpenNemas
              (feb. 2026).
            </p>
            <Aviso>
              Su cuenta de X enlazada desde la web (@Edu_Yinyangseo) da «esta
              página no existe» a día de hoy.
            </Aviso>
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
              LocalMetric SL está registrada en Torrelodones desde mayo de 2019,
              con Jaime Toural como administrador único. Es la agencia más
              orientada a un solo vertical de las que hemos revisado:
              restaurantes, en España y varios países más.
            </p>
            <p>
              Es real que Agote y Toural aparecen en <strong>Forbes España</strong>,
              número de septiembre de 2026, con un reportaje titulado «Si no
              apareces, no existes» — confirmado en la edición impresa vía
              Zinio. La web habla de más de 3.500 restaurantes con los que han
              trabajado y 1.200 clientes activos, pero esa cifra sale de una
              única fuente (un reportaje patrocinado en La Vanguardia), sin
              confirmación cruzada. Una oferta de empleo real en LinkedIn sitúa
              el equipo en 9 personas.
            </p>
            <Aviso>
              La mención de Forbes existe solo en la edición impresa/Zinio; no
              hay artículo publicado en forbes.es.
            </Aviso>
            <div className="flex flex-wrap gap-3 pt-1">
              <Fuente url="https://www.localmetric.es/">localmetric.es</Fuente>
              <Fuente url="https://www.zinio.com/es/publications/forbes-espana/7311/issues/728393/articles">
                Forbes España, sept. 2026
              </Fuente>
              <Fuente url="https://www.datoscif.es/empresa/localmetric-sl">
                Registro mercantil
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
              como especialista en SEO local y Google Maps — es la mención
              externa más sólida de este grupo, junto a la de LocalMetric.
            </p>
            <Aviso>
              Su propia web dice «+5 años» de experiencia en SEO local en una
              sección y «+8 años» en otra; y su LinkedIn habla de «más de
              quince años en marketing digital» (no específicamente SEO local).
            </Aviso>
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
              la Universidad de Málaga, trabajó doce años como responsable de
              informática en el parque de atracciones Tívoli World antes de
              montar su propia consultora en 2012. Cubre Málaga capital,
              Torremolinos y Marbella.
            </p>
            <Aviso>
              Tres fuentes suyas dan tres cifras distintas de años de
              experiencia: 20 en su web principal, 15 en su portfolio y 12 en
              un directorio de terceros.
            </Aviso>
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
              GestionaLeads— y sesiones semanales en directo. En Skool tiene 29
              miembros con valoración 5,0 sobre 9 reseñas.
            </p>
            <p>
              Ficha real en Trustpilot: 4,4 sobre 5 con 10 opiniones. Es el
              perfil con menor huella en redes de los siete (71 seguidores en
              LinkedIn, 135 en Instagram).
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
            <Aviso>
              Los paneles de métricas de su web (llamadas, clics, vistas en
              Maps) parecen un mockup ilustrativo del servicio, no datos
              verificados de un cliente concreto.
            </Aviso>
            <div className="flex flex-wrap gap-3 pt-1">
              <Fuente url="https://soyirenelazaro.com/">soyirenelazaro.com</Fuente>
              <Fuente url="https://academiageo.saaslab.es/">Academia GEO</Fuente>
            </div>
          </Perfil>

          <Perfil nombre="Toni Valls" proyecto="Aistudio — SEO local + IA" ubicacion="España">
            <p>
              El perfil con huella pública más débil de los siete: no hemos
              encontrado LinkedIn personal, página de empresa en LinkedIn, ni
              cuentas activas en redes (los enlaces del pie de su web apuntan a
              las páginas genéricas de Instagram, YouTube o X, no a un perfil
              propio).
            </p>
            <Aviso>
              La web declara «+350 negocios posicionados» en una sección y
              «+500» en otra. Los contadores de la portada están animados por
              JavaScript y en la carga inicial muestran «0».
            </Aviso>
            <div className="flex flex-wrap gap-3 pt-1">
              <Fuente url="https://aistudio.com.es">aistudio.com.es</Fuente>
            </div>
          </Perfil>

          <section className="pt-4 border-t border-border/60">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Cómo hemos verificado esto
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Cada dato de esta página se comprobó visitando la web, el
              LinkedIn, el registro mercantil o la fuente de prensa citada, con
              navegador real, el 24 de septiembre de 2026. Donde una cifra solo
              existe en la propia web del consultor, lo decimos con «declara» o
              «afirma»: no la presentamos como un hecho auditado. Si detectas un
              dato desactualizado o un enlace roto, escríbenos desde{" "}
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
