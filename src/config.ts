// 聚合数据API配置
export const apiConfig = {
  newsApi: {
    // 密钥将在运行时从环境变量中获取
    baseUrl: 'http://v.juhe.cn/toutiao/index',
    // 新闻类型: top(头条，默认),shehui(社会),guonei(国内),guoji(国际),yule(娱乐),tiyu(体育),junshi(军事),keji(科技),caijing(财经),shishang(时尚)
    types: ['top', 'shehui', 'guonei', 'guoji', 'yule', 'tiyu', 'junshi', 'keji', 'caijing', 'shishang']
  },
  timezoneApi: {
    // 密钥将在运行时从环境变量中获取
    baseUrl: 'http://apis.juhe.cn/worldtime/',
    // 可用区域: africa, america, antarctica, arctic, asia, atlantic, europe, pacific
    regions: ['africa', 'america', 'antarctica', 'arctic', 'asia', 'atlantic', 'europe', 'pacific']
  }
};