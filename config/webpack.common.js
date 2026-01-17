const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const Dotenv = require('dotenv-webpack');
const os = require('os');
// const BuildTimePlugin = require('./plugins/build-time-plugin')
// const BundleSizeMonitorPlugin = require('./plugins/bundle-size-monitor-plugin')
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

const config = {
	// 1. 入口 (Entry)
    // Webpack 从这里开始分析依赖图 (Dependency Graph)
	entry: path.resolve(__dirname, '../src/index.tsx'),
  	// 2. 解析 (Resolve)
  	// 告诉 Webpack 如何寻找模块
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		alias: { '@': path.resolve(__dirname, '../src'),}
	},
	cache: process.env.CI ? false : {
  		type: 'filesystem', // 使用文件缓存
		cacheDirectory: path.resolve(__dirname, '../.webpack_cache'), // 缓存目录
		buildDependencies: {
            // 当这些文件变化时，缓存失效
            config: [__filename], // 当前配置文件变化时重新构建
        },
        // 缓存名称（多配置文件时区分）
        name: process.env.NODE_ENV,
	},
	// 模块规则 (Module Rules) - 也就是 Loaders
	module: {
		rules: [
			// thread-loader 的使用示例, 超过 200ms 的任务才适合用多进程
			{
				test: /\.(ts|js)x?$/,
				exclude: /node_modules/,
				use: [
			// 		{
			// 			loader: 'thread-loader',
			// 			options: {
			// 				workers: os.cpus().length - 1, // 留一个 CPU 给主线程
			// 				workerParallelJobs: 50, // 每个 worker 并行处理的任务数
			// // 			workerNodeArgs: ['--max-old-space-size=2048'], // 每个 worker 的内存限制, 通常不需要
			// 				poolTimeout: process.env.NODE_ENV === 'development' ? Infinity : 2000,
			// 			}
			// 		},
					{
						loader: 'babel-loader',
						options: {
							cacheDirectory: true, // 启用 Babel 缓存
							cacheCompression: false, // 关闭缓存压缩，提升性能
						}
					}
				]
			},
			// === 处理图片/字体资源 (Webpack 5 新特性) ===
      		// 以前需要 file-loader/url-loader，现在内置了
			
			// 针对 SVG 的特殊处理
			// 只写 type: 'asset'，Webpack 会把它当图片处理，你得到的永远是一个字符串路径，无法像组件那样修改 fill 颜色或 stroke 宽度。
			{
				test: /\.svg$/i,
				issuer: /\.[jt]sx?$/,
				use: ['@svgr/webpack'], // 把它转成组件
			},
			{
				test: /\.(png|jpg|jpeg|gif)$/i,
				type: 'asset'
			},
			// ✅ 可选：字体文件
			{
			test: /\.(woff|woff2|eot|ttf|otf)$/i,
			type: 'asset/resource',
			},
		]
	},
	plugins: [
		// 自动把打包后的 js/css 注入到 index.html
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../public/index.html'),
			filename: 'index.html',
			title: 'Webpack React TS', // 可以在 HTML 中引用 <%= htmlWebpackPlugin.options.title %>
		}),
		new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: path.resolve(__dirname, '../tsconfig.json'),
            },
        }),
		new Dotenv({
			// 智能选择：如果是 dev 环境，就读 .env.development
			// 如果是 prod 环境，就读 .env.production
			path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`), 
    	}),
		// new BuildTimePlugin(),
		// new BundleSizeMonitorPlugin()

	],
	  optimization: {
    	// 运行时代码单独提取
    	runtimeChunk: 'single',
		splitChunks: {
			chunks: "all",
			cacheGroups: {
				// React 单独打包
				react: {
					test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
					name: 'react-vendor',
					priority: 10,
					reuseExistingChunk: true,
				},
				
				// 其他第三方库
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendor',
					priority: 5,
					reuseExistingChunk: true,
				},
				
				// 公共代码
				common: {
					name: 'common',
					minChunks: 2,
					priority: 1,
					reuseExistingChunk: true,
				},
			},
		}
		
	}
}

const shouldMeasure = process.env.MEASURE === 'true' && process.env.NODE_ENV === 'production';
module.exports = shouldMeasure ? smp.wrap(config) : config;