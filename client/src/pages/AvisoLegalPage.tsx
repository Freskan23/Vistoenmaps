import PaginaLegal from "./PaginaLegal";

export default function AvisoLegalPage() {
  return (
    <PaginaLegal
      titulo="Aviso legal"
      descripcion="Aviso legal y condiciones de uso de Visto en Maps, directorio de negocios locales de España."
      ruta="aviso-legal"
      actualizado="11 de septiembre de 2026"
      secciones={[
        {
          titulo: "Qué es Visto en Maps",
          parrafos: [
            "Visto en Maps es un directorio de negocios locales de España. Recoge información pública de negocios (nombre, dirección, teléfono, horario y valoraciones publicadas en sus fichas de Google Maps) y la organiza por sector, ciudad y barrio para que cualquiera pueda encontrar el servicio que necesita cerca de casa.",
            "El uso del sitio es gratuito y no requiere registro.",
          ],
        },
        {
          titulo: "Sobre la información publicada",
          parrafos: [
            "Los datos proceden de fuentes públicas y se muestran tal cual, con fines informativos. Pueden cambiar en cualquier momento sin que este directorio lo refleje de inmediato: conviene confirmar horarios y precios con el propio negocio antes de desplazarse.",
            "Visto en Maps no interviene en la relación entre el usuario y el negocio, ni presta los servicios que aquí se listan, ni cobra comisión por contactar con ellos.",
          ],
        },
        {
          titulo: "Si aparece tu negocio",
          parrafos: [
            "Aparecer en el directorio es gratis. Si quieres corregir un dato, añadir información o dejar de aparecer, escríbenos desde la página de contacto indicando el nombre y la dirección del negocio y lo resolvemos.",
            "Las fichas marcadas como «Recomendado» o «Ficha verificada» corresponden a negocios que han contratado presencia destacada. El resto de fichas se ordenan por valoración y número de opiniones.",
          ],
        },
        {
          // Obligatorio decirlo: desde la seccion de eventos se enlaza a
          // Ticketmaster con un enlace de afiliado que genera comision.
          titulo: "Enlaces de afiliado",
          parrafos: [
            "En la sección de eventos enlazamos a Ticketmaster para comprar las entradas. Esos enlaces son de afiliado: si compras a través de ellos, recibimos una pequeña comisión de Ticketmaster. A ti no te cuesta ni un céntimo más.",
            "Los eventos que se muestran salen ordenados por fecha, primero los más cercanos. No se colocan ni se ordenan según lo que nos paguen.",
            "Los enlaces de afiliado van marcados como patrocinados en el código de la página, como exigen los buscadores.",
          ],
        },
        {
          titulo: "Propiedad intelectual",
          parrafos: [
            "El diseño, los textos descriptivos y la organización del directorio son propios. Las marcas y logotipos de los negocios listados pertenecen a sus titulares.",
            "La cartografía procede de OpenStreetMap y sus colaboradores, bajo licencia ODbL.",
          ],
        },
        {
          titulo: "Responsabilidad",
          parrafos: [
            "Se pone cuidado en que la información sea correcta, pero no se garantiza que esté libre de errores ni que un negocio siga operativo. Visto en Maps no se hace responsable de los servicios contratados con terceros a partir de la información aquí publicada.",
          ],
        },
        {
          titulo: "Legislación aplicable",
          parrafos: [
            "Esta relación se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales del domicilio del titular del sitio, salvo que la normativa de consumo disponga otra cosa.",
          ],
        },
      ]}
    />
  );
}
