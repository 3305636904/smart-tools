import { useStore } from '../../store'

import { setToken, removeToken, getToken } from '../../utils/auth'

import { axiosServie,   VITE_APP_API_URL
} from '../../hooks/useRequest'
const { service } = axiosServie()

export {
  VITE_APP_API_URL,
  service
}

export function useTodoAddForm() {
  const store = useStore()
  const addTodInfo = reactive({
    todoInfo: <todoInfoType>{
      isShow: false,
      id: '',
      content: '',
      level: '4',
      type: [],
      attachMents: [],
      memo: '',
      isCompleted: false,
      isRomote: false
    },
    rules: ref({
      content: {
        required: true,
        message: '请输入待办事项内容',
        trigger: 'blur'
      }
    }),
    formItems: ref<any[]>([
      { span: 9, type: `textarea`, label: `待办事项`, path: `content`, autosize: { minRows: 1 } },
      { span: 9, type: `radioGroup`, label: `重要程度`, path: `level`, options: store.levelOptions },
      { span: 9, type: `select`, label: `事项分类`, path: `type`, options: store.typeOptions, multiple: true },
      // { span: 9, type: `custom`, label: `相关附件`, path: `attachMents` },
      { span: 9, label: `备注`, path: `memo`, type: 'textarea', autosize: { minRows: 3 } },
    ])
  })

  return {
    getToken,
    todoInfo: addTodInfo.todoInfo,
    rules: addTodInfo.rules,
    formItems: addTodInfo.formItems,
  }
}
export function useTodoEditForm() {
  const store = useStore()
  const addTodInfo = reactive({
    todoInfo: <todoInfoType>{
      isShow: false,
      content: '',
      level: null,
      type: '',
      id: '', // 随机生成的 id
      isCompleted: false, // 初始状态为 false，即未完成
      attachMents: [],
      memo: '',
      createdAt: '', // 创建时间
      updatedAt: '', // 更新时间
      isRomote: false
    },
    rules: ref({
      content: {
        required: true,
        message: '请输入待办事项内容',
        trigger: 'blur'
      },
      isCompleted: {
        type: 'boolean',
        message: '请确认是否已完成',
        trigger: 'blur'
      }
    }),
    formItems: ref<any[]>([
      { span: 9, label: `待办事项`, path: `content`, type: 'textarea', autosize: { minRows: 1 } },
      { span: 9, label: `重要程度`, path: `level`, type: 'radioGroup', options: store.levelOptions },
      { span: 9, label: `事项分类`, path: `type`, type: 'select', multiple: true, options: store.typeOptions },
      { span: 4, label: `创建时间`, path: `createdAt`, type: 'custom' },
      { span: 4, label: `上次修改时间`, path: `updatedAt`, type: 'custom' },
      { span: 9, label: `是否完成`, path: `isCompleted`, type: 'switch' },
      // { span: 9, label: `相关附件`, path: `attachMents`, type: 'custom' },
      { span: 9, label: `备注`, path: `memo`, type: 'textarea', autosize: { minRows: 3 } },
      { span: 9, label: `已花费时间`, path: `spendDuration`, type: 'custom' },
    ])
  })

  return {
    getToken,
    todoInfo: addTodInfo.todoInfo,
    rules: addTodInfo.rules,
    formItems: addTodInfo.formItems,
  }
}