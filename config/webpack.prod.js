const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].[contenthash:8].js",
    clean: true,
	  assetModuleFilename: "assets/[hash:8][ext][query]",
  },
  performance: {
    hints: "warning",
    maxEntrypointSize: 1024000, // 1MB
    maxAssetSize: 512000,
  },
  plugins: [
    // 1. CSS 提取
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:8].css",
      chunkFilename: "css/[name].[contenthash:8].chunk.css",
    }),

    // 2. 构建分析（可选，方便定位体积问题）
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      reportFilename: "bundle-report.html",
      defaultSizes: "gzip", // 显示 gzip 后的大小
      generateStatsFile: false,
    }),

    // 3. Gzip 压缩（可选但推荐）
    // new CompressionPlugin({
    //   filename: "[path][base].gz",
    //   algorithm: "gzip",
    //   test: /\.(js|css|html|svg)$/,
    //   threshold: 10240, // 只有大于 10KB 的文件才压缩
    //   minRatio: 0.8, // 压缩率小于 80% 时不压缩
    //   deleteOriginalAssets: false, // 保留原文件
    // }),
  ],
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              // PostCSS 自动添加前缀
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              postcssOptions: {
                plugins: [
                  "@tailwindcss/postcss", 
                  "autoprefixer"
                ],
              },
            },
          }
        ],
      },
    ],
  },
  optimization: {
    // ✅ 启用最小化
    minimize: true,

    // ✅ JS 和 CSS 压缩配置
    minimizer: [
      // JS 压缩：保留默认 Terser
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 移除 console
            drop_debugger: true, // 移除 debugger
            pure_funcs: ["console.log"], // 移除指定的函数调用
          },
          format: {
            comments: false, // 移除注释
          },
          // 高并发压缩
          mangle: true,
        },
        extractComments: false, // 不单独提取注释文件
        parallel: true, // 并行处理
      }),

      // CSS 压缩
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true }, // 移除所有注释
              normalizeUnicode: false,
            },
          ],
        },
        parallel: true,
      }),
    ],
  },

  // ✅ 解析配置
  resolve: {
    symlinks: false, // 关闭 symlink 解析，提升性能
    cacheWithContext: false,
  },
});