import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Envio del formulario de contacto.
 *
 * ANTES (y por que se hizo esto): el formulario no enviaba NADA. Montaba un
 * `mailto:` y abria el programa de correo del visitante con el texto dentro.
 * Eso falla casi siempre: en el movil abre una app sin configurar, en el
 * ordenador abre Outlook aunque la persona use Gmail en el navegador, y si no
 * hay cliente de correo no pasa nada de nada. Resultado: mensajes perdidos y
 * sensacion de web rota. Edu: "el formulario no funciona, se abre un mail de
 * mierda".
 *
 * AHORA: el mensaje se envia de verdad desde el servidor con Resend (la clave
 * RESEND_API_KEY ya estaba configurada en Vercel para otro aviso).
 *
 * Ademas:
 *  - Se responde al visitante con una copia, para que sepa que ha llegado.
 *  - `reply_to` apunta a quien escribe: contestar es darle a Responder.
 *  - Limite por IP para que no lo usen de buzon de spam.
 *  - Trampa anti-robots (campo oculto): si viene relleno, se descarta en
 *    silencio y el robot cree que ha funcionado.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DESTINO = "eduardo.laborda.triguero@gmail.com";
const REMITENTE = "Visto en Maps <onboarding@resend.dev>";

const ORIGENES = [
  "https://vistoenmaps.com",
  "https://www.vistoenmaps.com",
  "https://vistoenmaps.vercel.app",
  "http://localhost:5173",
];

/** Control de envios por IP (la funcion vive un rato, basta para frenar spam). */
const ultimos = new Map<string, number[]>();
const VENTANA = 10 * 60 * 1000; // 10 minutos
const MAXIMO = 3; // 3 mensajes por IP en esa ventana

function esc(s: string) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function demasiados(ip: string) {
  const ahora = Date.now();
  const previos = (ultimos.get(ip) || []).filter((t) => ahora - t < VENTANA);
  if (previos.length >= MAXIMO) return true;
  previos.push(ahora);
  ultimos.set(ip, previos);
  return false;
}

async function enviar(payload: Record<string, unknown>) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const datos = await r.json().catch(() => ({}));
  return { ok: r.ok, datos };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string) || "";
  if (ORIGENES.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!RESEND_API_KEY) {
    console.error("[contacto] falta RESEND_API_KEY");
    return res.status(500).json({
      error: "El envío no está disponible ahora mismo. Vuelve a intentarlo en unos minutos.",
    });
  }

  const { nombre, email, asunto, mensaje, empresa } = (req.body || {}) as Record<string, string>;

  // Trampa anti-robots: campo oculto que una persona nunca rellena.
  if (empresa) {
    return res.status(200).json({ ok: true });
  }

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: "Faltan datos: nombre, email y mensaje son obligatorios." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: "Ese correo no parece válido." });
  }
  if (mensaje.length > 5000 || nombre.length > 120) {
    return res.status(400).json({ error: "El mensaje es demasiado largo." });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string || "").split(",")[0].trim() ||
    (req.socket as any)?.remoteAddress ||
    "desconocida";
  if (demasiados(ip)) {
    return res.status(429).json({
      error: "Has enviado varios mensajes seguidos. Prueba dentro de un rato.",
    });
  }

  const tema = asunto || "Consulta desde la web";

  try {
    // 1. Aviso a Edu. reply_to = quien escribe, para contestar directamente.
    const aviso = await enviar({
      from: REMITENTE,
      to: [DESTINO],
      reply_to: email,
      subject: `[Visto en Maps] ${tema} — ${nombre}`,
      html: `
        <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;color:#111">
          <h2 style="margin:0 0 4px">Nuevo mensaje desde vistoenmaps.com</h2>
          <p style="margin:0 0 20px;color:#666;font-size:14px">Responde a este correo y le llegará directamente.</p>
          <table style="width:100%;border-collapse:collapse;background:#f7f7f5;border-radius:10px">
            <tr><td style="padding:12px 16px;color:#666;width:90px">Nombre</td><td style="padding:12px 16px;font-weight:600">${esc(nombre)}</td></tr>
            <tr><td style="padding:12px 16px;color:#666">Correo</td><td style="padding:12px 16px"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
            <tr><td style="padding:12px 16px;color:#666">Asunto</td><td style="padding:12px 16px">${esc(tema)}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;border-left:3px solid #e07b39;background:#fff">
            <p style="margin:0;white-space:pre-wrap;line-height:1.6">${esc(mensaje)}</p>
          </div>
          <p style="margin-top:24px;color:#999;font-size:12px">Recibido el ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
        </div>`,
    });

    if (!aviso.ok) {
      console.error("[contacto] Resend rechazo el aviso:", aviso.datos);
      return res.status(502).json({
        error: "No hemos podido enviar el mensaje. Inténtalo dentro de un par de minutos.",
      });
    }

    // 2. Copia para quien escribe: saber que ha llegado da tranquilidad.
    //    Si esto falla no se avisa: el mensaje importante ya ha salido.
    enviar({
      from: REMITENTE,
      to: [email],
      subject: "Hemos recibido tu mensaje — Visto en Maps",
      html: `
        <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#111">
          <h2 style="margin:0 0 8px">Gracias, ${esc(nombre.split(" ")[0])}</h2>
          <p style="line-height:1.6;color:#333">Tenemos tu mensaje y te contestamos lo antes posible, normalmente en menos de 48 horas.</p>
          <div style="margin:20px 0;padding:16px;background:#f7f7f5;border-radius:10px">
            <p style="margin:0 0 6px;color:#666;font-size:13px">Esto es lo que nos has escrito:</p>
            <p style="margin:0;white-space:pre-wrap;line-height:1.6">${esc(mensaje)}</p>
          </div>
          <p style="color:#666;font-size:13px;line-height:1.6">Si era para corregir datos de un negocio, dinos el nombre y la dirección y lo resolvemos.</p>
          <p style="margin-top:24px;font-size:13px"><a href="https://vistoenmaps.com" style="color:#e07b39">vistoenmaps.com</a></p>
        </div>`,
    }).catch(() => {});

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("[contacto] fallo:", e?.message);
    return res.status(500).json({
      error: "Algo ha fallado al enviar. Inténtalo de nuevo en unos minutos.",
    });
  }
}
