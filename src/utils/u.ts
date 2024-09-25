
// import CryptoJS from "crypto-js";
// import axios from "axios";
import utools from 'utools-api-types'

// import { axiosServie } from '../hooks/useRequest'
// import { setToken, getToken, removeToken } from './auth'

// const { service } = axiosServie()

// export const getUser = () => {
//   return utools.getUser()
// }

// function handleParams(params: Record<string, any>) {
//   var secretKey = "";
//   const sortedParams = Object.keys(params)
//     .sort()
//     .reduce((obj: Record<string, any>, key) => {
//       obj[key] = params[key];
//       return obj;
//     }, {});
//   const encodedParams = Object.keys(sortedParams)
//     .map(
//       (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
//     )
//     .join("&");
//   var hmacHash = CryptoJS.HmacSHA256(encodedParams, secretKey);
//   return hmacHash.toString(CryptoJS.enc.Hex);
// }

// const setItem = (key: string, value: any, expires = 2592000000) => {
//   let count = new Date().getTime() + expires;
//   const obj = {
//     value, // 需要缓存的数据
//     expires: count, // 缓存有效期，毫秒为单位
//   };
//   utools.dbStorage.setItem(key, JSON.stringify(obj));
// };


// export function getUtoolToken() {
//   utools.fetchUserServerTemporaryToken().then((res: any) => {
//     const params = {
//       plugin_id: "zgvcgslm",
//       access_token: res.token,
//       timestamp: Math.floor(new Date().getTime() / 1000),
//       sign: ''
//     };
//     params.sign = handleParams(params);
//     axios
//       .get("https://open.u-tools.cn/baseinfo", {
//         params,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         responseType: "json",
//       })
//       .then(async (res1) => {
//         const userInfo = res1.data.resource;
//         const token = res1.data.resource.open_id;
//         console.log('result: ', res1.data.resource)
//         const nickname = res1.data.resource.nickname;
//         const params = {
//           userId: token,
//           nickName: nickname
//         };
        
//         const createBizUser = `/bizTaskNoAuth/createBizUser`
//         const getBizUser = `/bizTaskNoAuth/getBizUser`
//         const currentToken = getToken()
//         if (currentToken) removeToken()
      
//         const registerFn = (cb = () => {}) => {
//           service({ url: createBizUser, method: 'post', data: params }).then(res => {
//             cb()
//           })
//         }
//         const loginFn = (cb = () => {}) => {
//           const getBizUserFn = (): Promise<resType> => service({ url: getBizUser, method: 'post', data: params })
//           getBizUserFn().then(res => {
//             if (res.code === 0) {
//               // localStorage.setItem('biz-user', JSON.stringify(store.loginBizUser))
//               setToken(token)
//               setItem("userInfo", JSON.stringify(userInfo));
//               setItem("itoken", token);
//               // store.loginBizUser = token
//               cb()
//             }
//           })
//         }
//         const loginUser = utools.dbStorage.getItem('userInfo')
//         loginFn()
//         // if (loginUser) loginFn()
//         // else registerFn(() => loginFn)
//       });
//   });
// }