import { fetch, Body } from '@tauri-apps/api/http';

const { VITE_APP_API_URL } = import.meta.env

export const postPromise = (url: string, data: any = {}, headers: any = {}): Promise<resType> => {
  return new Promise((resolve, reject) => {
    console.log('ur: ', `${VITE_APP_API_URL}${url}`)
    fetch(`${VITE_APP_API_URL}${url}`, {
      method: 'POST',
      // body: Body.json({requestBizTaskList: data}),
      headers,
      body: Body.json(data)
    }).then(res => {
      if (res.status === 200) {
        const result = (res.data  as resType)
        if (result.code !== 0) {
          reject(result)
        }
        resolve(result)
      }else {
        // console.error(res)
        reject(res)
      }
    }).catch(err => {
      // console.error(err)
      reject(err)
    })
  })
}