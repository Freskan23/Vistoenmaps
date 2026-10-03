# -*- coding: utf-8 -*-
"""Regenera client/src/lib/limpitroMunis.ts desde el sitemap de Limpitro."""
import gzip, json, re, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def get(u):
    r = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip'})
    d = urllib.request.urlopen(r, timeout=30).read()
    if d[:2] == b'\x1f\x8b': d = gzip.decompress(d)
    return d.decode('utf-8', 'replace')

SERV = {'blindaje-de-tapicerias', 'desinfeccion-tapicerias', 'limpieza-de-alfombras',
        'limpieza-de-colchones', 'limpieza-de-cortinas', 'limpieza-de-edredones',
        'limpieza-de-moquetas', 'limpieza-de-sillas', 'limpieza-de-sillones',
        'limpieza-de-sofas', 'limpieza-interior-coche', 'limpieza-piel-cuero'}
sm = get('https://limpiezadesofasdomicilio.madrid/sitemap.xml')
urls = [u.rstrip('/') for u in re.findall(r'<loc>(.*?)</loc>', sm)]
last = [u.split('/')[-1] for u in urls[1:]]
munis = sorted(x for x in last if x not in SERV and not any(x.startswith(s + '-en-') for s in SERV))
ts = '''/**
 * Municipios donde Limpitro (limpiezadesofasdomicilio.madrid) publica pagina
 * propia de servicio = zona de servicio declarada por ellos. Generado desde su
 * sitemap.xml (%d municipios). Si su zona cambia, regenerar este archivo.
 */
export const LIMPITRO_MUNIS: Set<string> = new Set([
' ''' % len(munis) + '\n'.join('  "%s",' % m for m in munis) + '\n]);

export function limpitriza(slugCiudad: string): boolean {
  return LIMPITRO_MUNIS.has(slugCiudad);
}
'
(ROOT / 'client/src/lib/limpitroMunis.ts').write_text(ts, encoding='utf-8')
print('OK', len(munis))
