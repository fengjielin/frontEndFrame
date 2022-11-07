import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './plugins/iview.js';
import './libs/protoMethod';
import './assets/css/common.css';
import * as $utils from './libs/utils';
import serviceAxios from './axios';
import qs from 'qs';

import { isPC } from '@/libs/utils';

import { JSEncrypt } from 'jsencrypt';
import md5 from 'js-md5';

Vue.config.productionTip = false;

Vue.prototype.$md5 = md5;
/* 密码多层加密 */
Vue.prototype.pwdMultilayerEncrypt = function (passwd) {
  //获取当前时间戳
  const nowTime = new Date().getTime();
  //尝试加密
  var encrypt = new JSEncrypt();
  //设置公钥
  encrypt.setPublicKey(this.publicKey);
  //对pwd进行MD5方式加密再进行RSA公钥加密
  return encrypt.encrypt(nowTime + this.$md5(passwd));
};
/* 密码单层加密 */
Vue.prototype.pwdEncrypt = function (passwd) {
  //获取当前时间戳
  const nowTime = new Date().getTime();
  //尝试加密
  var encrypt = new JSEncrypt();
  //设置公钥
  encrypt.setPublicKey(this.publicKey);
  //对pwd进行RSA公钥加密
  return encrypt.encrypt(nowTime + passwd);
};

Vue.prototype.$Message.config({ duration: 3 });
Vue.prototype.$utils = $utils;
Vue.prototype.axios = serviceAxios;
Vue.prototype.qs = (json) => {
  return qs.stringify(json);
};

Vue.prototype.checkAuth = function (authCode) {
  //获取用户操作功能权限
  let state = JSON.parse(sessionStorage.state);
  let userinfo = state.token;
  let data = userinfo.btns;
  let codeArray = [];
  data.forEach(function (o) {
    codeArray.push(o.menuNum);
  });
  return codeArray.some((_) => authCode.indexOf(_) > -1);
};

//RSA公钥
Vue.prototype.publicKey =
  'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdH\n' +
  'nzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ==';

Vue.prototype.interfaceUrl = 'http://proj.gzzjxx.cn/hybrid/';
Vue.prototype.interfaceUrl = 'http://120.238.175.104:88/teachingSys/';

router.beforeEach((to, from, next) => {
  /*
  全局前置导航守卫 -- 主要用来通过跳转或取消的方式守卫导航
  to: router即将进入的路由对象
  from: 当前路由即将离开的路由
  next: Function函数，一定药调用该方法来 resolve 这个钩子。
      执行效果依赖 next 方法对调用参数，进行管道中的一个钩子，
      如果执行完了，则导航的状态是 confirmed（确定的）；否则未false，终止导航；
  */
  console.log(' router.beforeEach ~ to.name', to.name);

  const IsPC = isPC();
  if (to.meta.title) {
    const { VUE_APP_TITLE = '' } = process.env;
    document.title = VUE_APP_TITLE + ' - ' + to.meta.title;
  }

  // 判断 跳转 一个不存在的路由时
  if (to.matched.length !== 0) {
    if (to.meta.requireAuth) {
      // 该路由需要登录
      let userInfo = store.state.userInfo;
      if (userInfo) {
        // 已登陆
        let loginTime = new Date();
        let oneHour = 3600000;
        if (new Date() - loginTime > oneHour) {
          sessionStorage.clear();
          let path = IsPC ? '/login' : '/mobileLogin';
          next({
            path: path,
            query: {
              redirect: to.fullPath,
            },
          });
        } else {
          next();
        }
      } else {
        // 未登录
        let path = isPC ? '/login' : '/mobileLogin';
        next({
          path: path,
          query: {
            redirect: to.fullPath,
          },
        });
      }
    } else {
      // 该路由无需登录
      next();
    }
  } else {
    next({ path: '/404' });
  }
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
