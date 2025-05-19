import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { getNews } from "./services/newsService";
import { getTimezone } from "./services/timezoneService";

// 添加全局错误处理函数
const logError = (location: string, error: any) => {
  console.error(`[ERROR][${location}] ${error.message || 'Unknown error'}`);
  console.error(`[ERROR][${location}] Stack: ${error.stack || 'No stack trace'}`);
  if (error.response) {
    console.error(`[ERROR][${location}] Response status: ${error.response.status}`);
    console.error(`[ERROR][${location}] Response data:`, error.response.data);
  }
  if (error.request) {
    console.error(`[ERROR][${location}] Request failed without response`);
  }
  return error;
};


// 定义环境变量
const ENV_VARS = {
  NEWS_API_KEY: "f7e695542752406dbaef28b3c481be53",
  TIMEZONE_API_KEY: "59acb2d4e2ca5473eef3e0aa7e633739"
};

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Demo",
		version: "1.0.0",
	});

	async init() {
		console.log('[INFO] 初始化 MCP 服务器');
		try {
			this.server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => {
				console.log(`[INFO] 执行加法操作: ${a} + ${b}`);
				return {
					content: [{ type: "text", text: String(a + b) }],
				};
			});

			// 添加新闻服务工具
			this.server.tool("getNews", { 
				type: z.string().default("top").describe("新闻类型: top(头条，默认),shehui(社会),guonei(国内),guoji(国际),yule(娱乐),tiyu(体育),junshi(军事),keji(科技),caijing(财经),shishang(时尚)") 
			}, async ({ type }) => {
				console.log(`[INFO] 请求新闻数据，类型: ${type}`);
				try {
					// 直接使用硬编码的API密钥
					const apiEnv = {
						NEWS_API_KEY: ENV_VARS.NEWS_API_KEY,
						TIMEZONE_API_KEY: ENV_VARS.TIMEZONE_API_KEY
					};
					
					console.log(`[INFO] 使用API密钥: ${apiEnv.NEWS_API_KEY ? '已设置' : '未设置'}`);
					
					// 调用新闻服务
					const result = await getNews(apiEnv, type).catch(err => {
						return logError('getNews', err);
					});
					
					if (!result || !result.success) {
						console.error(`[ERROR] 获取新闻失败: ${result?.error || '未知错误'}`);
						return {
							content: [{ type: "text", text: `错误: ${result?.error || '未知错误'}` }],
						};
					}

					console.log(`[INFO] 成功获取新闻数据，条目数: ${result.data?.length || 0}`);
					return {
						content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
					};
				} catch (error: any) {
					logError('getNews-outer', error);
					return {
						content: [{ type: "text", text: `获取新闻时发生错误: ${error.message || '未知错误'}` }],
					};
				}
			});

			// 添加时区服务工具
			this.server.tool("getTimezone", { 
				region: z.string().default("asia").describe("区域: africa, america, antarctica, arctic, asia, atlantic, europe, pacific") 
			}, async ({ region }) => {
				console.log(`[INFO] 请求时区数据，区域: ${region}`);
				try {
					// 直接使用硬编码的API密钥
					const apiEnv = {
						NEWS_API_KEY: ENV_VARS.NEWS_API_KEY,
						TIMEZONE_API_KEY: ENV_VARS.TIMEZONE_API_KEY
					};
					
					console.log(`[INFO] 使用API密钥: ${apiEnv.TIMEZONE_API_KEY ? '已设置' : '未设置'}`);
					
					// 调用时区服务
					const result = await getTimezone(apiEnv, region).catch(err => {
						return logError('getTimezone', err);
					});
					
					if (!result || !result.success) {
						console.error(`[ERROR] 获取时区数据失败: ${result?.error || '未知错误'}`);
						return {
							content: [{ type: "text", text: `错误: ${result?.error || '未知错误'}` }],
						};
					}

					console.log(`[INFO] 成功获取时区数据，条目数: ${result.data?.length || 0}`);
					return {
						content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
					};
				} catch (error: any) {
					logError('getTimezone-outer', error);
					return {
						content: [{ type: "text", text: `获取时区数据时发生错误: ${error.message || '未知错误'}` }],
					};
				}
			});
			console.log('[INFO] MCP 服务器工具注册完成');
		} catch (error: any) {
			logError('init', error);
			throw error; // 重新抛出错误以便上层捕获
		}
	}
}

// Export the OAuth handler as the default
export default new OAuthProvider({
	apiRoute: "/sse",
	// TODO: fix these types
	// @ts-ignore
	apiHandler: MyMCP.mount("/sse"),
	// @ts-ignore
	defaultHandler: app,
	authorizeEndpoint: "/authorize",
	tokenEndpoint: "/token",
	clientRegistrationEndpoint: "/register",
});