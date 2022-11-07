const path = require("path");
const resolve = (dir) => path.join(__dirname, dir);

const { NODE_ENV, VUE_APP_TITLE = "" } = process.env;
const IS_DEV = NODE_ENV === "development";
const IS_PROD = NODE_ENV === "production";
console.log(NODE_ENV, VUE_APP_TITLE);

module.exports = {
  publicPath: "./", // 公共路径
  outputDir: "dist", // 输出文件目录
  assetsDir: "assets", // 静态资源存放的文件夹(相对于ouputDir)
  lintOnSave: false, // eslint-loader 是否在保存的时候检查
  runtimeCompiler: false,
  productionSourceMap: !IS_PROD, // 在生产环境会生产.map文件 设置false可以减小dist文件大小，加速构建
  devServer: {
    open: false, // npm run serve后自动打开页面
    host: "127.0.0.1",
    port: 8080,
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:3000", // 目标地址
    //     changeOrigin: true, //允许跨域
    //     ws: false, // websocket
    //     pathRewrite: {
    //       "/api": "",
    //     },
    //   },
    // },
  },
  css: {
    extract: IS_PROD, // 用于控制是否强制分离vue 组件内的css
    sourceMap: IS_DEV, //查看CSS属于哪个css文件
  },
  configureWebpack: (config) => {
    config.devtool = IS_DEV ? "source-map" : false; // 控制源代码在浏览器控制台中是否可见
  },
  chainWebpack: (config) => {
    // 修复HMR
    config.resolve.symlinks(true);
    config.plugin("html").tap((args) => {
      args[0].title = VUE_APP_TITLE;
      return args;
    });
    // 添加别名
    config.resolve.alias
      .set("vue$", "vue/dist/vue.esm.js")
      .set("@", resolve("src"))
      .set("@assets", resolve("src/assets"))
      .set("@components", resolve("src/components"));
  },
};
