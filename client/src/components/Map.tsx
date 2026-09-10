/**
 * MapView — mapa con OpenStreetMap + Leaflet.
 *
 * Gratis y sin clave de API: no depende de Google Maps ni de facturacion.
 * Las teselas las sirve OpenStreetMap y solo hay que citar la autoria.
 *
 * Se mantiene la misma forma de usarlo que antes para no tocar las paginas:
 *   <MapView initialCenter={{lat, lng}} initialZoom={14} onMapReady={(m) => ...} />
 *
 * `onMapReady` recibe un objeto con la API minima que usan las paginas:
 *   - addMarker({lat, lng}, titulo, alPulsar)
 *   - clearMarkers()
 *   - fitTo([{lat, lng}, ...])
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface Punto {
  lat: number;
  lng: number;
}

export interface MapaSimple {
  addMarker: (pos: Punto, titulo?: string, alPulsar?: () => void) => void;
  clearMarkers: () => void;
  fitTo: (puntos: Punto[]) => void;
  instancia: L.Map;
}

interface MapViewProps {
  className?: string;
  initialCenter?: Punto;
  initialZoom?: number;
  onMapReady?: (mapa: MapaSimple) => void;
}

/** Chincheta propia en SVG: no dependemos de las imagenes de Leaflet. */
const iconoChincheta = L.divIcon({
  className: "vem-pin",
  html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21s13-11.25 13-21c0-7.18-5.82-13-13-13z" fill="#1B4965"/>
    <circle cx="13" cy="13" r="5.2" fill="#FCC44E"/>
  </svg>`,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
  popupAnchor: [0, -30],
});

export function MapView({
  className = "w-full h-full",
  initialCenter = { lat: 40.4168, lng: -3.7038 },
  initialZoom = 13,
  onMapReady,
}: MapViewProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcadores = useRef<L.Marker[]>([]);
  const yaAvisado = useRef(false);

  useEffect(() => {
    if (!contenedor.current || mapa.current) return;

    mapa.current = L.map(contenedor.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: initialZoom,
      scrollWheelZoom: false, // que la rueda haga scroll de la pagina, no zoom
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa.current);

    if (onMapReady && !yaAvisado.current) {
      yaAvisado.current = true;
      const api: MapaSimple = {
        instancia: mapa.current,
        addMarker: (pos, titulo, alPulsar) => {
          if (!mapa.current || !pos) return;
          const m = L.marker([pos.lat, pos.lng], {
            icon: iconoChincheta,
            title: titulo,
          }).addTo(mapa.current);
          if (titulo) m.bindPopup(`<strong>${titulo}</strong>`);
          if (alPulsar) m.on("click", alPulsar);
          marcadores.current.push(m);
        },
        clearMarkers: () => {
          marcadores.current.forEach((m) => m.remove());
          marcadores.current = [];
        },
        fitTo: (puntos) => {
          const validos = (puntos || []).filter((p) => p && p.lat && p.lng);
          if (!mapa.current || validos.length === 0) return;
          if (validos.length === 1) {
            mapa.current.setView([validos[0].lat, validos[0].lng], 16);
            return;
          }
          mapa.current.fitBounds(
            L.latLngBounds(validos.map((p) => [p.lat, p.lng] as [number, number])),
            { padding: [30, 30] }
          );
        },
      };
      onMapReady(api);
    }

    return () => {
      mapa.current?.remove();
      mapa.current = null;
      marcadores.current = [];
      yaAvisado.current = false;
    };
    // Solo al montar: el centro y el zoom iniciales no deben recrear el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={contenedor} className={className} />;
}

export default MapView;
