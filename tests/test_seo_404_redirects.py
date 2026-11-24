import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class LegacyBusinessRedirects(unittest.TestCase):
    def test_verified_moved_businesses_redirect_permanently(self):
        config = json.loads((ROOT / 'vercel.json').read_text(encoding='utf-8'))
        fixture = json.loads((ROOT / 'tests/seo_404_20261124.json').read_text(encoding='utf-8'))
        redirects = {r['source']: r for r in config.get('redirects', [])}
        self.assertEqual(len(fixture), 48)
        self.assertEqual(len(redirects), len(config.get('redirects', [])))
        for item in fixture:
            with self.subTest(source=item['source']):
                self.assertIn(item['source'], redirects)
                self.assertEqual(redirects[item['source']]['destination'], item['destination'])
                self.assertIs(redirects[item['source']].get('permanent'), True)

    def test_neighborhood_alias_with_same_three_businesses_redirects(self):
        config = json.loads((ROOT / 'vercel.json').read_text(encoding='utf-8'))
        source = '/gimnasios/granada/centro-granada'
        target = '/gimnasios/granada/centro'
        matches = [r for r in config.get('redirects', []) if r['source'] == source]
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]['destination'], target)
        self.assertIs(matches[0]['permanent'], True)

    def test_unmatched_requests_are_not_rewritten_to_home(self):
        config = json.loads((ROOT / 'vercel.json').read_text(encoding='utf-8'))
        self.assertFalse(any(r['source'] in ('/(.*)', '/:path*') for r in config.get('redirects', [])))
        self.assertFalse(any(r['source'] in ('/(.*)', '/:path*') for r in config.get('rewrites', [])))

if __name__ == '__main__':
    unittest.main()
