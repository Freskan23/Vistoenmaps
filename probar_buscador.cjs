const path = require("path");
const { chromium } = require(path.join(
  "C:/Users/eduar/Documents/claude/autosocial",
  "node_modules",
  "playwright",
));

const OUT = "C:/Users/eduar/Documents/claude/vistoenmaps/_work";

async function probar(viewport, nombre) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport,
    locale: "es-ES",
    geolocation: { latitude: 40.4168, longitude: -3.7038 },
    permissions: ["geolocation"],
  });
  const page = await context.newPage();
  const errores = [];
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  page.on("pageerror", (e) => errores.push(e.message));

  await page.goto("http://127.0.0.1:4173/fontaneros/madrid", {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  // Con permiso ya concedido el sitio localiza solo; si no, se pulsa el boton.
  const yaLocalizado = page.getByRole("button", { name: /ubicación detectada: madrid/i }).first();
  const pedirUbicacion = page.getByRole("button", { name: /usar mi ubicación/i }).first();
  try {
    await yaLocalizado.waitFor({ state: "visible", timeout: 8000 });
  } catch {
    await pedirUbicacion.click({ timeout: 15000 });
    await yaLocalizado.waitFor({ state: "visible", timeout: 15000 });
  }

  const buscador = page.getByRole("searchbox", {
    name: /buscar servicios, profesionales o ciudades/i,
  }).first();
  await buscador.fill("fontanero");
  await page.getByText("Primero, resultados cerca de Madrid").first()
    .waitFor({ state: "visible", timeout: 15000 });
  // Los negocios se descargan al escribir: esperar a que salga la distancia.
  await page.getByText(/a \d+ (m|km)/).first().waitFor({ state: "visible", timeout: 20000 });

  const datos = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input[type="search"]')]
      .filter((x) => x.getBoundingClientRect().height > 0);
    const botones = [...document.querySelectorAll("button")]
      .filter((x) => /ubicación detectada/i.test(x.getAttribute("aria-label") || ""));
    const texto = document.body.innerText || "";
    return {
      buscadoresVisibles: inputs.length,
      ubicacionVisible: botones.some((x) => x.getBoundingClientRect().height > 0),
      madridPrimero: texto.includes("Primero, resultados cerca de Madrid"),
      muestraDistancia: /a \d+ (m|km)/.test(texto),
      ancho: innerWidth,
    };
  });

  await page.screenshot({ path: `${OUT}/${nombre}.png`, fullPage: false });
  console.log(nombre, JSON.stringify(datos), "errores", errores.length);
  if (errores.length) console.log(errores.slice(0, 3));
  await browser.close();
  return { datos, errores };
}

(async () => {
  const escritorio = await probar({ width: 1440, height: 1000 }, "buscador-escritorio");
  const movil = await probar({ width: 390, height: 844 }, "buscador-movil");
  const ok = [escritorio, movil].every(({ datos, errores }) =>
    datos.buscadoresVisibles >= 1 && datos.ubicacionVisible &&
    datos.madridPrimero && datos.muestraDistancia && errores.length === 0,
  );
  console.log("RESULTADO", ok ? "OK" : "FALLO");
  process.exit(ok ? 0 : 1);
})();
