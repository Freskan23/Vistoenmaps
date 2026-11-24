import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
TSX = Path(os.environ.get('VEM_TSX_CLI', ROOT / 'node_modules/tsx/dist/cli.mjs'))

class SitemapDates(unittest.TestCase):
    def test_no_fake_lastmod_when_source_has_no_change_date(self):
        with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR')) as folder:
            root = Path(folder)
            (root / 'scripts').mkdir()
            shutil.copy2(ROOT / 'scripts/generate-sitemap.ts', root / 'scripts/generate-sitemap.ts')
            data = root / 'client/src/data'
            data.mkdir(parents=True)
            for name, records in {
                'categorias': [{'slug': 'limpieza'}],
                'ciudades': [{'slug': 'madrid'}],
                'barrios': [{'slug': 'centro', 'ciudad_slug': 'madrid'}],
                'negocios': [{'slug': 'prueba', 'categoria_slug': 'limpieza', 'ciudad_slug': 'madrid', 'barrio_slug': 'centro'}],
            }.items():
                (data / (name + '.json')).write_text(json.dumps(records), encoding='utf-8')
            (root / 'client/public/datos').mkdir(parents=True)
            for name in ('costes', 'blog'):
                (root / ('client/public/datos/' + name + '.json')).write_text('[]', encoding='utf-8')
            result = subprocess.run(['node', str(TSX), str(root / 'scripts/generate-sitemap.ts')], cwd=root, capture_output=True, text=True, timeout=25)
            self.assertEqual(result.returncode, 0, result.stderr)
            xml = (root / 'client/public/sitemap.xml').read_text(encoding='utf-8')
            self.assertIn('<loc>https://vistoenmaps.com/limpieza/madrid/centro/prueba</loc>', xml)
            self.assertNotIn('<lastmod>', xml, 'No change date exists in these records; build day is not content modification time')

if __name__ == '__main__':
    unittest.main()
