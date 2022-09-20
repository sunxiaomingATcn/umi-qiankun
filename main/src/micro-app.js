import store from './store'

const microApps = [
  {
    name: 'sub-vue',
    entry: process.env.VUE_APP_SUB_VUE,
    activeRule: '/sub-vue'
  },
  {
    name: 'sub-react',
    entry: process.env.VUE_APP_SUB_REACT,
    activeRule: '/sub-react'
  },
  {
    name: 'sub-umi',
    entry: process.env.VUE_APP_SUB_UMI, // 配置为字符串时，表示微应用的访问地址
    activeRule: '/sub-umi' // 微应用的激活规则
  },
  {
    name: 'sub-product',
    entry: process.env.VUE_APP_SUB_PRODUCT,
    activeRule: '/sub-product'
  }
]

const apps = microApps.map(item => {
  return {
    ...item,
    container: '#subapp-viewport', // 子应用挂载的div
    props: {
      routerBase: item.activeRule, // 下发基础路由
      getGlobalState: store.getGlobalState // 下发getGlobalState方法
    }
  }
})

export default apps
