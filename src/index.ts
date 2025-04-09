import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { getNews } from "./services/newsService";
import { getTimezone } from "./services/timezoneService";

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
		this.server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
			content: [{ type: "text", text: String(a + b) }],
		}));

		// 添加新闻服务工具
		this.server.tool("getNews", { 
			type: z.string().default("top").describe("新闻类型: top(头条，默认),shehui(社会),guonei(国内),guoji(国际),yule(娱乐),tiyu(体育),junshi(军事),keji(科技),caijing(财经),shishang(时尚)") 
		}, async ({ type }) => {
			try {
				// 直接使用硬编码的API密钥
				const apiEnv = {
					NEWS_API_KEY: ENV_VARS.NEWS_API_KEY,
					TIMEZONE_API_KEY: ENV_VARS.TIMEZONE_API_KEY
				};
				
				// 调用新闻服务
				const result = await getNews(apiEnv, type);
				
				if (!result.success) {
					return {
						content: [{ type: "text", text: `错误: ${result.error}` }],
					};
				}

				return {
					content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
				};
			} catch (error: any) {
				return {
					content: [{ type: "text", text: `获取新闻时发生错误: ${error.message}` }],
				};
			}
		});

		// 添加时区服务工具
		this.server.tool("getTimezone", { 
			region: z.string().default("asia").describe("区域: africa, america, antarctica, arctic, asia, atlantic, europe, pacific") 
		}, async ({ region }) => {
			try {
				// 直接使用硬编码的API密钥
				const apiEnv = {
					NEWS_API_KEY: ENV_VARS.NEWS_API_KEY,
					TIMEZONE_API_KEY: ENV_VARS.TIMEZONE_API_KEY
				};
				
				// 调用时区服务
				const result = await getTimezone(apiEnv, region);
				
				if (!result.success) {
					return {
						content: [{ type: "text", text: `错误: ${result.error}` }],
					};
				}

				return {
					content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
				};
			} catch (error: any) {
				return {
					content: [{ type: "text", text: `获取时区数据时发生错误: ${error.message}` }],
				};
			}
		});
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