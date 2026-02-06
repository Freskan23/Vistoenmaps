// Build v2: comprehensive directories data from filtered + curated sources
const fs = require("fs");
const path = require("path");

// Curated with hand-written descriptions (premium + key ones)
const curated = {
  "google.com": { nombre: "Google Business Profile", url: "https://business.google.com", descripcion: "Imprescindible para aparecer en Google Maps y resultados de busqueda local.", tipo: "premium", categoria: "general", gratis: true, permiteResenas: true, alcance: "global", popularidad: 100 },
  "paginasamarillas.es": { nombre: "Paginas Amarillas", url: "https://www.paginasamarillas.es", descripcion: "El directorio de empresas mas conocido de Espana con miles de negocios verificados.", tipo: "premium", categoria: "general", gratis: true, permiteResenas: true, alcance: "nacional", popularidad: 95 },
  "qdq.com": { nombre: "QDQ", url: "https://www.qdq.com", descripcion: "Directorio de profesionales y empresas en Espana con busqueda por localidad.", tipo: "premium", categoria: "general", gratis: true, permiteResenas: true, alcance: "nacional", popularidad: 85 },
  "cylex.es": { nombre: "Cylex", url: "https://www.cylex.es", descripcion: "Directorio de empresas con fichas detalladas, horarios, fotos y resenas. Presente en 30+ paises.", tipo: "premium", categoria: "general", gratis: true, permiteResenas: true, alcance: "internacional", popularidad: 90 },
  "infoisinfo.es": { nombre: "InfoIsInfo", url: "https://www.infoisinfo.es", descripcion: "Directorio empresarial con informacion detallada por provincia y categoria en toda Espana.", tipo: "premium", categoria: "general", gratis: true, permiteResenas: true, alcance: "nacional", popularidad: 80 },
  "trustpilot.com": { nombre: "Trustpilot", url: "https://www.trustpilot.com", descripcion: "Plataforma global de resenas verificadas para construir confianza y reputacion online.", tipo: "premium", categoria: "resenas", gratis: true, permiteResenas: true, alcance: "global", popularidad: 88 },
  "hotfrog.es": { nombre: "Hotfrog", url: "https://www.hotfrog.es", descripcion: "Directorio internacional de negocios locales con perfiles gratuitos.", tipo: "premium", categoria: "general", gratis: true, permiteResenas: false, alcance: "internacional", popularidad: 75 },
  "cronoshare.com": { nombre: "Cronoshare", url: "https://www.cronoshare.com", descripcion: "Plataforma para encontrar y contratar profesionales. Publica proyectos y recibe presupuestos.", tipo: "premium", categoria: "servicios", gratis: false, permiteResenas: true, alcance: "nacional", popularidad: 82 },
  "habitissimo.es": { nombre: "Habitissimo", url: "https://www.habitissimo.es", descripcion: "Directorio especializado en reformas, obras y servicios para el hogar.", tipo: "premium", categoria: "reformas", gratis: false, permiteResenas: true, alcance: "nacional", popularidad: 84 },
  "milanuncios.com": { nombre: "Milanuncios", url: "https://www.milanuncios.com", descripcion: "Portal de anuncios clasificados lider en Espana. Ideal para servicios y negocios locales.", tipo: "premium", categoria: "general", gratis: true, permiteResenas: false, alcance: "nacional", popularidad: 92 },
  "yelp.com": { nombre: "Yelp", url: "https://www.yelp.es", descripcion: "Plataforma de resenas y descubrimiento de negocios locales.", tipo: "premium", categoria: "resenas", gratis: true, permiteResenas: true, alcance: "global", popularidad: 78 },
  "tripadvisor.es": { nombre: "TripAdvisor", url: "https://www.tripadvisor.es", descripcion: "La mayor plataforma de resenas de viajes, restaurantes y experiencias del mundo.", tipo: "premium", categoria: "resenas", gratis: true, permiteResenas: true, alcance: "global", popularidad: 92 },
  "provenexpert.com": { nombre: "ProvenExpert", url: "https://www.provenexpert.com", descripcion: "Plataforma de gestion de reputacion online con resenas verificadas y sellos de calidad.", tipo: "premium", categoria: "resenas", gratis: true, permiteResenas: true, alcance: "global", popularidad: 65 },
  "kompass.com": { nombre: "Kompass", url: "https://www.kompass.com", descripcion: "Directorio B2B internacional con mas de 60 millones de empresas.", tipo: "premium", categoria: "b2b", gratis: true, permiteResenas: false, alcance: "global", popularidad: 72 },
  "europages.es": { nombre: "Europages", url: "https://www.europages.es", descripcion: "Directorio B2B europeo para encontrar proveedores y fabricantes por sector.", tipo: "premium", categoria: "b2b", gratis: true, permiteResenas: false, alcance: "europeo", popularidad: 70 },
  "interempresas.net": { nombre: "Interempresas", url: "https://www.interempresas.net", descripcion: "Portal B2B lider en Espana con noticias y directorio industrial por sector.", tipo: "premium", categoria: "b2b", gratis: true, permiteResenas: false, alcance: "nacional", popularidad: 74 },
  "facebook.com": { nombre: "Facebook Business", url: "https://www.facebook.com/business", descripcion: "Pagina de negocio en Facebook para conectar con clientes y recibir resenas.", tipo: "social", categoria: "social", gratis: true, permiteResenas: true, alcance: "global", popularidad: 96 },
  "instagram.com": { nombre: "Instagram Business", url: "https://business.instagram.com", descripcion: "Perfil profesional en Instagram para mostrar servicios con fotos y reels.", tipo: "social", categoria: "social", gratis: true, permiteResenas: false, alcance: "global", popularidad: 94 },
  "linkedin.com": { nombre: "LinkedIn", url: "https://www.linkedin.com", descripcion: "Red profesional para empresas. Pagina de empresa, networking y leads B2B.", tipo: "social", categoria: "social", gratis: true, permiteResenas: false, alcance: "global", popularidad: 88 },
  "tiktok.com": { nombre: "TikTok", url: "https://www.tiktok.com", descripcion: "Plataforma de video corto con perfil de negocio para llegar a audiencias jovenes.", tipo: "social", categoria: "social", gratis: true, permiteResenas: false, alcance: "global", popularidad: 85 },
  "youtube.com": { nombre: "YouTube", url: "https://www.youtube.com", descripcion: "Plataforma de video para mostrar tu negocio, tutoriales y testimonios de clientes.", tipo: "social", categoria: "social", gratis: true, permiteResenas: false, alcance: "global", popularidad: 90 },
  "pinterest.com": { nombre: "Pinterest", url: "https://www.pinterest.com", descripcion: "Red social visual ideal para negocios de diseno, decoracion y servicios creativos.", tipo: "social", categoria: "social", gratis: true, permiteResenas: false, alcance: "global", popularidad: 70 },
  "x.com": { nombre: "X (Twitter)", url: "https://www.x.com", descripcion: "Red social para comunicacion rapida, atencion al cliente y marca personal.", tipo: "social", categoria: "social", gratis: true, permiteResenas: false, alcance: "global", popularidad: 75 },
  "nextdoor.com": { nombre: "Nextdoor", url: "https://nextdoor.com", descripcion: "Red social de barrio donde vecinos recomiendan negocios y profesionales locales.", tipo: "social", categoria: "social", gratis: true, permiteResenas: true, alcance: "local", popularidad: 60 },
};

// All directories from the filtered analysis
const allDirs = [
  { domain: "cylex.es" },
  { domain: "maptons.com", nombre: "Maptons", descripcion: "Directorio de negocios basado en mapas con fichas de ubicacion y contacto." },
  { domain: "polomap.com", nombre: "Polomap", descripcion: "Directorio de empresas y profesionales con mapa interactivo por ciudad." },
  { domain: "facebook.com" },
  { domain: "directoriogratis.es", nombre: "Directorio Gratis", descripcion: "Directorio gratuito de empresas y profesionales en Espana por provincia." },
  { domain: "paginasamarillas.es" },
  { domain: "instagram.com" },
  { domain: "cerrajerosenespana.click", nombre: "Cerrajeros en Espana", descripcion: "Directorio especializado en cerrajeros por ciudad en Espana.", categoria: "servicios" },
  { domain: "serviciosdemantenimiento.es", nombre: "Servicios de Mantenimiento", descripcion: "Directorio de empresas de mantenimiento y servicios para el hogar.", categoria: "servicios" },
  { domain: "firmania.es", nombre: "Firmania", descripcion: "Directorio de empresas en Espana con datos de contacto y clasificacion por sector." },
  { domain: "cataloxy.es", nombre: "Cataloxy", descripcion: "Directorio de empresas espanolas organizado por localidad y sector." },
  { domain: "cybo.com", nombre: "Cybo", descripcion: "Directorio global de negocios con informacion de contacto y horarios." },
  { domain: "infoisinfo.es" },
  { domain: "cronoshare.com" },
  { domain: "provenexpert.com" },
  { domain: "todoenlaces.com", nombre: "TodoEnlaces", descripcion: "Directorio de servicios y empresas clasificados por ubicacion y tipo de negocio." },
  { domain: "servipyme.com", nombre: "ServiPyme", descripcion: "Directorio de PYMES y servicios profesionales organizados por localidad.", categoria: "servicios" },
  { domain: "linkedin.com" },
  { domain: "emprenemjunts.es", nombre: "Emprenem Junts", descripcion: "Portal de apoyo al emprendimiento de la Comunitat Valenciana con directorio de empresas." },
  { domain: "empresasespanolas.net", nombre: "Empresas Espanolas", descripcion: "Base de datos de empresas espanolas con informacion de contacto y clasificacion CNAE." },
  { domain: "botiguesdecatalunya.cat", nombre: "Botigues de Catalunya", descripcion: "Directorio de comercios y tiendas de Catalunya." },
  { domain: "nextdoor.com" },
  { domain: "planreforma.com", nombre: "PlanReforma", descripcion: "Directorio de profesionales de reforma y decoracion con fotos de proyectos reales." },
  { domain: "wheree.com", nombre: "Wheree", descripcion: "Directorio de negocios y servicios con fichas organizadas por localidad." },
  { domain: "paxinasgalegas.es", nombre: "Paxinas Galegas", descripcion: "Directorio de empresas y profesionales de Galicia." },
  { domain: "todosbiz.es", nombre: "TodosBiz", descripcion: "Directorio de negocios locales en Espana con fichas de empresa." },
  { domain: "wanderboat.ai", nombre: "Wanderboat", descripcion: "Plataforma de descubrimiento de negocios locales con IA." },
  { domain: "opendi.es", nombre: "Opendi", descripcion: "Directorio de empresas con horarios de apertura y datos de contacto." },
  { domain: "localo.site", nombre: "Localo", descripcion: "Directorio de negocios y servicios locales." },
  { domain: "directorio-empresa.es", nombre: "Directorio Empresa", descripcion: "Directorio de empresas espanolas clasificadas por localidad y actividad." },
  { domain: "encuentre-abierto.es", nombre: "Encuentre Abierto", descripcion: "Directorio de horarios de apertura de comercios y negocios en Espana." },
  { domain: "guiademicroempresas.es", nombre: "Guia de Microempresas", descripcion: "Directorio especializado en microempresas y autonomos con resenas." },
  { domain: "milanuncios.com" },
  { domain: "acompio.es", nombre: "Acompio", descripcion: "Directorio de empresas y negocios locales en Espana." },
  { domain: "trustpilot.com" },
  { domain: "hotfrog.es" },
  { domain: "locanto.es", nombre: "Locanto", descripcion: "Portal de anuncios clasificados gratuitos por ciudad." },
  { domain: "homeserve.es", nombre: "HomeServe", descripcion: "Directorio de profesionales del hogar: fontaneros, electricistas, cerrajeros." },
  { domain: "yelp.com" },
  { domain: "near-place.com", nombre: "Near Place", descripcion: "Directorio de negocios cercanos con horarios y ubicacion." },
  { domain: "nearmenows.com", nombre: "NearMeNows", descripcion: "Buscador de negocios y servicios cercanos a tu ubicacion." },
  { domain: "todocentros.com", nombre: "TodoCentros", descripcion: "Directorio de centros comerciales y negocios en Espana." },
  { domain: "solotrasteros.com", nombre: "SoloTrasteros", descripcion: "Directorio especializado en trasteros y almacenamiento." },
  { domain: "empresasespanolas.es", nombre: "Empresas Espanolas ES", descripcion: "Directorio de empresas espanolas con fichas de contacto." },
  { domain: "misterminit.eu", nombre: "Mister Minit", descripcion: "Red de servicios de reparacion: zapatos, llaves, moviles y mas." },
  { domain: "tellows.es", nombre: "Tellows", descripcion: "Directorio telefonico inverso con comentarios sobre numeros de telefono." },
  { domain: "kompass.com" },
  { domain: "tiktok.com" },
  { domain: "habitissimo.es" },
  { domain: "wallapop.com", nombre: "Wallapop", descripcion: "Plataforma de compraventa y servicios de segunda mano lider en Espana." },
  { domain: "booksy.com", nombre: "Booksy", descripcion: "Plataforma de reservas online para peluquerias, barberias y centros de belleza." },
  { domain: "vulka.es", nombre: "Vulka", descripcion: "Directorio de profesionales y empresas espanolas con fichas de contacto." },
  { domain: "youtube.com" },
  { domain: "pinterest.com" },
  { domain: "spain-web.com", nombre: "Spain Web", descripcion: "Directorio de negocios y servicios en Espana por localidad." },
  { domain: "dumin.info", nombre: "Dumin", descripcion: "Directorio de empresas con informacion de contacto y ubicacion." },
  { domain: "enrollbusiness.com", nombre: "EnrollBusiness", descripcion: "Directorio gratuito de negocios con perfiles por ubicacion." },
  { domain: "x.com" },
  { domain: "costatrades.com", nombre: "CostaTrades", descripcion: "Directorio de profesionales y servicios en la costa espanola." },
  { domain: "paginas1.com", nombre: "Paginas1", descripcion: "Directorio de empresas espanolas con listados por categoria." },
  { domain: "goto-where.com", nombre: "Goto Where", descripcion: "Directorio internacional de negocios con mapas y resenas." },
  { domain: "todocon.com", nombre: "TodoCon", descripcion: "Directorio de empresas y servicios clasificados por sector." },
  { domain: "mybusinessplaces.com", nombre: "My Business Places", descripcion: "Directorio de negocios locales con fichas de empresa." },
  { domain: "repuebla.me", nombre: "Repuebla", descripcion: "Directorio de negocios locales por barrio y ciudad." },
  { domain: "infoconstruccion.es", nombre: "InfoConstruccion", descripcion: "Directorio de empresas del sector de la construccion en Espana." },
  { domain: "masquemedicos.com", nombre: "Mas Que Medicos", descripcion: "Directorio de profesionales de la salud con opiniones de pacientes." },
  { domain: "mejoresdevigo.es", nombre: "Mejores de Vigo", descripcion: "Guia de los mejores negocios y profesionales de Vigo." },
  { domain: "todos-los-horarios.es", nombre: "Todos los Horarios", descripcion: "Directorio de horarios de apertura de negocios en Espana." },
  { domain: "top-rated.online", nombre: "Top Rated", descripcion: "Directorio de negocios mejor valorados con resenas." },
  { domain: "lasguias.com", nombre: "Las Guias", descripcion: "Directorio de empresas y servicios por localidad." },
  { domain: "interempresas.net" },
  { domain: "busconegocio.com", nombre: "BuscoNegocio", descripcion: "Directorio de negocios en venta y traspasos en Espana." },
  { domain: "presupuestos.com", nombre: "Presupuestos.com", descripcion: "Plataforma para solicitar presupuestos de profesionales por tipo de servicio." },
  { domain: "paginadirecta.com", nombre: "Pagina Directa", descripcion: "Directorio de empresas y profesionales con fichas detalladas." },
  { domain: "sociedadesyempresas.com", nombre: "Sociedades y Empresas", descripcion: "Base de datos de sociedades y empresas registradas en Espana." },
  { domain: "lomejordelbarrio.com", nombre: "Lo Mejor del Barrio", descripcion: "Directorio de negocios y comercios locales recomendados por barrio." },
  { domain: "elpages.es", nombre: "ElPages", descripcion: "Directorio de empresas y servicios por localidad." },
  { domain: "horasabiertas.es", nombre: "Horas Abiertas", descripcion: "Directorio de horarios de apertura de negocios y comercios." },
  { domain: "guiacomercial.cat", nombre: "Guia Comercial", descripcion: "Guia comercial de negocios en Catalunya." },
  { domain: "onebusiness.place", nombre: "OneBusiness", descripcion: "Directorio de negocios locales con fichas de empresa." },
  { domain: "mejoresmallorca.es", nombre: "Mejores Mallorca", descripcion: "Guia de los mejores negocios y servicios de Mallorca." },
  { domain: "worldplaces.me", nombre: "WorldPlaces", descripcion: "Directorio global de negocios con fichas por ciudad." },
  { domain: "holalocal.es", nombre: "Hola Local", descripcion: "Directorio de negocios locales en Espana." },
  { domain: "guiadebadalona.es", nombre: "Guia de Badalona", descripcion: "Directorio de comercios y profesionales de Badalona." },
  { domain: "vigodirectorio.es", nombre: "Vigo Directorio", descripcion: "Directorio de empresas y servicios en Vigo." },
  { domain: "totguia.com", nombre: "TotGuia", descripcion: "Directorio de negocios y servicios en toda Espana." },
  { domain: "qdq.com" },
  { domain: "laagendalocal.com", nombre: "La Agenda Local", descripcion: "Directorio de negocios y eventos locales." },
  { domain: "losmejoresdelaspalmas.com", nombre: "Los Mejores de Las Palmas", descripcion: "Guia de los mejores negocios de Las Palmas de Gran Canaria." },
  { domain: "guiacatering.com", nombre: "Guia Catering", descripcion: "Directorio de empresas de catering y hosteleria." },
  { domain: "iglobal.co", nombre: "iGlobal", descripcion: "Directorio global de empresas con resenas y valoraciones." },
  { domain: "brownbook.net", nombre: "Brownbook", descripcion: "Directorio global de empresas con mas de 30 millones de listados." },
  { domain: "mejoresclinicas.com", nombre: "Mejores Clinicas", descripcion: "Directorio de clinicas y centros medicos con opiniones." },
  { domain: "bizpages.org", nombre: "BizPages", descripcion: "Directorio gratuito de negocios y empresas." },
  { domain: "listadotelefonos.com", nombre: "Listado Telefonos", descripcion: "Directorio telefonico de empresas y profesionales en Espana." },
  { domain: "portaldelcomerciante.com", nombre: "Portal del Comerciante", descripcion: "Directorio y recursos para comerciantes y pequenos negocios." },
  { domain: "portaldetuciudad.com", nombre: "Portal de Tu Ciudad", descripcion: "Directorio de negocios y servicios organizados por ciudad." },
  { domain: "leonlocal.com", nombre: "Leon Local", descripcion: "Directorio de negocios y servicios de Leon." },
  { domain: "manta.com", nombre: "Manta", descripcion: "Directorio de pequenas empresas con perfiles gratuitos." },
  { domain: "losmejoresdevitoria.com", nombre: "Los Mejores de Vitoria", descripcion: "Guia de los mejores negocios y profesionales de Vitoria-Gasteiz." },
  { domain: "laguiacatalana.com", nombre: "La Guia Catalana", descripcion: "Directorio de negocios y comercios de Catalunya." },
  { domain: "directorioconstruccionbalear.com", nombre: "Directorio Construccion Balear", descripcion: "Directorio de empresas de construccion en las Islas Baleares." },
  { domain: "directoriocom.com", nombre: "DirectorioCOM", descripcion: "Directorio general de empresas y profesionales." },
  { domain: "local.one", nombre: "Local One", descripcion: "Directorio de negocios locales." },
  { domain: "bizhublocal.com", nombre: "BizHub Local", descripcion: "Directorio de negocios locales con fichas de empresa." },
  { domain: "guiarural.com", nombre: "Guia Rural", descripcion: "Directorio de turismo rural y negocios en zonas rurales de Espana." },
  { domain: "locales.es", nombre: "Locales", descripcion: "Directorio de locales comerciales y negocios en Espana." },
  { domain: "starofservice.com", nombre: "StarOfService", url: "https://www.starofservice.com", descripcion: "Plataforma para encontrar y contratar profesionales con presupuestos personalizados." },
  { domain: "foursquare.com", nombre: "Foursquare", url: "https://foursquare.com", descripcion: "Plataforma de descubrimiento de lugares y negocios basada en ubicacion." },
  { domain: "11870.com", nombre: "11870", url: "https://www.11870.com", descripcion: "Directorio y guia de establecimientos con resenas de usuarios en Espana." },
  { domain: "europages.es" },
  { domain: "comercioscomunitatvalenciana.com", nombre: "Comercios Comunitat Valenciana", descripcion: "Directorio de comercios de la Comunitat Valenciana." },
  { domain: "electricistasenmiciudad.es", nombre: "Electricistas en Mi Ciudad", descripcion: "Directorio especializado en electricistas por ciudad." },
  { domain: "gimnasios.wiki", nombre: "Gimnasios Wiki", descripcion: "Directorio de gimnasios y centros deportivos en Espana." },
  { domain: "mejoresagenciasinmobiliarias.es", nombre: "Mejores Agencias Inmobiliarias", descripcion: "Directorio de las mejores agencias inmobiliarias de Espana." },
  { domain: "mejoresinmobiliarias.com", nombre: "Mejores Inmobiliarias", descripcion: "Guia de inmobiliarias destacadas en Espana." },
  { domain: "yellowpages.net", nombre: "Yellow Pages", descripcion: "Directorio internacional de paginas amarillas." },
  { domain: "unilocal.fr", nombre: "Unilocal", descripcion: "Directorio de negocios locales en Francia y Espana." },
];

// Infer category from domain/name/description
function inferCategoria(domain, nombre, descripcion) {
  const all = (domain + " " + nombre + " " + descripcion).toLowerCase();

  // Regional directories
  if (/galicia|gallego|galega|catalunya|catalan|catalun|badalona|vigo|leon|mallorca|vitoria|palmas|valencia|balear/i.test(all)) return "regional";

  // Review platforms
  if (/resena|review|opinion|valorac|rating|rated/i.test(all)) return "resenas";

  // Service marketplaces
  if (/cerrajer|electricist|fontaner|fumigad|limpi|mantenimi|presupuest|servicio|hogar|reparac|reserv|masaj|peluquer|barber|gimnasio|clinica|medic|fisio|salud|booksy|mister.?minit|homeserve/i.test(all)) return "servicios";

  // Home improvement
  if (/reform|construc|cristaler|persian|ventana|carpint|pintor|decora/i.test(all)) return "reformas";

  // B2B
  if (/b2b|industrial|comercio|proveedor|fabricant|import|export/i.test(all)) return "b2b";

  return "general";
}

// Merge: curated descriptions take priority, then auto-generated
const finalDirs = [];
const seenDomains = new Set();

for (const dir of allDirs) {
  if (seenDomains.has(dir.domain)) continue;
  seenDomains.add(dir.domain);

  const c = curated[dir.domain];

  const slug = dir.domain
    .replace(/\./g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const entry = {
    slug,
    nombre: (c && c.nombre) || dir.nombre || dir.domain,
    dominio: dir.domain,
    url: (c && c.url) || dir.url || "https://www." + dir.domain,
    descripcion: (c && c.descripcion) || dir.descripcion || "Directorio de negocios y servicios.",
    tipo: (c && c.tipo) || "estandar",
    categoria: (c && c.categoria) || dir.categoria || inferCategoria(dir.domain, dir.nombre || "", dir.descripcion || ""),
    gratis: c ? c.gratis : true,
    permiteResenas: c ? c.permiteResenas : false,
    alcance: (c && c.alcance) || "nacional",
    popularidad: (c && c.popularidad) || 40,
  };

  finalDirs.push(entry);
}

// Sort: premium first, then by popularidad
finalDirs.sort((a, b) => {
  const typeOrder = { premium: 0, social: 1, estandar: 2 };
  const ta = typeOrder[a.tipo] ?? 2;
  const tb = typeOrder[b.tipo] ?? 2;
  if (ta !== tb) return ta - tb;
  return b.popularidad - a.popularidad;
});

// Build TS file
const outputPath = path.join(__dirname, "..", "client", "src", "data", "directorios.ts");

// Add accent characters back for string values only (not JSON keys)
function addAccentsToValue(str) {
  return str
    .replace(/Espana/g, "Espa\u00f1a")
    .replace(/busqueda/g, "b\u00fasqueda")
    .replace(/resenas/g, "rese\u00f1as")
    .replace(/Paginas/g, "P\u00e1ginas")
    .replace(/paginas/g, "p\u00e1ginas")
    .replace(/informacion/g, "informaci\u00f3n")
    .replace(/clasificacion/g, "clasificaci\u00f3n")
    .replace(/ubicacion/g, "ubicaci\u00f3n")
    .replace(/gestion/g, "gesti\u00f3n")
    .replace(/reputacion/g, "reputaci\u00f3n")
    .replace(/decoracion/g, "decoraci\u00f3n")
    .replace(/comunicacion/g, "comunicaci\u00f3n")
    .replace(/construccion/g, "construcci\u00f3n")
    .replace(/Guia/g, "Gu\u00eda")
    .replace(/guia/g, "gu\u00eda")
    .replace(/Telefono/g, "Tel\u00e9fono")
    .replace(/telefonico/g, "telef\u00f3nico")
    .replace(/autonomos/g, "aut\u00f3nomos")
    .replace(/mas /g, "m\u00e1s ")
    .replace(/lider/g, "l\u00edder")
    .replace(/Clinicas/g, "Cl\u00ednicas")
    .replace(/clinicas/g, "cl\u00ednicas")
    .replace(/medicos/g, "m\u00e9dicos")
    .replace(/Pagina /g, "P\u00e1gina ")
    .replace(/pequenos/g, "peque\u00f1os")
    .replace(/Cataluna/g, "Catalu\u00f1a")
    .replace(/hosteleria/g, "hosteler\u00eda")
    .replace(/peluquerias/g, "peluquer\u00edas")
    .replace(/barberias/g, "barber\u00edas");
}

// Apply accents only to string values in the data, not to keys
function processEntries(entries) {
  return entries.map(entry => {
    const processed = { ...entry };
    if (processed.nombre) processed.nombre = addAccentsToValue(processed.nombre);
    if (processed.descripcion) processed.descripcion = addAccentsToValue(processed.descripcion);
    return processed;
  });
}

const tsContent = `// Auto-generated directory data from Base44 CitationSource API
// Last updated: ${new Date().toISOString().split("T")[0]}
// Total: ${finalDirs.length} directorios

export interface Directorio {
  slug: string;
  nombre: string;
  dominio: string;
  url: string;
  descripcion: string;
  tipo: "premium" | "estandar" | "social";
  categoria: "general" | "resenas" | "servicios" | "reformas" | "b2b" | "social" | "regional";
  gratis: boolean;
  permiteResenas: boolean;
  alcance: "local" | "regional" | "nacional" | "europeo" | "internacional" | "global";
  popularidad: number; // 0-100
}

export const directorios: Directorio[] = ${JSON.stringify(processEntries(finalDirs), null, 2)};

export const directoriosPremium = directorios.filter(d => d.tipo === "premium");
export const directoriosEstandar = directorios.filter(d => d.tipo === "estandar");
export const directoriosSocial = directorios.filter(d => d.tipo === "social");

export const categoriaDirectorio = {
  general: "Directorios Generales",
  resenas: "Plataformas de Rese\u00f1as",
  servicios: "Servicios y Presupuestos",
  reformas: "Reformas y Hogar",
  b2b: "B2B / Empresarial",
  social: "Redes Sociales",
  regional: "Directorios Regionales",
} as const;

export type CategoriaDirectorio = keyof typeof categoriaDirectorio;
`;

fs.writeFileSync(outputPath, tsContent, "utf-8");
console.log("Written", finalDirs.length, "directories to", outputPath);

// Stats
const byTipo = {};
const byCat = {};
for (const d of finalDirs) {
  byTipo[d.tipo] = (byTipo[d.tipo] || 0) + 1;
  byCat[d.categoria] = (byCat[d.categoria] || 0) + 1;
}
console.log("By tipo:", byTipo);
console.log("By categoria:", byCat);
