import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

/**
 * Devuelve la pagina arriba al cambiar de seccion.
 *
 * EL FALLO (lo vio Edu): "hay muchos enlaces que al pulsarlos me lleva al
 * footer". No era cosa de los enlaces: wouter cambia de pagina sin tocar el
 * scroll, asi que si venias de pulsar algo del pie —que esta abajo del todo— la
 * pagina nueva se pintaba con el scroll donde estaba y aterrizabas en mitad del
 * pie. Medido: al llegar a /contacto desde el pie, el titulo quedaba a -472px,
 * fuera de pantalla por arriba.
 *
 * Que hace y que NO hace:
 *  - Al ir a una ruta NUEVA: sube arriba del todo.
 *  - Al pulsar ATRAS o ADELANTE del navegador: NO toca el scroll, para que se
 *    respete donde estabas (es lo que espera cualquiera al volver a un listado
 *    largo). Se detecta con el evento `popstate`.
 *  - Si la URL trae un ancla (#algo): no toca nada.
 */
export default function ScrollToTop() {
  const [ruta] = useLocation();
  const volviendoAtras = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const marcar = () => {
      volviendoAtras.current = true;
    };
    window.addEventListener("popstate", marcar);
    return () => window.removeEventListener("popstate", marcar);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // atras/adelante del navegador: respetar la posicion anterior
    if (volviendoAtras.current) {
      volviendoAtras.current = false;
      return;
    }
    // enlace a un punto concreto de la pagina
    if (window.location.hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [ruta]);

  return null;
}
