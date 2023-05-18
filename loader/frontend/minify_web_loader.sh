# minify raw code
../node_modules/.bin/esbuild code/react_loader.js --bundle --minify --outfile=code/loader.min.js

# add libs and save to "nodeJS_loader.min.js"
node code/to_single.js

# copy to release
cp loader.html ../release/loader.web.html

# remove processing files
rm -rf loader.html