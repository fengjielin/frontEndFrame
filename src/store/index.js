import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userInfo: JSON.parse(sessionStorage.getItem("userInfo") || null),
    menus: JSON.parse(sessionStorage.getItem("menus") || "[]"),
    activeName: sessionStorage.getItem("activeName"),
  },
  mutations: {
    setMenus(state, data) {
      state.menus = data;
      sessionStorage.setItem("menus", JSON.stringify(data));
    },
    setUserInfo(state, data) {
      state.userInfo = data;
      sessionStorage.setItem("userInfo", JSON.stringify(data));
    },
    setActiveName(state, data) {
      state.activeName = data;
      sessionStorage.setItem("activeName", data);
    },
  },
  actions: {},
  modules: {},
});
