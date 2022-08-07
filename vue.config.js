const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    devServer:{
		port:9001,  // 端口号的配置
		// open:true   // 自动打开浏览器
	},
    pluginOptions: {
        electronBuilder: {
            // 在vue中能引入electron模块
            nodeIntegration: true,
        }
    }
})
