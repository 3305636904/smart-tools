import Cookies from "js-cookie";

export const TokenKey = "x-token";

/** 获取`token` */
export function getToken(): string {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return Cookies.get(TokenKey) as string
}

export function setToken(cookieString: string) {
  Cookies.set(TokenKey, cookieString)
}

/** 删除`token`以及key值为`user-info`的localStorage信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};