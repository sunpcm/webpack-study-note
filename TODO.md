# 待办清单

- [ ] **清理 webpack 生产配置**
  - 修正 `build/webpack.prod.js` 中的引入路径、`output.path` 配置，以及 loader 名称，确保生产打包可用。
- [ ] **补齐缺少的 loader / plugin**
  - 安装并配置 `@svgr/webpack` 等在配置文件中引用却尚未安装的依赖，让 SVG 等资源处理流程正常。
- [ ] **改进 React 入口类型**
  - 在 `src/index.tsx` 中为 `document.getElementById('root')` 做安全的空值检查，并使用 `HTMLElement` 类型断言。
- [ ] **补充构建说明文档**
  - 在 README 中写明依赖安装、开发调试 (`pnpm start`) 与生产构建 (`pnpm build`) 的操作步骤。
- [ ] **添加基础测试**
  - 为核心 React 组件添加至少一个单元测试或渲染测试，为后续迭代提供回归保障。
