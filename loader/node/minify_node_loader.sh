# minify raw code
../node_modules/.bin/esbuild nodeJS_loader.js --minify --outfile=runner.min.js --platform=node

# add libs and save to "nodeJS_loader.min.js"
node combine.js

# remove processing files.
rm -rf runner.min.js
rm -rf check.js