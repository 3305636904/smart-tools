import { useStore } from '../../store'
// import { fetchPostPromise, Body } from '../../hooks/useRequest'
import { axiosServie } from '../../hooks/useRequest'
import { setToken, removeToken, getToken } from '../../utils/auth'
import dayjs from 'dayjs'

// import {  VITE_APP_API_URL} from '../../hooks/useRequest'
const { service } = axiosServie()

// import { useDialog } from 'naive-ui'

// export {
//   Body
// }

export const useSettings = () => {
  const store = useStore()

  const modalTitle = ref('选项设置')

  const themeOptions = ref([
    { label: '白天', value: 1 }, { label: '黑夜', value: 2 }, { label: '自动', value: 3 }
  ])

  const activeTab = ref('theme')

  const activeSync = ref('login')

  const loading = ref(false)

  let selectedTheme = ref< 1 | 2 | 3>()
  
  const model= reactive({
    isShow: false,
    showCateToolList: store.showCateToolList,
    activeVal: store.activeVal
  })
  const rules = ref({
    showCateToolList: {
      required: false,
      message: '请选择默认展示的tab页',
      trigger: 'blur'
    },
    activeVal: {
      type: 'boolean',
      message: '请选择默认的tab页',
      trigger: 'blur'
    }
  })
  const formItems = ref([
    { label: `默认展开Tab页`, path: `showCateToolList`, type: 'select', multiple: true, options: [
      { label: '快捷网站', value: 1 }, { label: '待办纪要', value: 2 },
    ] },
    { label: `默认Tab页`, path: `activeVal`, type: 'radioGroup', options: [
      { label: '快捷网站', value: 1 }, { label: '待办纪要', value: 2 },
    ] },
  ])

  const userFormItems = ref([
    { type: `input`, label: `昵称`, path: `nickName` },
    { type: `input`, label: `用户标识`, path: `uid` },
    { type: `custom`, label: ` `, path: `operation` },
  ])
  const userForm = ref({
    nickName: '',
    uid: ''
  })
  const userRules = ref({
    uid: {
      required: true,
      message: '请输入用户标识',
      trigger: 'blur'
    }
  })

  const handleSettingConfirm = () => {
    if (activeTab.value === 'theme') {
      store.darkTheme = selectedTheme.value === 2
      localStorage.setItem('selectedTheme', JSON.stringify(selectedTheme.value))
    } else if (activeTab.value === 'todoSetting') {
      if (model.showCateToolList.indexOf(model.activeVal as number) !== -1) {
        model.isShow = false
        store.showCateToolList = model.showCateToolList
        store.activeVal = model.activeVal
      } else {
        window.$message.error('请选择默认展开的tab页')
      }
    }
  }

  function isDaytime() {
    const now = new Date();
    const hour = now.getHours();
  
    // 假设白天是6:00到18:00（小时制的6到18）
    return hour >= 6 && hour < 18;
  }

  const themeInit = () => {
    selectedTheme.value = JSON.parse(localStorage.getItem('selectedTheme') || '3')
    // if (selectedTheme.value === 3) {
    //   selectedTheme.value = store.darkTheme ? 2 : 1
    // }
  }

  const changeThemeAuto = () => {
    if (selectedTheme.value === 3) {
      store.darkTheme = !isDaytime()
    }
  }

  const createBizUser = `/bizTaskNoAuth/createBizUser`
  const getBizUser = `/bizTaskNoAuth/getBizUser`
  const getSysBizTaskList = `/bizTask/getSysBizTaskList`

  const getSysBizTaskListFn  = (cb = (res: resType) => {}) => {
    loading.value = true
    const getBizTaskFn = (): Promise<resType> => service({ url: getSysBizTaskList, method: 'post', data: { 'biz-user': store.loginBizUser } })
    getBizTaskFn().then(result => {
    // fetchPostPromise(getSysBizTaskList, null, { 'biz-user': store.loginBizUser }).then(result => {
      if (!store.todoData || store.todoData.length === 0) {
        store.todoData = []
      }
      store.todoData = result.data.list.map((v: paramsTodoType) => {
        v.isRomote = true
        if (v.ID) v.id = v.ID
        if (v.Content) v.content = v.Content
        if (v.CreatedAt) v.createdAt = v.CreatedAt
        if (v.UpdatedAt) v.updatedAt = v.UpdatedAt
        if (v.attachMents && typeof v.attachMents === 'string') {
          if ((v.attachMents as string).indexOf(';') !== -1) {
            v.attachMents = (v.attachMents as string).split(';')
          } else {
            v.attachMents = [(v.attachMents as string)]
          }
        } 
        if (v.type) v.type = [(v.type as string)]
        return v
      })
      cb(result)
      loading.value = false
    }).catch((err: any) => {
      console.error(err)
      window.$notification.error({
        title: '同步数据失败',
        content: err,
        duration: 3000,
      })
      loading.value = false
    })
  }

  let nRef
  const userLogin = () => {
    if (!userForm.value.uid) {
      window.$message.warning('请输入用户标识')
      return
    }
    loading.value = true
    const params = {userId: userForm.value.uid, nickName: userForm.value.nickName}
    // fetchPostPromise(getBizUser, params).then(res => {
    const loginFn = (): Promise<resType> => service({ url: getBizUser, method: 'post', data: {userId: userForm.value.uid, nickName: userForm.value.nickName} })
    loginFn().then(res => {
      if (res.code === 0) {
        window.$message.success(`登录成功。：${res.msg}`)
        loading.value = false
        localStorage.setItem('biz-user', JSON.stringify(store.loginBizUser))
        setToken(userForm.value.uid)
        store.loginBizUser = userForm.value.uid
        window.utools.dbStorage.setItem('loginUid', userForm.value.uid)
        window.utools.dbStorage.setItem('loginTime', new Date().getTime())
        const t = setTimeout(() => {
          getSysBizTaskListFn((res) => {
            if (res.code === 0) {
              window.$message.success(res.msg)
            } else {
              window.$message.error(res.msg)
            }
          })
          clearTimeout(t)
        }, 500)
      }
    }).catch((err: any) => {
      const errorMsg = err && Array.isArray(err) ? err.map(v => v.msg) : err.msg
      nRef = window.$notification.error({
        title: '登录失败!',
        content: errorMsg,
        onClose: () => nRef = null
      })
      loading.value = false
    })
  }

  const createNewUser = () => {
    if (!userForm.value.uid) {
      window.$message.warning('请输入用户标识')
      return
    }
    loading.value = true
    const registFn = (): Promise<resType> => service({ url: createBizUser, method: 'post', data: {userId: userForm.value.uid, nickName: userForm.value.nickName} })
    // const params = {userId: userForm.value.uid, nickName: userForm.value.nickName}
    registFn()
    // fetchPostPromise(createBizUser, params)
    .then(res => {
      if (res.code === 0) {
        window.$message.success(`注册成功：${res.msg}`)
        loading.value = false
        activeSync.value = 'login'
        userForm.value = { uid: '', nickName: '' }
      }
    }).catch((err: any) => {
      console.error(err)
      const errorMsg = err && Array.isArray(err) ? err.map(v => v.msg) : err.msg;
      nRef = window.$notification.error({
        title: '操作失败!',
        content: errorMsg,
        onClose: () => nRef = null
      })
      loading.value = false
    })
  }

  const logout = () => {
    store.loginBizUser = ''
    removeToken()
    localStorage.removeItem('biz-user')
    store.todoData = []
    utools.dbStorage.removeItem('loginUid')
  }

  const enSureSave2Server = () => {
    console.log('store: ', store)
    /**
     * 1、只同步已完成的数据，没有id的时候会重新生成id
     */
    // let completedData: paramsTodoType[] = store.todoData.filter(v => v.isCompleted).
    let completedData: paramsTodoType[] = store.todoData.
    map((todo, i) => {
      let returnTodo: any = todo
      if (!todo.id) {
        const newId = Date.now() + (Math.floor(Math.random() * 10000) + i)
        returnTodo.ID = newId
        returnTodo.id = newId
      }
      if (todo.attachMents && Array.isArray(todo.attachMents) && todo.attachMents.length > 0) returnTodo.attachMents = todo.attachMents.map(v => {
        if (typeof v == 'object' && Object.hasOwn(v, 'url')) return v.url
        return v
      })
      if (todo.type && !Array.isArray(todo.type)) {
        returnTodo.type = [todo.type]
      }
      delete returnTodo.UpdatedAt
      return returnTodo
    })
    /**
     * 2、根据isRomote标识区分数据是否已经在服务器，isEdited标识是否修改过
     */
    let toSaveData: paramsTodoType[] = completedData.filter(v => !v.isRomote)
    let toUpdateData: paramsTodoType[] = completedData.filter(v => v.isRomote && v.isEdited).map(returnTodo => {
      if (returnTodo.updatedAt) {
        // 兼容时间格式 需要是 ISO 8601 格式
        returnTodo.updatedAt = dayjs(returnTodo.updatedAt).format('YYYY-MM-DDTHH:mm:ssZ')
      }
      return returnTodo
    })
    let toDelDataIds  = store.delRemoteTodoData
    const saveUrl = `/bizTask/createBatchBizTask`
    const updateUrl = `/bizTask/updateBatchBizTask`
    const deleteUrl = `/bizTask/delBatchBizTask`
  
    console.log(toSaveData.length, toUpdateData.length, toDelDataIds.length)
    console.log(toSaveData, toUpdateData, toDelDataIds)
    const promiseList = []
    if (toSaveData.length === 0 && toUpdateData.length === 0 && toDelDataIds.length === 0) {
      getSysBizTaskListFn()
      window.$message.info(`当前数据已经是最新状态。`)
      return
    }
    if (toSaveData.length > 0) {
      const params = { requestBizTaskList: toSaveData}
      // promiseList.push(fetchPostPromise(saveUrl, params, { 'biz-user': store.loginBizUser || '' }))
      promiseList.push(service({ url: saveUrl, method: 'POST', data: params }) as Promise<resType>)
    }
    if (toUpdateData.length > 0) {
      const params = {requestBizTaskList: toUpdateData}
      // promiseList.push(fetchPostPromise(updateUrl, params, { 'biz-user': store.loginBizUser || '' }))
      promiseList.push(service({ url: updateUrl, method: 'POST', data: params }) as Promise<resType>)
    }
    if (toDelDataIds.length > 0) {
      const params = { ids: toDelDataIds }
      // promiseList.push(fetchPostPromise(deleteUrl, params, { 'biz-user': store.loginBizUser || '' }))
      promiseList.push(service({ url: deleteUrl, method: 'POST', data: params }) as Promise<resType>)
    }
    let nRef
    Promise.all(promiseList).then(resArr => {
      if (resArr && Array.isArray(resArr) && resArr.length > 0) {
        nRef = window.$notification.success({
          title: '操作成功。',
          content: resArr.map(v => v?.msg).join(', '),
          onClose: () => nRef = null
        })
        store.delRemoteTodoData = []
        getSysBizTaskListFn()
      }
    }).catch(err => {
      console.error(err)
      const errorMsg = err && Array.isArray(err) ? err.map(v => v.msg) : err.msg;
      nRef = window.$notification.error({
        title: '操作失败。',
        content: errorMsg,
        onClose: () => nRef = null
      })
    })
  }

  const handleUpdateActiveSync = (val: string) => {
    userForm.value = { uid: '', nickName: '' }
    activeSync.value = val
  }

  themeInit()


  return {
    // fetchPostPromise,
    
    loading,
    activeTab,
    activeSync,
    selectedTheme,
    themeOptions,
    modalTitle,
    model, rules, formItems,
    userFormItems, userForm, userRules,

    handleSettingConfirm,
    isDaytime,
    changeThemeAuto,
    handleUpdateActiveSync,
    userLogin, createNewUser, logout,
    getSysBizTaskListFn,

    enSureSave2Server
  }
}