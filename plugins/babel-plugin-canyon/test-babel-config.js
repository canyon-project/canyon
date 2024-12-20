module.exports = {
  plugins: [
    'istanbul',
    ['./lib',{
      // 流水线侦测配置
      projectID:'9050',
      sha:'xxxxx',
      branch:'master',
      // 流水线变量里配置
      dsn:'http://localhost:3000',
      reporter:'xxxxx',
      // 插件里配置
      compareTarget: 'main',
      provider: 'tripgl',
      // ==========以上是属性=============
      // 代理配置
      oneByOne: true, //可配置代理 默认false
      special: true, //默认false
      keepMap: true, // 默认false
      addAttributes:['branch'], //默认全部，有的话用有的，适用于生产
    }]
  ]
}
