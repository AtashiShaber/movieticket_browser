// src/utils/request.ts
import axios, {
    type InternalAxiosRequestConfig,
    type AxiosResponse,
    type AxiosError
} from "axios";
import router from "../router";

const request = axios.create({
    baseURL: 'http://localhost:8090',
    timeout: 3000,
    method: 'post',
    withCredentials: true
});

// 请求拦截器
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token')
        const adminToken = localStorage.getItem('adminToken');
        if (token !== null) {
            config.headers = config.headers || {};
            config.headers.Authorization = "user:" + token;
        } else if (adminToken !== null) {
            config.headers = config.headers || {};
            config.headers.Authorization = "admin:" + adminToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse) => {
        const newToken = response.headers['new-token'];
        if (newToken) {
            const isAdmin = localStorage.getItem('adminToken') !== null;
            isAdmin
                ? localStorage.setItem('adminToken', newToken)
                : localStorage.setItem('token', newToken);
        }

        const { code, message, data } = response.data;
        if (code != 2000) {
            return Promise.reject(message);
        }
        return data;
    },
    (error: AxiosError) => {
        console.log(error)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('adminToken');
            router.push('/login').then(() => {
                // 路由跳转成功后执行
            }).catch((error) => {
                if (error.name !== 'NavigationDuplicated') { // 忽略重复导航错误
                    console.error('路由跳转失败:', error)
                }
            })
        }
        return Promise.reject(error);
    }
);

export default request;
