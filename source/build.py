"""Repack the Bloom web prototype into a single self-contained HTML file.
Source: web.html (original export) + x/js/** modules + x/css/brand.css."""
import json, base64, os, re, sys
ROOT = '/home/claude/web-src'
src = open(f'{ROOT}/web.html', encoding='utf-8').read()

# fonts: add Figtree (≈ Matter) + Cormorant Garamond Italic (≈ Orpheus Pro Italic) + Instrument Serif
old_font = re.search(r'<link rel="stylesheet" href="https://fonts.googleapis.com/css2\?[^"]+" />', src).group(0)
new_font = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700'
            '&family=Cormorant+Garamond:ital,wght@1,400;1,500&family=Instrument+Serif:ital@0;1'
            '&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" />')
src = src.replace(old_font, new_font)

# brand layer after the last stylesheet
brand = open(f'{ROOT}/x/css/brand.css', encoding='utf-8').read()
src = src.replace('  <script type="importmap">', f'  <style data-src="css/brand.css">\n{brand}\n</style>\n  <script type="importmap">', 1)

# modules
i = src.find('<script type="importmap">') + len('<script type="importmap">'); j = src.find('</script>', i)
old = json.loads(src[i:j])['imports']
mods = {}
keys = list(old.keys())
for dirpath, _, files in os.walk(f'{ROOT}/x/js'):
    for f in files:
        rel = os.path.relpath(os.path.join(dirpath, f), f'{ROOT}/x').replace(os.sep, '/')
        k = 'bloom:/' + rel
        if k not in keys: keys.append(k)
for k in keys:
    path = f'{ROOT}/x/' + k.replace('bloom:/', '')
    if not os.path.exists(path): continue
    data = open(path, 'rb').read()
    mods[k] = 'data:text/javascript;base64,' + base64.b64encode(data).decode()
src = src[:i] + json.dumps({'imports': mods}) + src[j:]
src = src.replace('<title>The Bloom Experience · Bloom Holding</title>', '<title>Bloom Holding · Web</title>')
out = sys.argv[1] if len(sys.argv) > 1 else f'{ROOT}/build/index.html'
open(out, 'w', encoding='utf-8').write(src)
print('wrote', out, len(src))
