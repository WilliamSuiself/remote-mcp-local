import axios from 'axios';
import { apiConfig } from '../config';

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
    // 验证新闻类型是否有效
    if (!apiConfig.newsApi.types.includes(type)) {
      return {
        success: false,
        error: `无效的新闻类型。有效类型: ${apiConfig.newsApi.types.join(', ')}`
      };
    }

    console.log(`正在请求新闻API，类型: ${type}, API密钥: ${env.NEWS_API_KEY ? '已设置' : '未设置'}`);
    
    // 确保API密钥已设置
    if (!env.NEWS_API_KEY) {
      return {
        success: false,
        error: 'API密钥未设置'
      };
    }

    // 使用与juheNews项目相同的请求格式
    const response = await axios.get<NewsResponse>(apiConfig.newsApi.baseUrl, {
      params: {
        key: env.NEWS_API_KEY,
        type
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log(`新闻API响应状态码: ${response.status}`);
    
    // 检查API响应是否包含错误
    if (response.data.error_code !== 0) {
      console.error('新闻API错误:', response.data);
      return {
        success: false,
        error: response.data.reason || '获取新闻失败'
      };
    }

    // 确保响应包含预期的数据结构
    if (!response.data.result || !response.data.result.data) {
      return {
        success: false,
        error: '新闻API返回了意外的数据格式'
      };
    }

    return {
      success: true,
      data: response.data.result.data
    };
  } catch (error: any) {
    console.error('新闻API错误:', error);
    
    // 提供更详细的错误信息
    let errorMessage = `获取新闻时发生错误: ${error.message}`;
    
    if (error.response) {
      // 请求已发出，但服务器响应的状态码不在 2xx 范围内
      errorMessage += ` (状态码: ${error.response.status})`;
      console.error('错误响应数据:', error.response.data);
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      errorMessage += ' (未收到响应)';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}