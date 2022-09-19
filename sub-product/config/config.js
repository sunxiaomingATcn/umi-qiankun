// https://umijs.org/config/
import os from 'os';
import path from 'path';
import webpackPlugin from './plugin.config';

const {
  APP_TYPE,
  NODE_ENV
} = process.env;

const headScripts = [
  //   {
  //     content: `window._agl = window._agl || [];
  // (function () {
  //     _agl.push(
  //         ['production', '_f7L2XwGXjyszb4d1e2oxPybgD']
  //     );
  //     (function () {
  //         var agl = document.createElement('script');
  //         agl.type = 'text/javascript';
  //         agl.async = true;
  //         agl.src = 'https://fxgate.baidu.com/angelia/fcagl.js?production=_f7L2XwGXjyszb4d1e2oxPybgD';
  //         var s = document.getElementsByTagName('script')[0];
  //         s.parentNode.insertBefore(agl, s);
  //     })();
  // })();` }, {
  //     content: `    !function(g,d,t,e,v,n,s){
  //     if(g.gdt)
  //     return;
  //     v=g.gdt=function(){
  //         v.tk?v.tk.apply(v,arguments):v.queue.push(arguments)
  //     };
  //     v.sv='1.0';
  //     v.bt=0;
  //     v.queue=[];
  //     n=d.createElement(t);
  //     n.async=!0;
  //     n.src=e;
  //     s=d.getElementsByTagName(t)[0];s.parentNode.insertBefore(n,s);
  // }(window,document,'script','//qzonestyle.gtimg.cn/qzone/biz/gdt/dmp/user-action/gdtevent.min.js');
  // gdt('init','1110916290');
  // gdt('track','PAGE_VIEW');`
  //   },
  // {
  //   src: 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'
  // },
  {
    src: 'https://webapi.amap.com/maps?v=1.4.15&key=7c92b6b24fffc3137939da5908e3cdf3'
  }
]

const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      targets: {
        ie: 11,
      },
      chunks: NODE_ENV === 'production' ? ['app', 'umi'] : ['umi'],
      dynamicImport: { webpackChunkName: true },
      title: '澎湃保',
      dll: false,
      headScripts,
      metas: [{ name: "format-detection", content: "telephone=yes" }],
      // scripts: [{ src: 'https://res.wx.qq.com/open/js/jweixin-1.2.0.js' }],
      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//,
        ],
      }
    },
  ],
];


// judge add ga
// if (APP_TYPE === 'site') {
//   plugins.push([
//     'umi-plugin-ga',
//     {
//       code: 'UA-72788897-6',
//     },
//   ]);
// }
let babelPlugin;
// if (NODE_ENV !== 'development') {
//   babelPlugin = {
//     extraBabelPlugins: [
//       ['transform-remove-console', {
//         "exclude": ["error", "warn"]
//       }]
//     ],
//   }
// }

export default {
  // add for transfer to umi
  // plugins,
  dva: {
    hmr: true,
  },
  targets: {
    ie: 11,
  },
  chunks: NODE_ENV === 'production' ? ['app', 'umi'] : ['umi'],
  title: '澎湃保',
  dll: false,
  headScripts,
  metas: [{ name: "format-detection", content: "telephone=yes" }],
  history: { type: 'hash' },
  hash: true,
  targets: {
    ie: 11,
  },
  ...babelPlugin,
  proxy: {
    // '/baoying': {
    //   target: 'http://ppb.dev1.abaobaoxian.com',
    //   changeOrigin: true
    // },
    '/baoying': {
      target: 'https://dev1.saas.pengpaibao.com',
      changeOrigin: true,
      pathRewrite: {
        '^/backend': ''
      }
    },
    '/blade': {
      target: 'https://dev1.saas.pengpaibao.com',
      changeOrigin: true
    },
  },
  manifest: {
    basePath: '/',
  },
  // manifest: {
  //   basePath: '/',
  // },
  outputPath: './dist',
  externals: {
    "weixin": "window.wx",
  },
  chainWebpack: webpackPlugin,
  base: '/',
  qiankun: {
    slave: {},
  }
};
