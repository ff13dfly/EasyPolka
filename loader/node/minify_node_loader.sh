# minify raw code
../node_modules/.bin/esbuild code/loader.nodejs.js --minify --outfile=runner.min.js --platform=node

# add libs and save to "nodeJS_loader.min.js"
node code/combine.js

# copy to release
cp loader.nodejs.min.js ../release/loader.nodejs.js

# remove processing files.
rm -rf runner.min.js
rm -rf check.js
rm -rf loader.nodejs.min.js