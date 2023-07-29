# minify raw code
../node_modules/.bin/esbuild code/download.js --bundle --minify --outfile=code/download.min.js

# add libs and save to "nodeJS_loader.min.js"
node code/to_single.js

# copy to release
cp down.html ../release/downloader.html

# remove processing files
rm -rf down.html