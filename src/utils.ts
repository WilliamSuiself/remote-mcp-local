import { marked } from "marked";

// 基本布局函数
export function layout(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 { color: #2c3e50; }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .btn {
      display: inline-block;
      padding: 10px 15px;
      background: #3498db;
      color: white;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 16px;
      margin: 5px 0;
    }
    .btn:hover { background: #2980b9; }
    .container { margin-top: 30px; }
    .scope-item {
      border: 1px solid #ddd;
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
  `;
}

// 主页内容
export async function homeContent(request: Request): Promise<string> {
  const url = new URL(request.url);
  return `
    <h1>MCP 远程服务器</h1>
    <p>这是一个集成了聚合数据新闻和时区API的MCP服务。</p>
    <h2>可用工具</h2>
    <ul>
      <li><strong>getNews</strong> - 获取各类新闻</li>
      <li><strong>getTimezone</strong> - 获取全球各地时区信息</li>
    </ul>
    <p><a href="${url.origin}/authorize" class="btn">授权访问</a></p>
  `;
}

// 解析表单数据
export async function parseApproveFormBody(formData: FormData): Promise<{
  action: string;
  oauthReqInfo: any;
  email: string;
  password: string;
}> {
  const action = formData.get("action") as string || "";
  const oauthReqInfoStr = formData.get("oauth_req_info") as string || "{}";
  const email = formData.get("email") as string || "";
  const password = formData.get("password") as string || "";

  let oauthReqInfo = null;
  try {
    oauthReqInfo = JSON.parse(oauthReqInfoStr);
  } catch (e) {
    console.error("Failed to parse oauth_req_info", e);
  }

  return { action, oauthReqInfo, email, password };
}

// 渲染已登录的授权页面
export async function renderLoggedInAuthorizeScreen(
  scopes: Array<{ name: string; description: string }>,
  oauthReqInfo: any
): Promise<string> {
  const scopesList = scopes
    .map(
      (scope) => `
    <div class="scope-item">
      <strong>${scope.name}</strong>
      <p>${scope.description}</p>
    </div>
  `
    )
    .join("");

  return `
    <h1>授权请求</h1>
    <p>应用 <strong>${oauthReqInfo.client_name || "未知应用"}</strong> 请求访问您的账户。</p>
    
    <h2>请求的权限：</h2>
    ${scopesList}
    
    <form method="POST" action="/approve">
      <input type="hidden" name="action" value="approve" />
      <input type="hidden" name="oauth_req_info" value='${JSON.stringify(oauthReqInfo)}' />
      <button type="submit" class="btn">授权访问</button>
    </form>
  `;
}

// 渲染未登录的授权页面
export async function renderLoggedOutAuthorizeScreen(
  scopes: Array<{ name: string; description: string }>,
  oauthReqInfo: any
): Promise<string> {
  const scopesList = scopes
    .map(
      (scope) => `
    <div class="scope-item">
      <strong>${scope.name}</strong>
      <p>${scope.description}</p>
    </div>
  `
    )
    .join("");

  return `
    <h1>登录并授权</h1>
    <p>应用 <strong>${oauthReqInfo.client_name || "未知应用"}</strong> 请求访问您的账户。</p>
    
    <h2>请求的权限：</h2>
    ${scopesList}
    
    <form method="POST" action="/approve">
      <input type="hidden" name="action" value="login_approve" />
      <input type="hidden" name="oauth_req_info" value='${JSON.stringify(oauthReqInfo)}' />
      
      <div>
        <label for="email">电子邮件：</label>
        <input type="email" id="email" name="email" required />
      </div>
      
      <div>
        <label for="password">密码：</label>
        <input type="password" id="password" name="password" required />
      </div>
      
      <button type="submit" class="btn">登录并授权</button>
    </form>
  `;
}

// 渲染授权被拒绝的页面
export async function renderAuthorizationRejectedContent(
  homeUrl: string
): Promise<string> {
  return `
    <h1>授权被拒绝</h1>
    <p>您的登录信息无效或您拒绝了授权请求。</p>
    <a href="${homeUrl}" class="btn">返回首页</a>
  `;
}

// 渲染授权成功的页面
export async function renderAuthorizationApprovedContent(
  redirectUrl: string
): Promise<string> {
  return `
    <h1>授权成功</h1>
    <p>您已成功授权该应用访问您的账户。</p>
    <p>正在重定向到应用...</p>
    <a href="${redirectUrl}" class="btn">如果未自动重定向，请点击此处</a>
    <script>
      setTimeout(() => {
        window.location.href = "${redirectUrl}";
      }, 2000);
    </script>
  `;
}