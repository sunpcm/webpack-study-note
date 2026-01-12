# Webpack Study Note

> 一个基于 Webpack 5 + React 19 + TypeScript 的前端工程化学习项目

## 📋 项目简介

这是一个用于学习和实践现代前端工程化的示例项目，涵盖了 Webpack 5 的核心配置、性能优化、开发体验提升等多个方面。

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

## ⚙️ 核心配置说明

### Webpack 配置架构
- **webpack.common.js**: 入口、解析规则、通用 Loader、基础插件
- **webpack.dev.js**: 开发服务器、HMR、source-map、React Fast Refresh
- **webpack.prod.js**: 代码压缩、CSS 提取、代码分割、缓存优化

### 代码分割策略
```javascript
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    react: {
      test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
      name: 'react-vendor',
      priority: 30,
    },
    libs: {
      // 其他第三方库
      name: 'libs-vendor',
      priority: 20,
    }
  }
}
```

### 开发服务器代理
支持多后端服务代理配置：
- `/api/datasets` → `http://localhost:8080`
- `/api/experiments` → `http://localhost:8081`

### 环境变量
通过 `.env.development` 和 `.env.production` 管理环境变量，使用 `process.env.XXX` 访问。

## 🔧 自定义 Webpack 插件

### BuildTimePlugin
统计构建耗时，区分首次构建和增量构建。

### BundleSizeMonitorPlugin
监控产物体积，超过 500KB 发出警告。

## 🎨 样式开发

项目使用 **Tailwind CSS v4**，支持：
- 原子化 CSS 类名
- 自定义主题变量（`@theme`）
- 自动 CSS 前缀添加

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary: #1e40af;
  --font-family-sans: "Inter", sans-serif;
}
```

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

1. **Webpack 5 新特性**: Asset Modules、持久化缓存、Module Federation
2. **Loader 原理**: babel-loader、css-loader、postcss-loader 链式处理
3. **Plugin 机制**: Tapable 钩子系统、Compiler/Compilation 生命周期
4. **性能优化**: 代码分割、Tree Shaking、缓存策略
5. **开发体验**: HMR、Fast Refresh、TypeScript 类型检查

## 📄 License

ISC
