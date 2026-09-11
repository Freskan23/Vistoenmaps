import PaginaLegal from "./PaginaLegal";

export default function CookiesPage() {
  return (
    <PaginaLegal
      titulo="Política de cookies"
      descripcion="Qué cookies usa Visto en Maps y cómo controlarlas."
      ruta="cookies"
      actualizado="11 de septiembre de 2026"
      secciones={[
        {
          titulo: "Resumen rápido",
          parrafos: [
            "Este directorio no usa cookies de publicidad ni de seguimiento entre sitios. No se elaboran perfiles ni se comparte tu navegación con redes publicitarias.",
          ],
        },
        {
          titulo: "Qué se guarda en tu navegador",
          parrafos: [
            "Cookies técnicas: solo si inicias sesión para gestionar la ficha de tu negocio, para mantener la sesión abierta. Sin ellas no podrías entrar en tu panel.",
            "Preferencias: pequeños ajustes de la interfaz, como si prefieres ver el mapa abierto o cerrado.",
          ],
        },
        {
          titulo: "Servicios de terceros",
          parrafos: [
            "Los mapas los sirve OpenStreetMap, que recibe la petición de las imágenes del mapa desde tu navegador. No instala cookies publicitarias.",
          ],
        },
        {
          titulo: "Cómo controlarlas",
          parrafos: [
            "Puedes borrar o bloquear las cookies desde la configuración de tu navegador. Si bloqueas las técnicas no podrás iniciar sesión, pero el directorio se puede consultar con normalidad.",
          ],
        },
      ]}
    />
  );
}
