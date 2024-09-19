
import CryptoJS from "crypto-js";
import axios from "axios";

import { axiosServie } from '../hooks/useRequest'
import { setToken, getToken, removeToken } from './auth'

const { service } = axiosServie()

export const getUser = () => {
  return utools.getUser()
}

function handleParams(params) {
  var secretKey = "";
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((obj, key) => {
      obj[key] = params[key];
      return obj;
    }, {});
  const encodedParams = Object.keys(sortedParams)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");
  var hmacHash = CryptoJS.HmacSHA256(encodedParams, secretKey);
  return hmacHash.toString(CryptoJS.enc.Hex);
}

const setItem = (key, value, expires = 2592000000) => {
  let count = new Date().getTime() + expires;
  const obj = {
    value, // 需要缓存的数据
    expires: count, // 缓存有效期，毫秒为单位
  };
  utools.dbStorage.setItem(key, JSON.stringify(obj));
};


export function getUtoolToken() {
  utools.fetchUserServerTemporaryToken().then((res) => {
    const params = {
      plugin_id: "zgvcgslm",
      access_token: res.token,
      timestamp: Math.floor(new Date().getTime() / 1000),
    };
    params.sign = handleParams(params);
    axios
      .get("https://open.u-tools.cn/baseinfo", {
        params,
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "json",
      })
      .then(async (res1) => {
        const userInfo = res1.data.resource;
        const token = res1.data.resource.open_id;
        setItem("userInfo", JSON.stringify(userInfo));
        setItem("itoken", token);
        const nickname = res1.data.resource.nickname;
        const params = {
          userId: token,
          nickName: nickname
        };
        
        const createBizUser = `/bizTaskNoAuth/createBizUser`
        const getBizUser = `/bizTaskNoAuth/getBizUser`
        const currentToken = getToken()
        if (currentToken) removeToken()
        console.log('currentToken: ', currentToken)
      
        const registerFn = (cb = () => {}) => {
          service({ url: createBizUser, method: 'post', data: params }).then(res => {
            console.log('创建bizUser成功', res);
            service({ url: getBizUser, method: 'post', data: params }).then(res => {
              if (res.code === 0) {
                cb()
              }
            })
          })
        }
        const loginFn = (cb = () => {}) => {
          service({ url: getBizUser, method: 'post', data: params }).then(res => {
            if (res.code === 0) {
              localStorage.setItem('biz-user', JSON.stringify(store.loginBizUser))
              setToken(token)
              store.loginBizUser = token
              cb()
            }
          })
        }
        registerFn(() => {
          loginFn()
        })
      });
  });
}