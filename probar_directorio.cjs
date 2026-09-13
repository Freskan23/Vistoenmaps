const path = require("path");
const { chromium } = require(path.join(
  "C:/Users/eduar/Documents/claude/autosocial",
  "node_modules",
  "playwright",
));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: "es-ES" });
  const errores = [];
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  page.on("pageerror", (e) => errores.push(e.message));

  await page.goto("http://127.0.0.1:4173/directorio/servicios", {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  const datos = await page.evaluate(() => {
    const texto = document.body.innerText || "";
    return {
      proximamente: texto.includes("Próximamente"),
      tarjetas: document.querySelectorAll('a[href^="/"]').length,
      titulo: document.querySelector("h1")?.innerText || "",
    };
  });

  await page.screenshot({
    path: "C:/Users/eduar/Documents/claude/vistoenmaps/_work/directorio-sin-proximamente.png",
  });
  console.log(JSON.stringify(datos), "errores", errores.length);
  if (errores.length) console.log(errores.slice(0, 3));
  const ok = !datos.proximamente && datos.tarjetas > 10 && errores.length === 0;
  console.log("RESULTADO", ok ? "OK" : "FALLO");
  await browser.close();
  process.exit(ok ? 0 : 1);
})();
