import type { VercelRequest, VercelResponse } from '@vercel/node';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = 'eduardo.laborda.triguero@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  // Verificar que viene de nuestra app (simple check)
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://vistoenmaps.vercel.app',
    'https://vistoenmaps.com',
    'http://localhost:5173',
  ];

  // CORS
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY no configurada');
    return res.status(500).json({ error: 'Servicio de email no configurado' });
  }

  const { nombre, categoria, ciudad, provincia, email, telefono, user_id } = req.body || {};

  if (!nombre) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Visto en Maps <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `Nuevo negocio registrado: ${nombre}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a1a;">Nuevo negocio registrado en Visto en Maps</h2>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 16px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666; width: 120px;">Nombre:</td>
                  <td style="padding: 8px 0; color: #1a1a1a;">${nombre}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Categoria:</td>
                  <td style="padding: 8px 0; color: #1a1a1a;">${categoria || 'No especificada'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Ciudad:</td>
                  <td style="padding: 8px 0; color: #1a1a1a;">${ciudad || 'No especificada'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Provincia:</td>
                  <td style="padding: 8px 0; color: #1a1a1a;">${provincia || 'No especificada'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
                  <td style="padding: 8px 0; color: #1a1a1a;">${email || 'No proporcionado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Telefono:</td>
                  <td style="padding: 8px 0; color: #1a1a1a;">${telefono || 'No proporcionado'}</td>
                </tr>
              </table>
            </div>
            <p style="color: #666; font-size: 14px;">
              Estado: <strong style="color: #f59e0b;">Pendiente de aprobacion</strong>
            </p>
            <a href="https://supabase.com/dashboard/project/efywsccaxaxntmkeuqec/editor"
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px;
                      border-radius: 6px; text-decoration: none; margin-top: 12px;">
              Ver en Supabase
            </a>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error Resend:', errorData);
      return res.status(500).json({ error: 'Error al enviar email' });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Error enviando email:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
}
