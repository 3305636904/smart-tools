import { useStore } from '../../store'
import { postPromise } from '../../hooks/useRequest'

// import { useDialog } from 'naive-ui'

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

    console.log('hour: ', hour)
  
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

  const getSysBizTaskListFn  = (cb = () => {}) => {
    loading.value = true
    postPromise(getSysBizTaskList, {}, { 'biz-user': store.loginBizUser || '' }).then(result => {
      console.log('list: ', result.data.list)
      store.todoData = store.todoData.filter(v => !v.isCompleted).concat(result.data.list.map((v: paramsTodoType) => {
        v.isRomote = true
        if (v.ID) v.id = v.ID
        if (v.Content) v.content = v.Content
        if (v.CreatedAt) v.createdAt = v.CreatedAt
        if (v.UpdatedAt) v.updatedAt = v.UpdatedAt
        return v
      }))
      cb()
      loading.value = false
    }).catch(err => {
      console.error(err)
      window.$notification.error({
        title: '同步数据失败',
        content: err.msg,
        duration: 3000,
      })
      loading.value = false
    })
  }

  let nRef
  const userLogin = () => {
    loading.value = true
    postPromise(getBizUser, {userId: userForm.value.uid, nickName: userForm.value.nickName}).then(res => {
      if (res.code === 0) {
        window.$message.success(`登录成功。：${res.msg}`)
        store.loginBizUser = userForm.value.uid
        localStorage.setItem('biz-user', JSON.stringify(store.loginBizUser))
        loading.value = false
        userForm.value = { uid: '', nickName: '' }
        getSysBizTaskListFn()
      }
    }).catch(err => {
      console.error(err, err.msg)
      nRef = window.$notification.error({
        title: '登录失败!',
        content: JSON.stringify(err),
        onClose: () => nRef = null
      })
      loading.value = false
    })
  }

  const createNewUser = () => {
    loading.value = true
    console.log('userForm.value: ', userForm.value)
    postPromise(createBizUser,  {userId: userForm.value.uid, nickName: userForm.value.nickName})
    .then(res => {
      if (res.code === 0) {
        window.$message.success(`注册成功：${res.msg}`)
        loading.value = false
        activeSync.value = 'login'
        userForm.value = { uid: '', nickName: '' }
      }
    }).catch(err => {
      console.error(err)
      nRef = window.$notification.error({
        title: '操作失败!',
        content: JSON.stringify(err),
        onClose: () => nRef = null
      })
      loading.value = false
    })
  }

  const handleUpdateActiveSync = (val: string) => {
    userForm.value = { uid: '', nickName: '' }
    activeSync.value = val
  }

  themeInit()


  return {
    postPromise,
    
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
    userLogin, createNewUser,
    getSysBizTaskListFn
  }
}