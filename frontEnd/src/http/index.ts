import axios from 'axios'
import { requestCode } from '../utils/varbile'
import { toast } from '../utils/function'
import store from '@/redux/store'
import { push } from 'connected-react-router'
import tools from '@/utils'
axios.defaults.withCredentials = true;
axios.defaults.baseURL = '/api'
axios.interceptors.request.use(config => {
    if (localStorage.getItem('token')) {
        config.headers['accesstoken'] = localStorage.getItem('token');
    }
    return config
}, error => {
    return Promise.reject(error)
});

axios.interceptors.response.use((response) => {
    let token = response.headers.accesstoken;
    if (token) {
        axios.defaults.headers.common['accesstoken'] = token;
    }
    if (response.status === 200) {
    }
    return response
}, (error) => {
    return Promise.reject(error)
});

export const resquest = (method: string, url: string, data: any = {},responseType:string= 'json'): Promise<any> => {
    return new Promise((resolve) => {
        let params = {};
        if (method === 'get') {
            Object.keys(data).forEach((key) => (data[key] === null || data[key] === '' || data[key]===undefined) && delete data[key]); //删除为空的字符串
            params = data;
        }
        console.log('data', data)
        let option = {
            method, url, params, ...data,
            headers:{
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            transformRequest: [
                function (data:any) {
                   let ret = ''
                   for (let it in data) {
                      ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                   }
                   ret = ret.substring(0, ret.lastIndexOf('&'));
                   return ret
                }
            ],
            responseType
        };
        axios.request(option).then(res => {
            if (res.data.code === requestCode.successCode) {
                resolve(res.data);
            } else if (res.data.code === requestCode.noLoginTokenCode) {
                store.dispatch(push('/login'));
            } else {
                toast(requestCode.failedCode, res.data.mes);
                resolve(res.data);
            }
        }, error => {
            error.response && error.response.data ? toast(requestCode.failedCode, error.response.data.mes):toast(requestCode.failedCode, '请求出错，请重试');
        }).catch((err) => {
            toast(requestCode.serverErrorCode, '服务异常');
        })
    })
}
