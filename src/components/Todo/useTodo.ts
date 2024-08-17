import { useStore } from '../../store'

export function useTodoAddForm() {
  const store = useStore()
  const addTodInfo = reactive({
    todoInfo: <todoInfoType>{
      isShow: false,
      id: '',
      content: '',
      level: ['4'],
      type: [],
      attachMents: [],
      memo: '',
      isCompleted: false
    },
    rules: ref({
      content: {
        required: true,
        message: '请输入待办事项内容',
        trigger: 'blur'
      }
    }),
    formItems: ref([
      { type: `textarea`, label: `待办事项`, path: `content`, autosize: { minRows: 1 } },
      { type: `radioGroup`, label: `重要程度`, path: `level`, options: store.levelOptions },
      { type: `select`, label: `事项分类`, path: `type`, options: store.typeOptions, multiple: true },
      { type: `custom`, label: `相关附件`, path: `attachMents` },
      { label: `备注`, path: `memo`, type: 'textarea', autosize: { minRows: 3 } },
    ])
  })

  return {
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
      updatedAt: '' // 更新时间
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
    formItems: ref([
      { label: `待办事项`, path: `content`, type: 'textarea', autosize: { minRows: 1 } },
      { label: `重要程度`, path: `level`, type: 'radioGroup', options: store.levelOptions },
      { label: `事项分类`, path: `type`, type: 'select', multiple: true, options: store.typeOptions },
      { label: `创建时间`, path: `createdAt`, type: 'custom' },
      { label: `上次修改时间`, path: `updatedAt`, type: 'custom' },
      { label: `是否完成`, path: `isCompleted`, type: 'switch' },
      { label: `相关附件`, path: `attachMents`, type: 'custom' },
      { label: `备注`, path: `memo`, type: 'textarea', autosize: { minRows: 3 } },
      { label: `已花费时间`, path: `spendDuration`, type: 'custom' },
    ])
  })

  return {
    todoInfo: addTodInfo.todoInfo,
    rules: addTodInfo.rules,
    formItems: addTodInfo.formItems,
  }
}