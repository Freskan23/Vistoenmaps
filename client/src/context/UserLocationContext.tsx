import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ciudades } from "@/data";
import { findNearestCity, type Coordinates } from "@/lib/location";
import type { Ciudad } from "@/data/types";

type LocationStatus = "idle" | "requesting" | "ready" | "denied" | "unsupported" | "error";

interface StoredLocation {
  point: Coordinates;
  savedAt: number;
}

interface UserLocationValue {
  point: Coordinates | null;
  nearestCity: Ciudad | null;
  status: LocationStatus;
  requestLocation: () => void;
}

const STORAGE_KEY = "vistoenmaps:user-location";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const UserLocationContext = createContext<UserLocationValue | null>(null);

function readStoredLocation(): Coordinates | null {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as StoredLocation | null;
    if (!stored || Date.now() - stored.savedAt > MAX_AGE_MS) return null;
    if (!Number.isFinite(stored.point?.lat) || !Number.isFinite(stored.point?.lng)) return null;
    return stored.point;
  } catch {
    return null;
  }
}

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const [point, setPoint] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");

  const receivePosition = useCallback((position: GeolocationPosition) => {
    const next = { lat: position.coords.latitude, lng: position.coords.longitude };
    setPoint(next);
    setStatus("ready");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ point: next, savedAt: Date.now() }));
    } catch {
      // La búsqueda sigue funcionando aunque el navegador bloquee el almacenamiento.
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      receivePosition,
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  }, [receivePosition]);

  useEffect(() => {
    const stored = readStoredLocation();
    if (stored) {
      setPoint(stored);
      setStatus("ready");
      return;
    }

    // Si el usuario ya dio permiso anteriormente, localizar sin volver a molestar.
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => {
          if (permission.state === "granted") requestLocation();
          if (permission.state === "denied") setStatus("denied");
        })
        .catch(() => undefined);
    }
  }, [requestLocation]);

  const nearestCity = useMemo(
    () => (point ? findNearestCity(point, ciudades) || null : null),
    [point],
  );

  const value = useMemo(
    () => ({ point, nearestCity, status, requestLocation }),
    [point, nearestCity, status, requestLocation],
  );

  return <UserLocationContext.Provider value={value}>{children}</UserLocationContext.Provider>;
}

export function useUserLocation(): UserLocationValue {
  const value = useContext(UserLocationContext);
  if (!value) throw new Error("useUserLocation debe usarse dentro de UserLocationProvider");
  return value;
}
