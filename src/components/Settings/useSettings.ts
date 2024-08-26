import { useStore } from '../../store'

export const useSettings = () => {
  const store = useStore()

  const modalTitle = ref('选项设置')

  const themeOptions = ref([
    { label: '白天', value: 1 }, { label: '黑夜', value: 2 }, { label: '自动', value: 3 }
  ])

  const activeTab = ref('theme')

  let selectedTheme = ref< 1 | 2 | 3>()
  
  const model= reactive({
    isShow: false,
    showCateToolList: store.showCateToolList,
    activeVal: store.activeVal
  })
  const rules = ref({
    showCateToolList: {
      required: false,
      message: '请选择默认展开的tab页',
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

  themeInit()


  return {
    activeTab,
    selectedTheme,
    themeOptions,
    modalTitle,
    model, rules, formItems,
    handleSettingConfirm,
    isDaytime,
    changeThemeAuto
  }
}