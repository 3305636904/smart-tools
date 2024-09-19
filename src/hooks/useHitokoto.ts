import { ref, onMounted, onUnmounted } from 'vue'
// import { fetch } from '@tauri-apps/api/http';

import { axiosServie } from './useRequest'
import { AxiosResponse } from 'axios';
const { service } = axiosServie()

interface HitokotoResponse {
  hitokoto: string;
  from: string;
  from_who: string;
}

/**
 * @description 获取本地时间
 */
export function useHitokoto() {
  let timer: number
  const word = ref('')
  const from = ref('')
  const fromWho = ref('')

  // 更新时间
  const updateWord = async () => {
    // const fetchHitokoto = (): Promise<HitokotoResponse>  => 
    //   service.get<{hitokoto:string, from: string, from_who:string}>('https://v1.hitokoto.cn/?encode=json')
    const res:HitokotoResponse = await service.get('https://v1.hitokoto.cn/?encode=json')
    console.log('res: ', res)
    if (res.hitokoto) {
      word.value = res.hitokoto
    }
    if (res.from) {
      from.value = res.from
    }
    if (res.from_who) {
      fromWho.value = res.from_who
    }
  }

  updateWord()

  onMounted(() => {
    clearInterval(timer)
    timer = setInterval(() => updateWord(), 7000)
  })

  onUnmounted(() => {
    clearInterval(timer)
  })

  return {
    word,
    from,
    fromWho,
  }
}
