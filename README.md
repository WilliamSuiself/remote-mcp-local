# Remote MCP Server

这是一个基于MCP（Model Context Protocol）的远程服务器，集成了聚合数据的新闻和时区API。

## 功能

- **新闻服务**: 通过聚合数据的头条新闻API获取各类新闻
- **时区服务**: 通过聚合数据的世界时区API获取全球各地时区信息

## API密钥

服务使用了以下API密钥：

- 新闻API密钥: `f7e695542752406dbaef28b3c481be53`
- 时区API密钥: `59acb2d4e2ca5473eef3e0aa7e633739`

## 使用方法

### 获取新闻

```
[tool] getNews({type: "top"})
```

新闻类型参数可选值：
- top (头条，默认)
- shehui (社会)
- guonei (国内)
- guoji (国际)
- yule (娱乐)
- tiyu (体育)
- junshi (军事)
- keji (科技)
- caijing (财经)
- shishang (时尚)

### 获取时区信息

```
[tool] getTimezone({region: "asia"})
```

区域参数可选值：
- africa
- america
- antarctica
- arctic
- asia
- atlantic
- europe
- pacific

## 开发

### 安装依赖

```
npm install
```

### 启动开发服务器

```
npm run dev
```

### 构建

```
npm run build
```

## 技术栈

- TypeScript
- Cloudflare Workers
- MCP (Model Context Protocol)
- Axios