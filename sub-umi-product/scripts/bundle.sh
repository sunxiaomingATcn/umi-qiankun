#!/bin/bash

rm -rf ../dist/app/product

mkdir -p ../dist
mkdir -p ../dist/app

# sub-umi-product子应用
cp -r ./dist/ ../dist/app/product/

echo 'sub-umi-product bundle.sh execute success.'
