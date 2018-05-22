const path = require('path');
const webpack = require("webpack");
const glob = require("glob");
// 分离css
const extractTextPlugin = require("extract-text-webpack-plugin");
//消除冗余的css
const purifyCssWebpack = require("purifycss-webpack");
// html模板
const htmlWebpackPlugin = require("html-webpack-plugin");
//静态资源输出
const copyWebpackPlugin = require("copy-webpack-plugin");
const rules = require("./webpack.rules.conf.js");
// 获取html-webpack-plugin参数的方法
var getHtmlConfig = function (name, chunks) {
	return {
		template: `./src/pages/${name}/index.html`,
		filename: `${name}.html`,
		// favicon: './favicon.ico',
		// title: title,
		inject: true,
		hash: true, //开启hash  ?[hash]
		chunks: chunks,
		minify: process.env.NODE_ENV === "development" ? false : {
			removeComments: true, //移除HTML中的注释
			collapseWhitespace: true, //折叠空白区域 也就是压缩代码
			removeAttributeQuotes: true, //去除属性引用
		},
	};
};

module.exports = {
	entry: {
		// 多入口文件
		index: ['./src/pages/index/index.js', './src/js/tab.js'],
		login: './src/pages/login/index.js',
	},
	module: {
		rules: [...rules]
	},
	//将外部变量或者模块加载进来
	externals: {
		// 'jquery': 'window.jQuery'
	},
	plugins: [
		// 全局暴露统一入口
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			'window.jQuery': 'jquery',
		}),
		//静态资源输出
		new copyWebpackPlugin([{
			from: path.resolve(__dirname, "../src/assets"),
			to: './assets',
			ignore: ['.*']
		}]),
		// 分离css插件参数为提取出去的路径
		new extractTextPlugin({
			filename: 'css/[name].[hash:8].min.css',
		}),
		// 消除冗余的css代码
		new purifyCssWebpack({
			paths: glob.sync(path.join(__dirname, "../src/pages/*/*.html"))
		}),

	],
	// webpack4里面移除了commonChunksPulgin插件，放在了config.optimization里面,提取js， lib1名字可改
	optimization: {
		splitChunks: {
			cacheGroups: {
				jquery: {
					// test: /\.js$/,
					test: /[\\/]node_modules[\\/]jquery[\\/]/,
					chunks: "initial", //表示显示块的范围，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
					name: "jquery", //拆分出来块的名字(Chunk Names)，默认由块名和hash值自动生成；
					enforce: true,
				}
			}
		}
	},
}
//配置页面
const htmlArray = [{
		_html: 'index',
		title: '首页',
		chunks: ['jquery', 'index']
	},
	{
		_html: 'login',
		title: '登录',
		chunks: ['login']
	},
];

//自动生成html模板
htmlArray.forEach((element) => {
	module.exports.plugins.push(new htmlWebpackPlugin(getHtmlConfig(element._html, element.chunks)));
})