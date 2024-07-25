import { createPinia, defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'
import { saveWindowState, StateFlags } from 'tauri-plugin-window-state-api'
import { appWindow } from '@tauri-apps/api/window';
// import jsonData from './data.json'

// import {
//   WindowFullscreen,
//   WindowSetDarkTheme,
//   WindowSetLightTheme,
//   WindowUnfullscreen,
//   WindowSetBackgroundColour,
// } from '../../wailsjs/runtime/runtime'

export const store = createPinia()

export const useStore = defineStore('global', () => {
  const darkTheme = ref(false)
  const data = ref<Category[]>([])
  const cateToolList = ref<Record<string, any>>({ 1: `快捷网站`, 2: `待办纪要`, 3: `驼峰下划线相互转换` })
  const activeVal = ref(<Number | null>1)

  const todoData = ref<todoInfoType[]>([])
  const isTodoList = ref(<Boolean>false)

  const levelOptions = ref([
    { label: '重要或紧急', value: '1'},
    { label: '重要不紧急', value: '2'},
    { label: '紧急不重要', value: '3'},
    { label: '一般', value: '4'},
  ])

  const typeOptions = ref<Record<string, string>[]>([
    { label: '工作', value: '1'},
    { label: '日常', value: '2'},
    { label: '计划', value: '3'},
    { label: '其他', value: '4'},
  ])

  const itemModal = ref({
    isShow: false,
    title: '',
    formData: {
      label: '',
      value: '',
    },
    prevLabel: '', // 用来对比是否已修改和是否已存在
    prevValue: '', // 用来对比是否已修改
    cate: '', // 针对哪个分类
  })
  const cateModal = ref({
    isShow: false,
    title: '',
    label: '',
    prevLabel: '',
  })
  const searchModal = ref<{
    input: string
    result: Item[]
  }>({
    input: '',
    result: [],
  })
  const screenLocked = ref(false)
  const fullscreen = ref(false)
  // 加载数据
  const getData = async () => {
    try {
      let storageData
      const isWindow = 'tauri' in window
      if (isWindow) {
        // storageData = JSON.stringify(jsonData)
        // const jsonParse = JSON.parse(storageData)
        // data.value = jsonParse
      } else {
        data.value = JSON.parse(window.localStorage.getItem('data') as string)
        todoData.value = JSON.parse(window.localStorage.getItem('todoData') as string)
        activeVal.value = JSON.parse(window.localStorage.getItem('activeVal') as string)
        isTodoList.value = JSON.parse(window.localStorage.getItem('isTodoList') as string)
      }
    } catch (e) {}

  }
  const getDarkTheme = () => {
    const storageDarkTheme = window.localStorage.getItem('darkTheme')
    darkTheme.value = storageDarkTheme === 'true' ? true : false
  }
  saveWindowState(StateFlags.ALL)
  getData()
  getDarkTheme()
  watchEffect(() => {
    window.localStorage.setItem('data', JSON.stringify(data.value))
    window.localStorage.setItem('dataVersion', 'v1') // 如果以后数据结构发生改变可以用这个进行自动化升级
    window.localStorage.setItem('darkTheme', darkTheme.value ? 'true' : 'false')
    // darkTheme.value ? WindowSetDarkTheme() : WindowSetLightTheme()
    // darkTheme.value
    //   ? WindowSetBackgroundColour(24, 24, 28, 1)
    //   : WindowSetBackgroundColour(255, 255, 255, 1)
    appWindow.setFullscreen(fullscreen.value)
    // fullscreen.value ? WindowFullscreen() : WindowUnfullscreen()
  })

  watchEffect(() => {
    window.localStorage.setItem('todoData', JSON.stringify(todoData.value)) // 如果以后数据结构发生改变可以用这个进行自动化升级
  })
  watchEffect(() => {
    window.localStorage.setItem('activeVal', JSON.stringify(activeVal.value)) // 如果以后数据结构发生改变可以用这个进行自动化升级
  })
  watchEffect(() => {
    window.localStorage.setItem('isTodoList', JSON.stringify(isTodoList.value)) // 如果以后数据结构发生改变可以用这个进行自动化升级
  })
  return {
    darkTheme,
    itemModal,
    cateModal,
    searchModal,
    data,
    todoData,
    screenLocked,
    fullscreen,
    getData,

    levelOptions,
    typeOptions,

    cateToolList,
    activeVal,
    isTodoList
  }
})
