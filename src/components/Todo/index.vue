<template>
  <n-layout class="h-75vh w-100vw pos-relative">
    <n-tooltip placement="left" trigger="hover">
      <template #trigger>
        <n-icon class="pos-absolute right-18 z-99 cursor-pointer" @click.stop="switchCondition">
          <IMaterialSymbolsTopPanelCloseOutline v-if="!hiddenCondition" class="text-18px" />
          <IMaterialSymbolsBottomPanelCloseOutlineSharp v-else class="text-18px" />
        </n-icon>
      </template>
      <n-p>{{ hiddenCondition ? '展开工具栏' : '收起工具栏' }}</n-p>
    </n-tooltip>
    <n-tooltip placement="left" trigger="hover">
      <template #trigger>
        <n-icon class="pos-absolute right-18 top-8 z-99 cursor-pointer" @click.stop="batchClick">
          <ICarbonBatchJob class="text-19px" v-if="!isBatch" />
          <IMdiCancelBoxMultiple class="text-19px" v-else />
        </n-icon>
      </template>
      <n-p>{{ isBatch ? '取消批量操作' : '批量操作' }}</n-p>
    </n-tooltip>
    <n-tooltip v-if="checkedTodos.length" placement="left" trigger="hover">
      <template #trigger>
        <n-icon class="pos-absolute right-18 top-16 z-99 cursor-pointer" @click.stop="handleDeleteTodo">
          <IMaterialSymbolsDeleteOutline class="text-19px" />
        </n-icon>
      </template>
      <n-p>批量删除</n-p>
    </n-tooltip>
    <n-tooltip placement="left" trigger="hover">
      <template #trigger>
        <n-icon :class="['pos-absolute', 'right-18', 'top-16', {'top-24': checkedTodos.length }, 'z-99', 'cursor-pointer']" @click.stop="exportShowTodoList">
          <i-line-md-upload-outline-loop class="text-19px" />
        </n-icon>
      </template>
      <n-p>{{ checkedTodos.length ? '导出勾选展示数据' : '导出展示数据' }}</n-p>
    </n-tooltip>
    <n-form
      :label-width="80"
      :rules="rules"
      size="small"
      v-if="!hiddenCondition"
    >
    <n-grid cols="1 s:3 m:4 l:5 xl:6" :x-gap="12" responsive="screen">
    <!-- <n-grid> -->
      <n-gi>
        <n-form-item label="待办内容关键字">
          <n-input v-model:value="searchTodoKey" class="text-left max-w-350px" placeholder="输入待办内容关键字" clearable />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="待办类型">
          <n-select v-model:value="searchTodoTypes" multiple :options="store.typeOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="创建日期范围">
          <n-date-picker v-model:value="dateRange" type="daterange" clearable />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="完成日期范围">
          <n-date-picker v-model:value="endDateRange" type="daterange" clearable />
        </n-form-item>
      </n-gi>
    </n-grid>
    </n-form>
    <p class="w-full text-left">
      <n-checkbox v-if="isBatch" label="全选" size="small" v-model:checked="isCheckAll" />
    </p>
    <n-checkbox-group v-model:value="checkedTodos">
      <n-space>
        <TodoItem v-for="(v, i) of showTodoList" :key="i" :item="v" :is-list="store.isTodoList" :isBatch="isBatch" />
      </n-space>
    </n-checkbox-group>
  </n-layout>
  <n-modal
    v-model:show="todoInfo.isShow"
    class="max-w-600px"
    :segmented="{
      content: 'soft',
      footer: 'soft',
    }"
    preset="card"
    title="添加待办事项"
    size="small"
    :bordered="false">
    <n-form
      label-placement="left"
      label-width="auto"
      ref="formRef"
      class="text-left"
      require-mark-placement="right-hanging"
      :model="todoInfo"
      :rules="rules"
    >
      <n-form-item label="待办事项" path="content">
        <n-input
          v-model:value="todoInfo.content"
          type="textarea"
          :autosize="{ minRows: 1 }"
          placeholder="待办事项内容"
        />
      </n-form-item>
      <n-form-item label="重要程度" path="level">
        <n-radio-group v-model:value="todoInfo.level" name="radiobuttongroup1">
            <n-radio-button
              v-for="lev in store.levelOptions"
              :key="lev.value"
              :value="lev.value"
              :label="lev.label"
            />
          </n-radio-group>
      </n-form-item>
      <n-form-item label="事项分类" path="type">
        <n-select v-model:value="todoInfo.type" multiple :options="store.typeOptions" />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="w-full flex justify-end">
        <n-button class="mr04" @click="todoInfo.isShow = false" size="small"
          >取消</n-button
        >
        <n-button
          type="info" size="small"
          @click="handleAddTodoConfirm"
          >确定</n-button
        >
      </div>
    </template>
  </n-modal>

</template>
  
<script lang="ts" setup>
  import { open, save } from '@tauri-apps/api/dialog'
  import { writeTextFile, readTextFile } from '@tauri-apps/api/fs'

  import dayjs from 'dayjs'
  import TodoItem from './Item.vue'
  import { FormInst } from 'naive-ui'
  import { useStore } from '../../store'
  import { formatTimeNormal, formatTimeDifference } from '../../hooks/useTime'
  const store = useStore()
  const formRef = ref<FormInst>()

  const rules = ref({
    content: {
      required: true,
      message: '请输入待办事项内容',
      trigger: 'blur'
    }
  })

  const searchTodoKey = ref('')
  let searchTodoTypes = ref<string[]>([])
  const dateRange = ref<[number, number]>([new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime(), Date.now()])
  const endDateRange = ref<[number, number] | null>(null)
  function getTimeStamp(date: string) {
    return new Date(date).getTime()
  }

  const dayofWeek = new Date().getDay()
  if ([6, 7].includes(dayofWeek)) {
    searchTodoTypes.value = ['3']
  } else {
    searchTodoTypes.value = ['1']
  }

  const showTodoList = computed(() => {
    let retArr: Record<string, any>[] = store.todoData
    if (!searchTodoKey.value.trim()) {
      retArr = retArr.sort((v2, v1) => dayjs(v1.createdAt).valueOf() - dayjs(v2.createdAt).valueOf());
    } else {
      retArr = (retArr.filter(v => v.content.indexOf(searchTodoKey.value)!== -1)).sort((v2, v1) => getTimeStamp(v1.createdAt) - getTimeStamp(v2.createdAt))
    }
    if (dateRange.value && dateRange.value[0]) {
      retArr = retArr.filter(v => dayjs(dayjs(dateRange.value[0]).format('YYYY-MM-DD') + ' 00:00:00').valueOf() < dayjs(v.createdAt).valueOf())
    }
    if (dateRange.value && dateRange.value[1]) {
      retArr = retArr.filter(v => dayjs(dayjs(dateRange.value[1]).format('YYYY-MM-DD') + ' 23:59:59').valueOf() > dayjs(v.createdAt).valueOf())
    }
    if (endDateRange.value && Array.isArray(endDateRange.value) && endDateRange.value[0]) {
      retArr = retArr.filter(v => dayjs(dayjs(endDateRange.value?.[0]).format('YYYY-MM-DD') + ' 00:00:00').valueOf() < dayjs(v.updatedAt).valueOf())
    }
    if (endDateRange.value &&  Array.isArray(endDateRange.value) && endDateRange.value[1]) {
      retArr = retArr.filter(v => dayjs(dayjs(endDateRange.value?.[1]).format('YYYY-MM-DD') + ' 23:59:59').valueOf() > dayjs(v.updatedAt).valueOf())
    }
    if (searchTodoTypes.value && searchTodoTypes.value.length > 0) {
      retArr = retArr.filter(v =>  searchTodoTypes.value.some(type => v.type.includes(type)))
    }
    if ([6, 7].includes(dayofWeek)) {
      retArr = retArr.filter(v => v.type.indexOf('3') !== -1).concat(retArr.filter(v => v.type.indexOf('3') == -1))
    } else {
      retArr = retArr.filter(v => v.type.indexOf('1') !== -1).concat(retArr.filter(v => v.type.indexOf('1') == -1))
    }
    return retArr.filter(v => !v.isCompleted).concat(retArr.filter(v => v.isCompleted))
  })

  const todoInfo = reactive({
    isShow: false,
    content: '',
    level: '4',
    type: ''
  })

  const isCheckAll = ref<Boolean>(false)
  const checkedTodos = ref<Record<string, any>[]>([])

  const hiddenCondition = ref<Boolean>(true)
  const isBatch = ref<Boolean>(false)

  watch(checkedTodos, (vals, oldVals) => {
    if (vals) {
      emits('update:checkedOptions', checkedTodos.value)
    }
  })
  watchEffect(() => {
    checkedTodos.value = isCheckAll.value ? showTodoList.value: []
  })

  function switchCondition() {
    hiddenCondition.value = !hiddenCondition.value
  }

  function batchClick() {
    isBatch.value = !isBatch.value
    if (!isBatch.value) {
      checkedTodos.value = []
      isCheckAll.value = false
    }
  }

  function timeDuration(item: Record<string, any>) {
    const {days, hours, minutes, seconds} = formatTimeDifference((item.isCompleted ? new Date(item.updatedAt).getTime() : new Date().getTime()) - new Date(item.createdAt).getTime())
    const day = days ? days + '天' : ''
    const hour = hours ? hours + '小时' : ''
    const minute = minutes ? minutes + '分' : ''
    const second = seconds ? seconds + '秒' : ''
    return `${day}${hour}${minute}${second}`
  }

  async function exportShowTodoList() {
    const filePath = await save({
      filters: [{
        name: 'showTodoList',
        extensions: ['txt']
      }]
    });

    if (filePath) {
      let exportData = showTodoList.value.map(v => `${v.isCompleted ? '已完成': '进行中'}-${v.content}-${formatTimeNormal(new Date(v.createdAt))}-${formatTimeNormal(new Date(v.updatedAt))} ${v.isCompleted ? '耗时：' + timeDuration(v) : ''}\n`).join('')
      if (checkedTodos.value.length > 0) { 
        exportData = checkedTodos.value.map(v => `${v.isCompleted? '已完成': '进行中'}-${v.content}-${formatTimeNormal(new Date(v.createdAt))}-${formatTimeNormal(new Date(v.updatedAt))} ${v.isCompleted ? '耗时：' + timeDuration(v) : ''}\n`).join('')
      }
      writeTextFile(filePath, exportData)
      window.$notification.success({
        title: checkedTodos.value.length ? '勾选待办导出成功': '导出成功',
        duration: 3000,
      })
    }else {
      window.$notification.info({
        title: '取消导出',
        duration: 3000,
      })
    }
  }

  const handleAddTodoConfirm = (e: MouseEvent) => {
    e.preventDefault()
    formRef.value?.validate(err => {
      if (err) return
      store.todoData.push({
        content: todoInfo.content,
        level: todoInfo.level,
        type: todoInfo.type,
        id: Date.now(), // 随机生成的 id
        isCompleted: false, // 初始状态为 false，即未完成
        createdAt: new Date(), // 创建时间
        updatedAt: new Date() // 更新时间
      })
      todoInfo.isShow = false
      todoInfo.content = ''
    })
  }

  const handleShowModal = () => {
    todoInfo.isShow = true
    todoInfo.content = ''
    todoInfo.level = '4'
    todoInfo.type = ''
  }

  const handleDeleteTodo = () => {
    if (checkedTodos.value?.length === 0) {
      window.$message.warning(`暂无勾选的数据`)
      return
    }
    window.$dialog.warning({
      title: '警告',
      content: '确定删除所选数据？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        store.todoData = store.todoData.filter(v =>!checkedTodos.value?.includes(v))
        checkedTodos.value = []
        window.$notification.success({
          title: '删除成功',
          duration: 3000,
        })
      }

    })
  }

  const emits = defineEmits(['update:checkedOptions'])

  defineExpose({
    handleShowModal,
    handleDeleteTodo
  })

</script>
  
<style>
  
</style>