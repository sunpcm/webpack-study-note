# 🎯 Webpack 5 + React + TypeScript 配置完全指南

> 本文档详细讲解了一个现代化前端项目的完整 Webpack 配置，包含所有优化技巧和最佳实践。

---

## 📁 项目结构

```
webpack-study-note/
├── build/                          # Webpack 配置目录
│   ├── webpack.common.js          # 通用配置（开发/生产共享）
│   ├── webpack.dev.js             # 开发环境配置
│   ├── webpack.prod.js            # 生产环境配置
│   └── plugins/                   # 自定义插件（示例）
│       ├── build-time-plugin.js
│       └── bundle-size-monitor-plugin.js
├── src/                           # 源代码
├── public/                        # 静态资源
├── .env.development              # 开发环境变量
├── .env.production               # 生产环境变量
├── babel.config.js               # Babel 配置
├── postcss.config.mjs            # PostCSS 配置（Tailwind CSS）
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 依赖和脚本
```

---

## 🏗️ 配置架构设计

### **三层配置模式**

```
webpack.common.js  ← 通用配置（入口、解析、基础 loader、代码分割）
       ↓
   ┌───┴────────────────┐
   ↓                    ↓
webpack.dev             webpack.prod  ← 环境特定配置
  (HMR + Fast Refresh)              (压缩 + CSS 提取)
```

**设计原则：**
- ✅ **DRY（Don't Repeat Yourself）**：公共配置只写一次
- ✅ **环境分离**：开发和生产各司其职
- ✅ **代码分割统一**：开发和生产都启用代码分割，保持环境一致性
- ✅ **易维护**：修改通用配置影响所有环境

---

## 🔧 1. webpack.common.js - 通用配置

这是所有环境共享的基础配置，包含入口、解析规则、加载器和通用插件。

```js
const config = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📦 入口 (Entry)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  entry: path.resolve(__dirname, '../src/index.tsx'),
  // 👆 Webpack 从这里开始分析依赖图 (Dependency Graph)
  // 所有 import 的模块都会被递归解析
```

### 1.1 resolve - 模块解析配置

```js
resolve: {
  extensions: ['.tsx', '.ts', '.js']
}
```

| 配置项 | 说明 |
|--------|------|
| `extensions` | 自动补全文件后缀，允许 `import App from './App'` 而不用写 `./App.tsx` |

**解析顺序**：Webpack 会按数组顺序尝试 `.tsx` → `.ts` → `.js`

### 1.2 module.rules - Loader 规则

Loader 是 Webpack 的核心概念，用于转换非 JS 文件。

#### 规则 1: JavaScript/TypeScript 处理

```js
{
  test: /\.(ts|js)x?$/,        // 匹配 .ts, .tsx, .js, .jsx
  exclude: /node_modules/,     // 排除依赖包（它们已经编译过了）
  use: ['babel-loader']        // 使用 Babel 编译
}
```

**工作流程**：
```
.tsx/.ts/.jsx/.js → babel-loader → 浏览器可执行的 ES5/ES6 代码
```

#### 规则 2: SVG 作为 React 组件

```js
{
  test: /\.svg$/i,
  issuer: /\.[jt]sx?$/,       // 只在 JS/TS 文件中 import 时生效
  use: ['@svgr/webpack']       // 转换成 React 组件
}
```

**使用方式**：
```tsx
import Logo from './logo.svg';  // Logo 是一个 React 组件
<Logo fill="red" width={100} /> // 可以传 props 控制样式
```

#### 规则 3: 图片/字体资源处理

```js
{
  test: /\.(png|svg|jpg|jpeg|gif)$/i,
  type: 'asset'               // Webpack 5 内置的资源模块
}
```

**`type: 'asset'` 的智能行为**：
- 文件 < 8KB → 转为 Base64 内联（减少 HTTP 请求）
- 文件 ≥ 8KB → 单独输出文件（避免 JS 包过大）

### 1.3 plugins - 通用插件

| 插件 | 作用 |
|------|------|
| `HtmlWebpackPlugin` | 自动生成 HTML 并注入打包后的 JS/CSS |
| `ForkTsCheckerWebpackPlugin` | 在独立进程中做 TS 类型检查（不阻塞构建） |
| `Dotenv` | 加载 `.env` 文件中的环境变量到 `process.env` |

```js
new HtmlWebpackPlugin({
  template: '../public/index.html',  // HTML 模板
  filename: 'index.html',            // 输出文件名
  title: 'Webpack React TS'          // 可在模板中用 <%= htmlWebpackPlugin.options.title %>
})
```

### 1.4 构建性能测量

```js
const smp = new SpeedMeasurePlugin();

// 根据环境变量决定是否启用测量
module.exports = process.env.MEASURE ? smp.wrap(config) : config;
```

运行 `pnpm build:analyze` 时会输出每个 loader/plugin 的耗时。

---

## 🔨 2. webpack.dev.js - 开发环境配置

开发配置的核心目标：**快速构建 + 热更新 + 调试友好**

> ⚠️ **重要**：代码分割配置在 `webpack.common.js` 中，开发和生产环境都会应用。

### 2.1 基础配置

```js
module.exports = merge(common, {
  mode: 'development',           // 开发模式，不压缩代码
  devtool: 'eval-source-map',    // Source Map 策略
})
```

**Source Map 类型对比**：

| 类型 | 构建速度 | 重构建速度 | 调试质量 |
|------|----------|------------|----------|
| `eval` | ⚡最快 | ⚡最快 | ❌无 |
| `eval-source-map` | 🔸中等 | ⚡快 | ✅原始源码 |
| `source-map` | 🐢慢 | 🐢慢 | ✅最佳 |

**推荐**：开发用 `eval-source-map`，生产用 `source-map`

### 2.2 DevServer 配置

```js
devServer: {
  static: '../dist',              // 静态文件目录
  port: 3000,                     // 端口号
  hot: true,                      // 🔥 热模块替换 (HMR)
  open: true,                     // 自动打开浏览器
  compress: true,                 // 启用 gzip 压缩
  historyApiFallback: true,       // SPA 路由支持（所有 404 返回 index.html）
}
```

### 2.3 代理配置 (Proxy)

解决开发时的跨域问题：

```js
proxy: [
  {
    context: ['/api/datasets'],       // 匹配的请求路径
    target: "http://localhost:8080",  // 转发目标
    changeOrigin: true,               // 修改 Host 头（解决某些后端的限制）
    pathRewrite: { '^/api/datasets': '' },  // 路径重写
    secure: false,                    // 允许自签名 HTTPS
  },
  // ... 其他代理
]
```

**请求转发示例**：
```
前端请求: GET /api/datasets/list
    ↓ 代理转发 + 路径重写
后端收到: GET http://localhost:8080/list
```

### 2.4 React Fast Refresh (热更新)

```js
plugins: [
  new ReactRefreshWebpackPlugin()
]
```

**HMR vs Fast Refresh**：
- `HMR` (Hot Module Replacement)：Webpack 层面的模块热替换
- `Fast Refresh`：React 层面的组件状态保持

配合 Babel 插件 `react-refresh/babel`，修改组件代码后：
- ✅ 组件即时更新
- ✅ 状态不丢失（useState 的值保留）
- ✅ 不需要手动刷新页面

### 2.5 CSS 处理（开发模式）

```js
{
  test: /\.(css|scss)$/,
  use: [
    "style-loader",           // 1️⃣ 将 CSS 注入到 <style> 标签
    {
      loader: "css-loader",
      options: { 
        importLoaders: 1,     // 在 css-loader 之前有 1 个 loader
        sourceMap: true       // 开启 CSS 源码映射
      },
    },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: { 
          plugins: ["@tailwindcss/postcss", "autoprefixer"] 
        },
      },
    },
  ]
}
```

**Loader 执行顺序**（从后往前）：
```
.css 文件 → postcss-loader (Tailwind + 前缀) → css-loader (处理 import) → style-loader (注入 DOM)
```

---

## 🚀 3. webpack.prod.js - 生产环境配置

生产配置的核心目标：**体积最小 + 加载最快 + 缓存最优**

> ⚠️ **重要**：代码分割配置在 `webpack.common.js` 中，开发和生产环境都会应用。

### 3.1 输出配置

```js
output: {
  path: '../dist',
  filename: '[name].[contenthash:8].js',        // 内容哈希用于缓存
  clean: true,                                   // 构建前清理 dist
  assetModuleFilename: 'assets/[hash:8][ext]',  // 静态资源输出路径
  pathinfo: false,                               // 关闭路径信息（减小体积）
}
```

**`[contenthash]` 的作用**：
```
main.a1b2c3d4.js  ← 内容变了才会变 hash
                   ← 浏览器可以长期缓存
```

### 3.2 性能提示配置

```js
performance: {
  hints: 'warning',           // 超出限制时警告
  maxEntrypointSize: 512000,  // 入口文件限制 512KB
  maxAssetSize: 512000,       // 单个资源限制 512KB
}
```

### 3.3 文件系统缓存

```js
cache: {
  type: 'filesystem',                          // 缓存到磁盘
  cacheDirectory: '../.webpack_cache',         // 缓存目录
  buildDependencies: {
    config: [__filename],                      // 配置文件变化时失效缓存
  },
}
```

**效果**：二次构建速度提升 50-90%

### 3.4 CSS 处理（生产模式）

```js
{
  test: /\.(css|scss)$/,
  use: [
    MiniCssExtractPlugin.loader,  // 提取为独立 CSS 文件（替代 style-loader）
    // ... 其他 loader
  ],
}

// 插件配置
new MiniCssExtractPlugin({
  filename: 'css/[name].[contenthash:8].css',
  chunkFilename: 'css/[name].[contenthash:8].chunk.css',
})
```

**开发 vs 生产的 CSS 处理差异**：

| 环境 | 处理方式 | 原因 |
|------|----------|------|
| 开发 | `style-loader` 注入 `<style>` | HMR 更快 |
| 生产 | 提取为独立 `.css` 文件 | 并行加载，可缓存 |

### 3.5 代码压缩 (Minimizer)

#### JS 压缩 - TerserPlugin

```js
new TerserPlugin({
  terserOptions: {
    compress: {
      drop_console: true,       // 移除 console.log
      drop_debugger: true,      // 移除 debugger
      pure_funcs: ['console.log'],
    },
    format: {
      comments: false,          // 移除注释
    },
    mangle: true,               // 变量名混淆
  },
  parallel: true,               // 多进程并行压缩
})
```

#### CSS 压缩 - CssMinimizerPlugin

```js
new CssMinimizerPlugin({
  minimizerOptions: {
    preset: ['default', {
      discardComments: { removeAll: true },  // 移除所有注释
    }],
  },
  parallel: true,
})
```

### 3.6 代码分割 (splitChunks) ⭐ 最重要

> ⚠️ **配置位置**：代码分割配置在 `webpack.common.js` 中，不在 `webpack.prod.js`！
> 
> **原因**：开发和生产环境都需要代码分割，统一配置可以保持环境一致性。

```js
// 位于 webpack.common.js
optimization: {
  runtimeChunk: 'single',
  splitChunks: {
    chunks: 'all',          // 同步 + 异步 chunk 都分割
    
    cacheGroups: {
      // 🔹 React 核心库单独打包
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
        name: 'react-vendor',
        priority: 10,
        reuseExistingChunk: true,
      },
      
      // 🔹 其他第三方库
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendor',
        priority: 5,
        reuseExistingChunk: true,
      },
      
      // 🔹 公共业务代码
      common: {
        name: 'common',
        minChunks: 2,        // 被引用 2 次以上才提取
        priority: 1,
        reuseExistingChunk: true,
      },
    },
  },
  },
}
```

**分割后的文件结构**：
```
dist/
├── runtime.a1b2c3.js      ← Webpack 运行时
├── react-vendor.d4e5f6.js ← React + ReactDOM + React Router
├── vendor.g7h8i9.js       ← 其他 npm 包
├── common.j0k1l2.js       ← 公共业务代码
├── main.m3n4o5.js         ← 入口业务代码
└── css/
    └── styles.p6q7r8.css  ← 提取的 CSS
```

**为什么要这样分割？**

| 包 | 更新频率 | 缓存策略 |
|----|----------|----------|
| `runtime` | 每次构建 | 短期缓存 |
| `react-vendor` | 几个月一次 | 长期缓存 |
| `vendor` | 偶尔 | 中期缓存 |
| `common` | 较频繁 | 中期缓存 |
| `main` | 频繁 | 短期缓存 |

### 3.7 运行时 Chunk

> ⚠️ **配置位置**：`runtimeChunk` 配置在 `webpack.common.js` 中，不在 `webpack.prod.js`！

```js
// 位于 webpack.common.js
runtimeChunk: 'single',  // Webpack 的启动代码单独打包
```

**作用**：避免业务代码未变但 hash 变化的问题。

### 3.8 构建分析

```js
new BundleAnalyzerPlugin({
  analyzerMode: 'static',         // 生成静态 HTML 报告
  openAnalyzer: false,            // 不自动打开
  reportFilename: 'bundle-report.html',
  defaultSizes: 'gzip',           // 显示 gzip 后大小
})
```

运行 `pnpm build` 后查看 `dist/bundle-report.html`。

---

## 🔤 4. babel.config.js - Babel 配置

Babel 负责将现代 JS/TS/JSX 编译为浏览器兼容的代码。

### 4.1 Presets（预设）

```js
presets: [
  // 🔹 JavaScript 语法转换
  ['@babel/preset-env', {
    useBuiltIns: 'usage',     // 按需引入 polyfill
    corejs: { version: 3 },   // core-js 版本
    modules: false,           // 保留 ESM，让 Webpack 做 Tree Shaking
    debug: isDevelopment,     // 开发时打印编译信息
  }],
  
  // 🔹 React JSX 转换
  ['@babel/preset-react', {
    runtime: 'automatic',     // React 17+ 新 JSX 转换（无需 import React）
    development: isDevelopment,
  }],
  
  // 🔹 TypeScript 转换
  '@babel/preset-typescript',
]
```

**`useBuiltIns: 'usage'` 的魔法**：
```js
// 源码
const arr = [1, 2, 3].includes(2);

// Babel 自动检测到 includes 需要 polyfill，只引入需要的部分
import "core-js/modules/es.array.includes.js";
const arr = [1, 2, 3].includes(2);
```

### 4.2 Plugins（插件）

```js
plugins: [
  // 1️⃣ React Fast Refresh（仅开发环境）
  isDevelopment && 'react-refresh/babel',
  
  // 2️⃣ Runtime Helper 复用
  ['@babel/plugin-transform-runtime', {
    helpers: true,      // 复用 Babel helper 函数
    regenerator: true,  // async/await 支持
  }],
].filter(Boolean)
```

**`@babel/plugin-transform-runtime` 的作用**：

```js
// ❌ 没有这个插件，每个文件都会内联 helper
function _classCallCheck(instance, Constructor) { ... }
class Foo {}

// ✅ 有这个插件，从共享模块引入
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
class Foo {}
```

---

## 🎨 5. postcss.config.mjs - PostCSS 配置

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // Tailwind CSS v4 处理器
    autoprefixer: {},             // 自动添加浏览器前缀
  },
};
```

**autoprefixer 示例**：
```css
/* 输入 */
.box { display: flex; }

/* 输出（根据 browserslist 添加前缀） */
.box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
```

---

## 📘 6. tsconfig.json - TypeScript 配置

```json
{
  "compilerOptions": {
    // === 编译输出 ===
    "target": "ESNext",       // 输出最新 ES 语法（Babel 再降级）
    "module": "ESNext",       // 保留 ESM（让 Webpack Tree Shake）
    "jsx": "react-jsx",       // React 17+ JSX 转换
    
    // === 模块解析 ===
    "moduleResolution": "node",  // Node.js 风格的模块查找
    "esModuleInterop": true,     // 兼容 CommonJS 的 default import
    
    // === 严格检查 ===
    "strict": true,           // 启用所有严格检查
    "skipLibCheck": true,     // 跳过 .d.ts 检查（提速）
    
    // === 路径别名 ===
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]        // @/components → src/components
    }
  },
  "include": ["src"]          // 只检查 src 目录
}
```

> ⚠️ 注意：TypeScript 在此项目中**只做类型检查**，实际编译由 Babel 完成。
> `ForkTsCheckerWebpackPlugin` 在独立进程中运行 TS 检查，不阻塞构建。

---

## 📜 7. package.json - NPM 脚本

```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=development webpack serve --config build/webpack.dev.js",
    "build": "cross-env NODE_ENV=production webpack --config build/webpack.prod.js",
    "build:analyze": "cross-env NODE_ENV=production MEASURE=true webpack --config build/webpack.prod.js",
    "clean": "rimraf dist .webpack_cache node_modules/.cache"
  }
}
```

| 命令 | 说明 |
|------|------|
| `pnpm start` | 启动开发服务器 (localhost:3000) |
| `pnpm build` | 生产构建 |
| `pnpm build:analyze` | 生产构建 + 性能分析 |
| `pnpm clean` | 清理构建产物和缓存 |

### Browserslist 配置

```json
"browserslist": [
  "> 0.5%",           // 全球使用率 > 0.5%
  "last 2 versions",  // 每个浏览器最新 2 个版本
  "not dead",         // 排除已停止维护的浏览器
  "not IE 11",        // 排除 IE 11
  "iOS >= 10",        // iOS Safari 10+
  "Android >= 6"      // Android 6+
]
```

Babel 和 autoprefixer 都会读取这个配置来决定编译目标。

---

## 🔌 8. 自定义 Webpack 插件（参考）

项目包含两个示例插件（当前未启用）：

### BuildTimePlugin - 构建时间监控

```js
compiler.hooks.run.tapAsync('BuildTimePlugin', (compiler, callback) => {
  startTime = Date.now();
  callback();
});

compiler.hooks.done.tap('BuildTimePlugin', () => {
  console.log(`构建完成: ${(Date.now() - startTime) / 1000}s`);
});
```

### BundleSizeMonitorPlugin - 包体积监控

```js
compiler.hooks.done.tap('BundleSizeMonitorPlugin', (stats) => {
  Object.entries(stats.compilation.assets).forEach(([filename, source]) => {
    if (source.size() > 500 * 1024) {
      console.warn(`⚠️ ${filename} 太大了!`);
    }
  });
});
```

---

## 📊 配置关系图

```
                    ┌─────────────────┐
                    │  package.json   │
                    │  (browserslist) │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │babel.config │  │ tsconfig.   │  │ postcss.    │
     │    .js      │  │    json     │  │ config.mjs  │
     └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ webpack.common  │
                    │      .js        │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     ┌─────────────────┐           ┌─────────────────┐
     │  webpack.dev.js │           │ webpack.prod.js │
     │  (开发环境)      │           │  (生产环境)      │
     └─────────────────┘           └─────────────────┘
```

---

## 🎯 最佳实践总结

### 开发环境优化

- ✅ 使用 `eval-source-map` 快速调试
- ✅ 启用 React Fast Refresh 保持状态
- ✅ 使用 `style-loader` 加速 CSS HMR
- ✅ 配置 Proxy 解决跨域
- ✅ 代码分割：开发环境也启用，保持与生产一致

### 生产环境优化

- ✅ `contenthash` 命名：内容变化才改 hash
- ✅ TerserPlugin：压缩 + 移除 console
- ✅ MiniCssExtractPlugin：CSS 单独文件
- ✅ Tree Shaking：移除未使用代码
- ✅ 代码分割：React 单独打包，长期缓存

### 通用优化（开发 + 生产）

- ✅ **代码分割**：在 `webpack.common.js` 中统一配置
- ✅ **运行时提取**：`runtimeChunk: 'single'` 优化缓存
- ✅ 文件系统缓存：二次构建提速
- ✅ `ForkTsCheckerWebpackPlugin`：TS 检查不阻塞
- ✅ Babel `transform-runtime`：复用 helper
- ✅ `useBuiltIns: 'usage'`：按需 polyfill

---

## 🚀 常用命令速查

```bash
# 开发
pnpm start              # 启动开发服务器

# 构建
pnpm build              # 生产构建
pnpm build:analyze      # 构建 + 性能分析

# 清理
pnpm clean              # 清理缓存和产物
pnpm clean:all          # 清理所有（包括 node_modules）
```
