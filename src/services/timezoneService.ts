import axios from 'axios';
import { apiConfig } from '../config';

export interface TimezoneResponse {
  error_code: number;
  reason?: string;
  result?: {
    tz: TimezoneItem[];
  };
}

export interface TimezoneItem {
  name: string;
  timezone_id: string;
  timezone: string;
  utc: string;
}

/**
 * 获取时区数据
 * @param env Cloudflare Workers环境变量对象
 * @param region 区域: africa, america, antarctica, arctic, asia, atlantic, europe, pacific
 * @returns 时区数据或错误信息
 */
export async function getTimezone(env: any, region: string = 'asia'): Promise<{ success: boolean; data?: TimezoneItem[]; error?: string }> {
  try {
    // 验证区域是否有效
    if (!apiConfig.timezoneApi.regions.includes(region)) {
      return {
        success: false,
        error: `无效的区域。有效区域: ${apiConfig.timezoneApi.regions.join(', ')}`
      };
    }

    console.log(`正在请求时区API，区域: ${region}, API密钥: ${env.TIMEZONE_API_KEY ? '已设置' : '未设置'}`);
    
    // 确保API密钥已设置
    if (!env.TIMEZONE_API_KEY) {
      return {
        success: false,
        error: 'API密钥未设置'
      };
    }

    // 完全按照juheNews项目中的实现方式
    const response = await axios.get<TimezoneResponse>(apiConfig.timezoneApi.baseUrl, {
      params: {
        key: env.TIMEZONE_API_KEY,
        c: region  // 使用'c'作为参数名，而不是'region'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log(`时区API响应状态码: ${response.status}`);
    console.log(`时区API响应数据:`, response.data);

    // 检查API响应是否包含错误
    if (response.data.error_code !== 0) {
      console.error('时区API错误:', response.data);
      return {
        success: false,
        error: response.data.reason || '获取时区数据失败'
      };
    }

    // 确保响应包含预期的数据结构
    if (!response.data.result || !response.data.result.tz) {
      return {
        success: false,
        error: '时区API返回了意外的数据格式'
      };
    }

    return {
      success: true,
      data: response.data.result.tz
    };
  } catch (error: any) {
    console.error('时区API错误:', error);
    
    // 提供更详细的错误信息
    let errorMessage = `获取时区数据时发生错误: ${error.message}`;
    
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