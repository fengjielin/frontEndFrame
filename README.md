# vue-demo

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

###  查看当前vue项目的webpack配置内容

```schell
vue inspect > output.js
npx vue-cli-service inspect --mode development >> webpack.config.development.js
npx vue-cli-service inspect --mode production >> webpack.config.production.js
```

### configureWebpack、chainWebpack配置vue.config.js

[configureWebpack、chainWebpack配置vue.config.js](https://blog.csdn.net/weixin_43443341/article/details/108865372)

[vue-cli中chainWebpack的使用](https://segmentfault.com/a/1190000019920162)

[vue-cli4的使用与配置](https://blog.csdn.net/xiao1215fei/article/details/108502382)

## GIT 常用操作

```shell
git init   #初始化仓库
git clone github上仓库的地址  #拷贝一份远程仓库，也就是下载一个项目
git add .  #添加文件到暂存区
git status  #查看仓库当前的状态，显示有变更的文件
git commit -m "提交信息"  #提交暂存区到本地仓库
git push -u origin main  #上传远程代码并合并
git pull -u origin main  #下载远程代码并合并
```

## Eslint

[校验规则](https://eslint.bootcss.com/docs/rules/)

---

## 框架文档

### 介绍

本框架使用vue-cli搭建，用过更加清晰的项目结构，vue-cli内部对webpack封装了默认的配置，如果不想使用默认webpack配置，就需要在根路径上创建一个vue.config.js进行自定义的配置

### 目录结构

```
|-- frontEndFrame
    |-- .browserslistrc				# 指定浏览器范围	" >1%" ：超过1%人使用的浏览器；“last 2 versions” : 所有浏览器兼容到最后两个版本； “not dead” :	去掉不再维护更新的版本
    |-- .editorconfig				# 不同编辑器遵循的一些文档风格 vscode需要下载插件，HBuilderX和WebStorm不要下载插件	https://editorconfig.org/
    |-- .env						# 全局环境变量	https://cli.vuejs.org/zh/guide/mode-and-env.html#模式
    |-- .env.development			# 开发环境变量
    |-- .env.production				# 生产环境变量
    |-- .eslintrc.js				# eslint 配置文件	https://eslint.bootcss.com/docs/rules/
    |-- .gitignore
    |-- .prettierrc.js				# 格式化代码配置	https://prettier.io/docs/en/options.html
    |-- babel.config.js				# babel 的配置文件	https://www.babeljs.cn/
    |-- package-lock.json
    |-- package.json
    |-- README.md
    |-- vue.config.js				# vue-cli 的配置文件
    |-- dist						# 打包文件夹
    |-- public
    |   |-- favicon.ico
    |   |-- index.html
    |-- src
        |-- App.vue
        |-- main.js
        |-- assets					# 静态资源
        |-- axios  					# 引入 axios
        |-- components				# 公用组件
        |-- libs					# 放了一些工具方法
        |-- plugins					# 引入 第三方库
        |-- router					# 引入 vue-router
        |-- store					# 引入 vuex
        |-- views

```

### 配置

对于vue.config.js的配置：

[configureWebpack、chainWebpack配置vue.config.js](https://blog.csdn.net/weixin_43443341/article/details/108865372)

[vue-cli中chainWebpack的使用](https://segmentfault.com/a/1190000019920162)

[vue-cli4的使用与配置](https://blog.csdn.net/xiao1215fei/article/details/108502382)

[vue-cli4配置vue.config.js](https://github.com/staven630/vue-cli4-config#base)

框架内已安装依赖：`vue-router`、`vuex`、`axios`、`iview` 这几个vue项目的依赖

开发依赖中安装了 `Eslint` , 开启了简单的校验规则，类似：未使用的变量不可存在、if语句的执行体不可为空等

配置了`babel-plugin-transform-remove-console`用于打包项目时自动去除console语句

[校验规则](https://eslint.bootcss.com/docs/rules/)

### 相比于之前使用的框架而言：

```
1、结构清晰了；
2、对于一些依赖进行了升级, 一些依赖进行了移除；
3、配置的简单代码校验；
4、通过vue-cli对于打包的默认配置，打包完成后的文件结构也更加清晰了，以前是混乱的；
5、开发时：
	- 热更新的完善，之前的框架，修改了css样式后需要刷新页面，才可以看到效果；
	- css引用的完善，之前的框架，在css中通过引用图片设置dom的背景图会报错，现在可以使用 `url("~@/assets/images/bg.jpg")`;
	- 可在浏览器的控制台中查看到css来自那个文件
```

### 原框架中未集成过来的内容：

```
1、密码校验相关；
2、系统授权相关
3、原使用的一些工具方法、库和组件；
```

### 可以继续优化的方面：

```
1、打包速度方面是否还可提高；
	- 路由懒加载
	- 配置DLLPlugin 和 DLLReferencePlugin，听说这东东可以通过拆分 bundles，以大大提高构建的速度
	- 配置externals 引入依赖包到 cdn
	- splitChunks，这个是单独打包第三方模块的，没有配置过，之后试一下
2、对于接口超时的判断和处理，是否加入token的机制；
3、...
```
