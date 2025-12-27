const { merge }  = require('webpack-merge')
const common = require('webpack.common')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(common, {
	mode: 'production',
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, '..dist''),
		filename: '[name].[contenthash].js',
		clean: true,
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css'
		}),
	],
	module: {
		rules: [
			{
				test: /\.(css|scss)$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'scss-loader'
				]
			}
		]
	},
	optimization: {
		splitChunks: {
			chunks: 'all'
			// 默认情况下，Webpack 会把 node_modules 里的东西单独打包成 vendors
		}
	}
})