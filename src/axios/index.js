import axios from "axios";
// import qs from "qs";
import config from "./config";

const serviceAxios = axios.create({
  baseURL: config.baseURL,
  timeout: 10000,
  withCredentials: true, //设置允许携带cookie,默认不让携带
});

// 请求拦截
serviceAxios.interceptors.request.use(
  (config) => {
    // if (config.method === "post") {
    //   config.data = qs.stringify(config.data);
    // }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// 响应拦截
serviceAxios.interceptors.response.use(
  (res) => {
    return res;
  },
  (error) => {
    Promise.reject(error);
  }
);

export default serviceAxios;
