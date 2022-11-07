const { NODE_ENV } = process.env;
const IS_PROD = NODE_ENV === "production";

const plugins = [];
if (IS_PROD) {
  plugins.push("transform-remove-console"); // 生产环境中 去掉 console
}
module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins
};
