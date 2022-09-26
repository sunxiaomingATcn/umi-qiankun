#!/bin/bash

rm -rf ../dist/app/product

mkdir -p ../dist
mkdir -p ../dist/app

# sub-umi-product子应用
cp -r ./dist/ ../dist/app/product/

echo 'bundle.sh execute success.'
