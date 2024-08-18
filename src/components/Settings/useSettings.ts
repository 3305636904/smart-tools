import { useStore } from '../../store'

export const useSettings = () => {
  const store = useStore()
  
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
    if (model.showCateToolList.indexOf(model.activeVal as number) !== -1) {
      model.isShow = false
      store.showCateToolList = model.showCateToolList
      store.activeVal = model.activeVal
    } else {
      window.$message.error('请选择默认展开的tab页')
    }
  }


  return {
    model, rules, formItems,
    handleSettingConfirm
  }
}