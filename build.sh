echo "minifying"
rm compo/.
rm compo.zip
minify src/micro3d.js > compo/micro3d.js
minify src/index.html > compo/index.html
cp src/barna.bin compo
echo "compressing..."
zip -9 compo.zip -r compo
ls -l compo.zip
