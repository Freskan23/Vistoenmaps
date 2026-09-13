/**
 * Favicon VIVO: el ojo del pin mira alrededor y parpadea en la pestaña.
 *
 * Ningun navegador anima un .ico y solo Firefox anima los SVG, asi que se dibuja
 * cada fotograma en un <canvas> y se reemplaza el favicon con el resultado.
 *
 * BASE: `/logo-pin.png`, el logo REAL de la marca (no una aproximacion dibujada
 * a mano). Encima se pinta el ojo en la posicion donde esta el del logo, y es lo
 * unico que se anima.
 *
 * Cuidados:
 *  - 8 fotogramas/segundo: se nota vivo sin gastar CPU.
 *  - Se PARA cuando la pestaña no esta visible (bateria en movil).
 *  - Respeta "prefers-reduced-motion": icono quieto.
 *  - El ojo mira hacia donde esta el raton de verdad.
 */

const TAM = 64;

// Posicion del ojo dentro de logo-pin.png, en proporcion (0..1) del lienzo.
// Medido sobre logo-pin.png detectando los pixeles del iris: no inventar estos
// numeros, si se cambia el logo hay que volver a medirlos.
const OJO = { cx: 0.472, cy: 0.331, r: 0.263 };

interface Estado {
  mirandoX: number;
  mirandoY: number;
  objetivoX: number;
  objetivoY: number;
  cerrado: number;
  proximoParpadeo: number;
  proximaMirada: number;
}

function dibujarOjo(ctx: CanvasRenderingContext2D, e: Estado) {
  const S = TAM;
  const cx = OJO.cx * S;
  const cy = OJO.cy * S;
  const er = OJO.r * S;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, er, 0, Math.PI * 2);
  ctx.clip();

  // Globo
  const gg = ctx.createRadialGradient(cx - er * 0.3, cy - er * 0.3, 1, cx, cy, er);
  gg.addColorStop(0, "#ffffff");
  gg.addColorStop(1, "#dcdce2");
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(cx, cy, er, 0, Math.PI * 2);
  ctx.fill();

  const ox = e.mirandoX * er * 0.32;
  const oy = e.mirandoY * er * 0.32;

  // Iris
  const ir = er * 0.62;
  const gi = ctx.createRadialGradient(cx + ox, cy + oy, 1, cx + ox, cy + oy, ir);
  gi.addColorStop(0, "#00efff");
  gi.addColorStop(0.45, "#00bcd4");
  gi.addColorStop(1, "#005c6a");
  ctx.fillStyle = gi;
  ctx.beginPath();
  ctx.arc(cx + ox, cy + oy, ir, 0, Math.PI * 2);
  ctx.fill();

  // Pupila
  const pr = ir * 0.44;
  ctx.fillStyle = "#0a0a12";
  ctx.beginPath();
  ctx.arc(cx + ox, cy + oy, pr, 0, Math.PI * 2);
  ctx.fill();

  // Reflejo
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.arc(cx + ox + pr * 0.45, cy + oy - pr * 0.45, pr * 0.36, 0, Math.PI * 2);
  ctx.fill();

  // Parpados curvos. Se dibujan MAS ANCHOS que el ojo (er*1.3) porque el
  // recorte circular ya los limita: asi al cerrarse no quedan huecos en los
  // laterales. El cierre total tapa hasta pasado el centro.
  if (e.cerrado > 0.01) {
    const ancho = er * 1.35;
    const avance = er * 1.06 * e.cerrado;
    ctx.fillStyle = "#c06a00";
    ctx.beginPath();
    ctx.moveTo(cx - ancho, cy - er * 1.2);
    ctx.lineTo(cx + ancho, cy - er * 1.2);
    ctx.lineTo(cx + ancho, cy - er + avance * 0.72);
    ctx.quadraticCurveTo(cx, cy - er + avance * 1.32, cx - ancho, cy - er + avance * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b85c00";
    ctx.beginPath();
    ctx.moveTo(cx - ancho, cy + er * 1.2);
    ctx.lineTo(cx + ancho, cy + er * 1.2);
    ctx.lineTo(cx + ancho, cy + er - avance * 0.72);
    ctx.quadraticCurveTo(cx, cy + er - avance * 1.32, cx - ancho, cy + er - avance * 0.72);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function iniciarFaviconVivo() {
  if (typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.width = TAM;
  canvas.height = TAM;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const base = new Image();
  base.src = "/logo-pin.png";

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-vivo]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.setAttribute("data-vivo", "1");
    document.head.appendChild(link);
  }

  const e: Estado = {
    mirandoX: 0, mirandoY: 0, objetivoX: 0, objetivoY: 0,
    cerrado: 0, proximoParpadeo: Date.now() + 2500, proximaMirada: Date.now() + 1200,
  };

  const seguirRaton = (ev: PointerEvent) => {
    e.objetivoX = Math.max(-1, Math.min(1, (ev.clientX / window.innerWidth - 0.5) * 2.4));
    e.objetivoY = Math.max(-1, Math.min(1, (ev.clientY / window.innerHeight - 0.5) * 2.4));
    e.proximaMirada = Date.now() + 3000;
  };
  document.addEventListener("pointermove", seguirRaton, { passive: true });

  let temporizador: number | undefined;

  const paso = () => {
    const ahora = Date.now();

    if (ahora > e.proximaMirada) {
      e.objetivoX = (Math.random() - 0.5) * 1.8;
      e.objetivoY = (Math.random() - 0.5) * 1.4;
      e.proximaMirada = ahora + 1400 + Math.random() * 2200;
    }

    e.mirandoX += (e.objetivoX - e.mirandoX) * 0.28;
    e.mirandoY += (e.objetivoY - e.mirandoY) * 0.28;

    if (e.cerrado > 0) {
      e.cerrado = Math.max(0, e.cerrado - 0.34);
    } else if (ahora > e.proximoParpadeo) {
      e.cerrado = 1;
      e.proximoParpadeo = ahora + 2600 + Math.random() * 3400;
    }

    ctx.clearRect(0, 0, TAM, TAM);
    if (base.complete && base.naturalWidth > 0) {
      ctx.drawImage(base, 0, 0, TAM, TAM);
      dibujarOjo(ctx, e);
    } else {
      return; // aun cargando: se queda el icono estatico
    }

    try {
      link!.href = canvas.toDataURL("image/png");
    } catch {
      /* si el navegador lo impide, se queda el icono estatico */
    }
  };

  const arrancar = () => {
    if (temporizador !== undefined) return;
    temporizador = window.setInterval(paso, 125);
    paso();
  };
  const parar = () => {
    if (temporizador === undefined) return;
    clearInterval(temporizador);
    temporizador = undefined;
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) parar();
    else arrancar();
  });

  base.onload = () => { if (!document.hidden) arrancar(); };
  if (base.complete && base.naturalWidth > 0 && !document.hidden) arrancar();
}
