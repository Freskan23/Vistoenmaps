const path = require("path");
const { chromium } = require(path.join(
  "C:/Users/eduar/Documents/claude/autosocial",
  "node_modules",
  "playwright",
));

const OUT = "C:/Users/eduar/Documents/claude/vistoenmaps/_work";
const SITIO = "https://vistoenmaps.com";

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

  await page.goto(`${SITIO}/fontaneros/madrid`, { waitUntil: "networkidle", timeout: 90000 });

  const yaLocalizado = page.getByRole("button", { name: /ubicación detectada: madrid/i }).first();
  try {
    await yaLocalizado.waitFor({ state: "visible", timeout: 10000 });
  } catch {
    await page.getByRole("button", { name: /usar mi ubicación/i }).first().click({ timeout: 20000 });
    await yaLocalizado.waitFor({ state: "visible", timeout: 20000 });
  }

  await page.getByRole("searchbox", { name: /buscar servicios/i }).first().fill("fontanero");
  await page.getByText("Primero, resultados cerca de Madrid").first()
    .waitFor({ state: "visible", timeout: 25000 });
  await page.getByText(/a \d+ (m|km)/).first().waitFor({ state: "visible", timeout: 25000 });

  const datos = await page.evaluate(() => {
    const texto = document.body.innerText || "";
    return {
      cercaDeMadrid: texto.includes("Primero, resultados cerca de Madrid"),
      distancias: (texto.match(/a \d+ (m|km)/g) || []).length,
    };
  });

  await page.screenshot({ path: `${OUT}/produccion-${nombre}.png` });
  console.log(nombre, JSON.stringify(datos), "errores", errores.length);
  if (errores.length) console.log(errores.slice(0, 3));
  await browser.close();
  return datos.cercaDeMadrid && datos.distancias > 0 && errores.length === 0;
}

(async () => {
  const escritorio = await probar({ width: 1440, height: 1000 }, "escritorio");
  const movil = await probar({ width: 390, height: 844 }, "movil");

  // El directorio ya no debe decir "Próximamente"
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: "es-ES" });
  await page.goto(`${SITIO}/directorio/servicios`, { waitUntil: "networkidle", timeout: 90000 });
  const proximamente = await page.evaluate(() => (document.body.innerText || "").includes("Próximamente"));
  await page.screenshot({ path: `${OUT}/produccion-directorio.png` });
  await browser.close();
  console.log("directorio sin Proximamente:", !proximamente);

  const ok = escritorio && movil && !proximamente;
  console.log("RESULTADO", ok ? "OK" : "FALLO");
  process.exit(ok ? 0 : 1);
})();
