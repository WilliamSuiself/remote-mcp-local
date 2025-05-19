import { apiConfig } from '../config';

// 添加请求超时设置
const FETCH_TIMEOUT = 30000; // 30秒

export interface NewsResponse {
  error_code: number;
  reason?: string;
  result?: {
    stat: string;
    data: NewsItem[];
  };
}

export interface NewsItem {
  uniquekey: string;
  title: string;
  date: string;
  category: string;
  author_name: string;
  url: string;
  thumbnail_pic_s?: string;
  thumbnail_pic_s02?: string;
  thumbnail_pic_s03?: string;
  is_content?: string;
}

/**
 * 获取新闻数据
 * @param env Cloudflare Workers环境变量对象
 * @param type 新闻类型: top(头条，默认),shehui(社会),guonei(国内),guoji(国际),yule(娱乐),tiyu(体育),junshi(军事),keji(科技),caijing(财经),shishang(时尚)
 * @returns 新闻数据或错误信息
 */
export async function getNews(env: any, type: string = 'top'): Promise<{ success: boolean; data?: NewsItem[]; error?: string }> {
  try {
    console.log(`[DEBUG][getNews] 开始获取新闻数据，类型: ${type}, API URL: ${apiConfig.newsApi.baseUrl}`);
    
    // 验证新闻类型是否有效
    if (!apiConfig.newsApi.types.includes(type)) {
      console.warn(`[WARN][getNews] 无效的新闻类型: ${type}`);
      return {
        success: false,
        error: `无效的新闻类型。有效类型: ${apiConfig.newsApi.types.join(', ')}`
      };
    }

    console.log(`[INFO][getNews] 正在请求新闻API，类型: ${type}, API密钥: ${env.NEWS_API_KEY ? '已设置' : '未设置'}`);
    
    // 确保API密钥已设置
    if (!env.NEWS_API_KEY) {
      console.error(`[ERROR][getNews] API密钥未设置`);
      return {
        success: false,
        error: 'API密钥未设置'
      };
    }

    // 构建 URL 和参数
    const url = new URL(apiConfig.newsApi.baseUrl);
    url.searchParams.append('key', env.NEWS_API_KEY);
    url.searchParams.append('type', type);
    
    console.log(`[DEBUG][getNews] 发起HTTP请求到: ${url.toString()}`);
    
    // 使用 fetch API 发起请求，并设置超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        signal: controller.signal
      });
      
      // 清除超时定时器
      clearTimeout(timeoutId);
      
      console.log(`[INFO][getNews] 新闻API响应状态码: ${response.status}`);
      
      // 检查HTTP状态码
      if (!response.ok) {
        console.error(`[ERROR][getNews] HTTP状态码错误: ${response.status}`);
        return {
          success: false,
          error: `HTTP请求失败，状态码: ${response.status}`
        };
      }
      
      // 解析JSON响应
      const data: NewsResponse = await response.json();
      
      // 检查API响应是否包含错误
      if (data.error_code !== 0) {
        console.error(`[ERROR][getNews] 新闻API错误代码: ${data.error_code}, 原因: ${data.reason || '未知'}`);
        return {
          success: false,
          error: data.reason || '获取新闻失败'
        };
      }
      
      // 确保响应包含预期的数据结构
      if (!data.result || !data.result.data) {
        console.error(`[ERROR][getNews] API响应数据结构异常:`, data);
        return {
          success: false,
          error: '新闻API返回了意外的数据格式'
        };
      }
      
      const newsItems = data.result.data;
      console.log(`[INFO][getNews] 成功获取新闻数据，条目数: ${newsItems.length}`);
      
      return {
        success: true,
        data: newsItems
      };
    } catch (fetchError) {
      // 清除超时定时器
      clearTimeout(timeoutId);
      throw fetchError; // 重新抛出错误，由外层 catch 处理
    }
  } catch (error: any) {
    console.error(`[ERROR][getNews] 新闻API异常:`, error);
    
    // 提供更详细的错误信息
    let errorMessage = `获取新闻时发生错误: ${error.message || '未知错误'}`;
    
    // 检查是否是超时错误
    if (error.name === 'AbortError') {
      errorMessage = `请求超时，超时时间: ${FETCH_TIMEOUT/1000}秒`;
      console.error(`[ERROR][getNews] 请求超时: ${errorMessage}`);
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}