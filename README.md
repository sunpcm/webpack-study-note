# Webpack Study Note

> 一个基于 Webpack 5 + React 19 + TypeScript 的现代化前端工程配置示例

## 📋 项目简介

这是一个生产级别的 Webpack 配置示例项目，展示了现代前端工程化的完整实践，包括：
- ✅ **完整的构建配置**：开发/生产环境分离，代码分割，持久化缓存
- ✅ **极致的开发体验**：React Fast Refresh、HMR、代理配置
- ✅ **全面的性能优化**：代码压缩、Tree Shaking、按需加载
- ✅ **详细的配置文档**：每个配置项都有原理解析（见 [WEBPACK_CONFIG_GUIDE.md](WEBPACK_CONFIG_GUIDE.md)）

## 🛠 技术栈

### 核心框架
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Webpack | 5.x | 模块打包工具 |

### 样式方案
| 技术 | 版本 | 说明 |
|------|------|------|
| Tailwind CSS | 4.x | 原子化 CSS 框架 |
| PostCSS | 8.x | CSS 后处理器 |
| Autoprefixer | 10.x | 自动添加浏览器前缀 |

### 构建工具链
| 技术 | 说明 |
|------|------|
| Babel | JS/TS/JSX 编译，支持 polyfill |
| pnpm | 高效的包管理器 |
| cross-env | 跨平台环境变量设置 |

### 开发体验
| 技术 | 说明 |
|------|------|
| React Fast Refresh | React 热更新（保持组件状态） |
| Fork TS Checker | 独立进程进行 TypeScript 类型检查 |
| dotenv-webpack | 环境变量管理 |

### 性能优化
| 技术 | 说明 |
|------|------|
| TerserPlugin | JS 压缩（移除 console、debugger） |
| CssMinimizerPlugin | CSS 压缩 |
| MiniCssExtractPlugin | CSS 提取为独立文件 |
| BundleAnalyzerPlugin | 打包体积分析 |
| SpeedMeasurePlugin | 构建速度分析 |

## 📁 项目结构

```
webpack-study-note/
├── build/                    # Webpack 配置目录
│   ├── webpack.common.js     # 公共配置
│   ├── webpack.dev.js        # 开发环境配置
│   ├── webpack.prod.js       # 生产环境配置
│   └── plugins/              # 自定义插件
│       ├── build-time-plugin.js        # 构建耗时统计
│       └── bundle-size-monitor-plugin.js # 产物体积监控
├── public/
│   └── index.html            # HTML 模板
├── src/
│   ├── index.tsx             # 入口文件
│   ├── index.css             # 全局样式（Tailwind 入口）
│   ├── App.tsx               # 根组件
│   └── utils/                # 工具函数
├── babel.config.js           # Babel 配置
├── postcss.config.mjs        # PostCSS 配置
├── tsconfig.json             # TypeScript 配置
└── package.json
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 10

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm start
```
访问 http://localhost:3000

### 生产构建
```bash
pnpm build
```

### 构建并分析
```bash
pnpm build:analyze
```
生成 `dist/bundle-report.html` 查看打包分析报告

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm start` | 启动开发服务器（HMR） |
| `pnpm build` | 生产环境构建 |
| `pnpm build:dev` | 开发模式构建（不压缩） |
| `pnpm build:analyze` | 构建并生成性能分析报告 |
| `pnpm clean` | 清理 dist 和缓存 |
| `pnpm clean:all` | 清理所有（含 node_modules） |

## ⚙️ 核心特性

### 🏗️ 构建配置

**三层配置架构：**
- **webpack.common.js**：通用配置（入口、解析、Loader、插件、代码分割）
- **webpack.dev.js**：开发配置（HMR、DevServer、代理、Fast Refresh）
- **webpack.prod.js**：生产配置（压缩、CSS 提取、性能优化）

**代码分割策略：**
```javascript
optimization: {
  runtimeChunk: 'single',  // 运行时代码单独提取
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
        name: 'react-vendor',
        priority: 10,
      },
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendor',
        priority: 5,
      },
      common: {
        minChunks: 2,
        priority: 1,
      }
    }
  }
}
```

**打包结果示例：**
```
dist/
  ├── runtime.a1b2c3d4.js (10KB)        # Webpack 运行时
  ├── react-vendor.e5f6g7h8.js (800KB)  # React 库（长期缓存）
  ├── vendor.i9j0k1l2.js (600KB)        # 其他第三方库
  ├── common.m3n4o5p6.js (100KB)        # 公共业务代码
  └── main.q7r8s9t0.js (500KB)          # 页面特有代码
```

---

### ⚡ 性能优化

| 优化项 | 配置 | 效果 |
|--------|------|------|
| **持久化缓存** | `cache: { type: 'filesystem' }` | 二次构建提速 90% |
| **Babel 缓存** | `cacheDirectory: true` | 提速 50% |
| **TS 独立检查** | `ForkTsCheckerWebpackPlugin` | 不阻塞构建 |
| **代码压缩** | `TerserPlugin` + `CssMinimizerPlugin` | 体积减少 70% |
| **Tree Shaking** | `modules: false` + `sideEffects` | 移除未使用代码 |
| **按需 Polyfill** | `useBuiltIns: 'usage'` | 只引入需要的 |

**构建性能对比：**

| 场景 | 无优化 | 优化后 | 提升 |
|------|--------|--------|------|
| 首次构建 | 30s | 20s | 33% ⚡ |
| 二次构建 | 30s | 3s | 90% ⚡⚡⚡ |
| HMR 更新 | 3s | 0.5s | 83% ⚡⚡ |

---

### 🔥 开发体验

**React Fast Refresh：**
- 修改组件代码后，状态保持不丢失
- 无需手动刷新页面
- 配合 HMR 实现最佳开发体验

**开发服务器代理：**
```javascript
proxy: [
  {
    context: ['/api/datasets'],
    target: 'http://localhost:8080',
    changeOrigin: true,
    pathRewrite: { '^/api/datasets': '' },
  },
  {
    context: ['/api/experiments'],
    target: 'http://localhost:8081',
    changeOrigin: true,
    pathRewrite: { '^/api/experiments': '' },
  }
]
```

**环境变量管理：**
```bash
# .env.development
REACT_APP_API_URL=http://localhost:8080
REACT_APP_DEBUG=true

# .env.production
REACT_APP_API_URL=https://api.production.com
REACT_APP_DEBUG=false
```

---

### 🎨 样式方案

**Tailwind CSS v4：**
- 原子化 CSS 类名
- 自定义主题变量
- PostCSS 自动添加浏览器前缀

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary: #1e40af;
  --font-family-sans: "Inter", sans-serif;
}
```

**开发 vs 生产 CSS 处理：**
- **开发**：`style-loader`（注入 `<style>` 标签，HMR 快）
- **生产**：`MiniCssExtractPlugin`（提取独立文件，可缓存）

## 📊 浏览器兼容性

```json
"browserslist": [
  "> 0.5%",
  "last 2 versions",
  "not dead",
  "not IE 11",
  "iOS >= 10",
  "Android >= 6"
]
```

## 📚 学习要点

### 1. Webpack 5 核心特性
- ✅ **Asset Modules**：内置资源模块类型（替代 file-loader/url-loader）
- ✅ **持久化缓存**：`cache: { type: 'filesystem' }` 提速 90%
- ✅ **代码分割**：`splitChunks` 优化缓存策略
- ✅ **Tree Shaking**：移除未使用的代码

### 2. Loader 工作原理
```
.tsx 文件 → babel-loader (编译) → JS 代码
.css 文件 → postcss-loader (Tailwind) → css-loader (处理 import) → style-loader (注入 DOM)
```

### 3. Plugin 开发
- **Tapable 钩子系统**：Webpack 的事件流机制
- **Compiler 生命周期**：`run`、`compile`、`done` 等钩子
- **自定义插件示例**：`BuildTimePlugin`、`BundleSizeMonitorPlugin`

### 4. 性能优化技巧
- 🎯 **代码分割**：React 单独打包，长期缓存
- 🎯 **按需加载**：`React.lazy` + `Suspense`
- 🎯 **缓存策略**：`contenthash` 文件名 + 文件系统缓存
- 🎯 **压缩优化**：TerserPlugin（移除 console）+ CssMinimizerPlugin

### 5. 开发体验提升
- 🔥 **React Fast Refresh**：组件状态保持
- 🔥 **HMR（热模块替换）**：代码即时生效
- 🔥 **独立 TS 检查**：不阻塞构建
- 🔥 **代理配置**：解决开发时跨域问题

---

## 📖 详细文档

完整的配置解析请查看：[**WEBPACK_CONFIG_GUIDE.md**](WEBPACK_CONFIG_GUIDE.md)

文档包含：
- 📦 每个配置项的工作原理
- 🎯 代码分割的前后对比
- ⚡ 性能优化的量化数据
- 🔍 常见问题的深度解答
- 📚 最佳实践总结

---

## 🛠 技术选型说明

### 为什么选择这些技术？

| 技术 | 理由 |
|------|------|
| **pnpm** | 磁盘空间占用少，安装速度快（比 npm 快 2-3 倍） |
| **Babel + ForkTsChecker** | 比 ts-loader 快 50%，类型检查不阻塞构建 |
| **Tailwind CSS v4** | 原子化 CSS，配置更简洁，性能更好 |
| **React Fast Refresh** | 比传统 HMR 更智能，组件状态保持 |
| **filesystem 缓存** | Webpack 5 新特性，二次构建提速 90% |

---

## 🔧 自定义插件示例

项目包含两个自定义 Webpack 插件供学习参考：

### BuildTimePlugin
```javascript
// 统计构建耗时
compiler.hooks.run.tapAsync('BuildTimePlugin', (compiler, callback) => {
  startTime = Date.now();
  callback();
});

compiler.hooks.done.tap('BuildTimePlugin', () => {
  console.log(`构建完成: ${(Date.now() - startTime) / 1000}s`);
});
```

### BundleSizeMonitorPlugin
```javascript
// 监控产物体积
compiler.hooks.done.tap('BundleSizeMonitorPlugin', (stats) => {
  Object.entries(stats.compilation.assets).forEach(([filename, source]) => {
    if (source.size() > 500 * 1024) {
      console.warn(`⚠️ ${filename} 太大了!`);
    }
  });
});
```

## 📄 License

ISC
