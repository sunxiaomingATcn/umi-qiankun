module.exports = {
  transpileDependencies: ['common'],
  publicPath: './',
  chainWebpack: config => {
    config.plugin('html')
      .tap((args) => {
        args[0].title = 'qiankun'
        return args
      })
  },
  devServer: {
    proxy: {
      '/baoying': {
        target: 'https://dev1.saas.pengpaibao.com',
        secure: true
      },
      '/blade': {
        target: 'https://dev1.saas.pengpaibao.com',
        secure: true
      }
    }
  }
}
