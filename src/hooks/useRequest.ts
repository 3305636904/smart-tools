// import { fetch, Body } from '@tauri-apps/api/http';

import { getToken } from '../utils/auth'
import { tansParams } from '../utils'
import Axios from 'axios'

const {  VITE_APP_API_URL } = import.meta.env
export {
  getToken,
  VITE_APP_API_URL
}
// export {
//   fetch,
//   Body,
// } from '@tauri-apps/api/http';

export const generateFileInfo = (arrayBuffer: ArrayBuffer, mime: string, fileName: string) => {
  return {
    file: new Uint8Array(arrayBuffer),
    mime,
    fileName,
  };
};

export const fetchPostPromise = (url: string, data: any, headers: any = {}): Promise<resType> => {
  return new Promise((resolve, reject) => {
//     let t:any
//     let body: any = Body.json(data)
//     // if (headers.isFile) {
//     //   body = data
//     // }
//     fetch(`${VITE_APP_API_URL}${url}`, {
//       method: 'POST',
//       // body: Body.json({requestBizTaskList: data}),
//       headers,
//       body
//     }).then(res => {
//       if (res.status === 200) {
//         console.log(res)
//         const result = (res.data  as resType)
//         if (result.code !== 0) {
//           reject(result)
//         }
//         resolve(result)
//       }else {
//         reject(res.data as resType)
//       }
//     }).catch(err => {
//       reject(err as resType)
//     })
  })
}

/**
 * webview 套壳 跨域，！！！
 */
const { MODE, VITE_APP_IP, VITE_APP_PORT } = import.meta.env
const isProd = MODE === 'production'
// const baseURL = isProd ? `${}` : VITE_APP_BASE_API
// const baseURL = `${VITE_APP_IP}:${VITE_APP_PORT}${VITE_APP_BASE_API}`
// console.log(`baseURL: ${baseURL}`)
export const axiosServie = () => {
  // 由于Tauri应用本质上是运行在一个沙箱环境中的Web页面，因此直接使用axios进行跨域请求可能会受到限制。不过，可以通过设置请求头尝试解决部分跨域问题
  Axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
  // 创建axios实例
  const service = Axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    baseURL: VITE_APP_API_URL,
    // 超时
    timeout: 10000
  })

  // request拦截器
  service.interceptors.request.use(config => {
    // 是否需要设置 token
    // const isToken = (config.headers || {}).isToken === false
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
    const loginUid = window.utools.dbStorage.getItem('loginUid')
    if (getToken()) {
      // config.headers['biz-user'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    config.headers['biz-user'] = loginUid // 让每个请求携带自定义token 请根据实际情况自行修改
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