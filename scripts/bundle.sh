#!/bin/bash

rm -rf ./dist

mkdir ./dist
mkdir ./dist/app

# sub-react子应用
cp -r ./sub-react/build/ ./dist/app/react/

# sub-vue子应用
cp -r ./sub-vue/dist/ ./dist/app/vue/

# sub-umi子应用
cp -r ./sub-umi/dist/ ./dist/app/umi/

# sub-umi-product子应用
cp -r ./sub-umi-product/dist/ ./dist/app/product/

# main基座
cp -r ./main/dist/ ./dist/main/

# cd ./dist
# zip -r mp$(date +%Y%m%d%H%M%S).zip *
# cd ..
echo 'bundle.sh execute success.'
