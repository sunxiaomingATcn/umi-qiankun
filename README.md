# qiankun-example

qiankun 实战 demo，父应用 vue，子应用使用 `react`, `vue` 和 `umi`。

[微前端qiankun从搭建到部署的实践](https://juejin.im/post/6875462470593904653)

## 开始
安装根目录工程依赖
```
npm i
```
一键安装所有主子应用的依赖
```
npm run install
```

一键启动所有所有应用
```
npm start
```

通过 [http://localhost:8080/](http://localhost:8080/) 访问主应用。

## 发布
一键构建并打包所有主子应用
```
npm run build
```


单独构建并打包 sub-umi-product 子应用
```
build-micro:sub-umi-product
```


## tips

### sub-vue package.json

```
  "dependencies": {
    "common": "file:../common",
    "core-js": "^3.6.5",
    "vue": "^2.6.11",
    "vue-router": "^3.2.0",
    "vuex": "^3.4.0"
  },
```