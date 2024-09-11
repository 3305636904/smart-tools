import { useStore } from '../store'

const getCateItemIndex = (cateLabel: string, itemLabel: string) => {
  const store = useStore()
  const cateIndex = store.data.findIndex((v) => v.label === cateLabel)
  const itemIndex = store.data[cateIndex].list.findIndex(
    (v) => v.label === itemLabel
  )
  return {
    cateIndex,
    itemIndex,
  }
}

/**
* 参数处理
* @param {*} params  参数
*/
export function tansParams(params: any): any {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
            let params = propName + '[' + key + ']';
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result
}

export { getCateItemIndex }
