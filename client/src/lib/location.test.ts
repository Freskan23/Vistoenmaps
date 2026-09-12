import { describe, expect, it } from "vitest";
import { distanceKm, findNearestCity, sortByDistance } from "./location";

const cities = [
  { slug: "madrid", nombre: "Madrid", coordenadas: { lat: 40.4168, lng: -3.7038 } },
  { slug: "valencia", nombre: "Valencia", coordenadas: { lat: 39.4699, lng: -0.3763 } },
  { slug: "barcelona", nombre: "Barcelona", coordenadas: { lat: 41.3874, lng: 2.1686 } },
];

describe("ubicación del usuario", () => {
  it("detecta la ciudad más cercana a las coordenadas del usuario", () => {
    expect(findNearestCity({ lat: 40.42, lng: -3.7 }, cities)?.slug).toBe("madrid");
    expect(findNearestCity({ lat: 39.47, lng: -0.38 }, cities)?.slug).toBe("valencia");
  });

  it("calcula una distancia geográfica razonable", () => {
    const km = distanceKm(
      { lat: 40.4168, lng: -3.7038 },
      { lat: 41.3874, lng: 2.1686 },
    );
    expect(km).toBeGreaterThan(490);
    expect(km).toBeLessThan(520);
  });

  it("coloca primero los resultados más cercanos sin perder los que no tienen coordenadas", () => {
    const result = sortByDistance(
      [
        { id: "barcelona", coordenadas: cities[2].coordenadas },
        { id: "sin-coordenadas" },
        { id: "madrid", coordenadas: cities[0].coordenadas },
      ],
      { lat: 40.42, lng: -3.7 },
    );

    expect(result.map((x) => x.id)).toEqual([
      "madrid",
      "barcelona",
      "sin-coordenadas",
    ]);
  });
});
