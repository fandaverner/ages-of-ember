#!/usr/bin/env bash
# Sestaví AgesOfEmber.exe ze souborů hry (spouštět z Git Bash: bash desktop/sestavit.sh)
set -e
cd "$(dirname "$0")"
HRA=..
rm -rf www/img; mkdir -p www/img
# jen soubory, které hra opravdu používá
cp "$HRA/game.js" www/
rm -rf www/hudba www/zvuky; cp -r "$HRA/hudba" "$HRA/zvuky" www/
sed -E 's|<script src="game.js(\?v=[^"]*)?"></script>|<script src="neutralino.js"></script>\n<script src="game.js"></script>|' "$HRA/index.html" > www/index.html
cp -r "$HRA/img/s" www/img/
cp "$HRA"/img/zem_*.png "$HRA/img/titul.webp" "$HRA/img/ikona.png" www/img/
# ikona programu (.exe) – soubor .ico s obrázkem PNG uvnitř
python -I -X utf8 - <<'PY'
import struct
png = open('www/img/ikona.png', 'rb').read()
open('ikona.ico', 'wb').write(struct.pack('<HHH', 0, 1, 1) + struct.pack('<BBBBHHII', 0, 0, 0, 0, 1, 32, len(png), 22) + png)
PY
node -e "(r => (r.rcedit || r.default || r))(require('rcedit'))('bin/neutralino-win_x64.exe', { icon: 'ikona.ico', 'file-version': '1.2.2', 'product-version': '1.2.2', 'version-string': { FileDescription: 'Ages of Ember', ProductName: 'Ages of Ember' } }).then(() => console.log('ikona ok'))"
rm -rf dist
npx neu build --release --embed-resources
# nechat jen verzi pro Windows: dist/AgesOfEmber.exe
mv dist/AgesOfEmber/AgesOfEmber-win_x64.exe dist/AgesOfEmber.exe
rm -rf dist/AgesOfEmber dist/*.zip
ls -la dist
