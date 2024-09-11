import { fetch, Body } from '@tauri-apps/api/http';

import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";

import { getToken } from '../utils/auth'

import { tansParams } from '../utils/index'

const { VITE_APP_API_URL } = import.meta.env

export {
  VITE_APP_API_URL
}

export {
  fetch,
  Body,
} from '@tauri-apps/api/http';

export const generateFileInfo = (arrayBuffer: ArrayBuffer, mime: string, fileName: string) => {
  return {
    file: new Uint8Array(arrayBuffer),
    mime,
    fileName,
  };
};

export const postPromise = (url: string, data: any, headers: any = {}): Promise<resType> => {
  return new Promise((resolve, reject) => {
    let t:any
    let body: any = Body.json(data)
    if (headers.isFile) {
      body = data
      // console.log('body: ', body?.get('file'))
    }
    // console.log('url: ', `${VITE_APP_API_URL}${url}`)
    fetch(`${VITE_APP_API_URL}${url}`, {
      method: 'POST',
      // body: Body.json({requestBizTaskList: data}),
      headers,
      body
    }).then(res => {
      if (res.status === 200) {
        const result = (res.data  as resType)
        if (result.code !== 0) {
          t = setTimeout(() => {
            clearTimeout(t)
            reject(result)
          }, 800)
        }
        resolve(result)
      }else {
        t = setTimeout(() => {
          clearTimeout(t)
          console.error(res)
          reject(res.data as resType)
        }, 800)
      }
    }).catch(err => {
      t = setTimeout(() => {
        console.error(err)
        clearTimeout(t)
        reject(err as resType)
      }, 800)
    })
  })
}

export const axiosServie = () => {
  // Axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
  // 创建axios实例
  const service = Axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    baseURL: import.meta.env.VITE_APP_BASE_API,
    // 超时
    timeout: 10000
  })

  // request拦截器
  service.interceptors.request.use(config => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
    if (getToken() && !isToken) {
      config.headers['biz-user'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        // data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        data: config.data,
        time: new Date().getTime()
      }
      const requestSize = Object.keys(JSON.stringify(requestObj)).length; // 请求数据大小
      const limitSize = 5 * 1024 * 1024; // 限制存放数据5M
      if (requestSize >= limitSize) {
        console.warn(`[${config.url}]: ` + '请求数据大小超出允许的5M限制，无法进行防重复提交验证。')
        return config;
      }
    }
    return config
  }, error => {
      console.log(error)
      Promise.reject(error)
  })

  const errorCode: Record<string, string> = {
    '401': '认证失败，无法访问系统资源',
    '403': '当前操作没有权限',
    '404': '访问资源不存在',
    'default': '系统未知错误，请反馈给管理员'
  }

  // 响应拦截器
  service.interceptors.response.use(res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default']
    // 二进制数据则直接返回
    if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
      return res.data
    }
    if (code === 401) {
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
    } else if (code === 500) {
      window.$message.error(msg)
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      window.$message.warning(msg)
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      window.$notification.error({ title: msg })
      return Promise.reject('error')
    } else {
      return  Promise.resolve(res.data as resType)
    }
  },
  error => {
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    window.$message.error(message, { duration: 5 * 1000 })
    return Promise.reject(error)
  }
  )

  return {
    service
  }
}