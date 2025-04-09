interface Env {
  // KV 命名空间
  OAUTH_KV: KVNamespace;
  
  // 环境变量
  NEWS_API_KEY: string;
  TIMEZONE_API_KEY: string;
  
  // 资源绑定
  ASSETS: { fetch: typeof fetch };
  
  // Durable Objects
  MCP_OBJECT: DurableObjectNamespace;
}