echo "minifying"
rm compo/*
rm compo.zip
cat src/indexFinal.html > temp.html
cat src/micro3d.js >> temp.html
cat src/game.js >> temp.html
npx minify temp.html > compo/index.html
rm temp.html
cp src/barna.bin compo
echo "compressing..."
zip -9 compo.zip -r compo
ls -l compo.zip
