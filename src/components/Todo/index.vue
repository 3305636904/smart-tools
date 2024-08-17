<template>
  <n-layout class="w-92%">
    <div :class="['w-20px', 'flex', 'flex-col', 'rounded-4', 'pos-fixed', 'right-20px', 'p-8px', 'pb-15px', 'z-50', {'hover:bg-gray-700': store.darkTheme, 'hover:bg-gray-200': !store.darkTheme }]">
      <n-tooltip placement="left" trigger="hover" >
        <template #trigger>
          <n-icon class="cursor-pointer" @click.stop="switchCondition">
            <IMaterialSymbolsTopPanelCloseOutline v-if="!hiddenCondition" class="text-18px" />
            <IMaterialSymbolsBottomPanelCloseOutlineSharp v-else class="text-18px" />
          </n-icon>
        </template>
        {{ hiddenCondition ? '展开工具栏' : '收起工具栏' }}
      </n-tooltip>
      <n-tooltip v-if="showTodoList.length" placement="left" trigger="hover">
        <template #trigger>
          <n-icon class="mt-18px cursor-pointer" @click.stop="batchClick">
            <ICarbonBatchJob class="text-19px" v-if="!isBatch" />
            <IMdiCancelBoxMultiple class="text-19px" v-else />
          </n-icon>
        </template>
        {{ isBatch ? '取消批量操作' : '批量操作' }}
      </n-tooltip>
      <n-tooltip v-if="checkedTodos.length" placement="left" trigger="hover">
        <template #trigger>
          <n-icon class="mt-18px cursor-pointer" @click.stop="handleDeleteTodo">
            <IMaterialSymbolsDeleteOutline class="text-19px" />
          </n-icon>
        </template>
        批量删除
      </n-tooltip>
      <n-tooltip placement="left" trigger="hover">
        <template #trigger>
          <n-icon class="mt-18px" @click.stop="exportShowTodoList">
            <IClarityExportLine class="text-19px" />
          </n-icon>
        </template>
        {{ checkedTodos.length ? '导出勾选展示数据' : '导出展示数据' }}
      </n-tooltip>
    </div>
    <n-form
      :label-width="80"
      :rules="rules"
      size="small"
      v-if="!hiddenCondition"
    >
      <n-grid cols="1 s:2 m:3 l:5 xl:6" :x-gap="12" responsive="screen">
        <n-gi>
          <n-form-item label="待办内容关键字">
            <n-input v-model:value="searchTodoKey" class="text-left max-w-350px" placeholder="输入待办内容关键字" clearable />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="待办类型">
            <n-select v-model:value="searchTodoTypes" class="max-w-350px" multiple :options="store.typeOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="创建日期范围">
            <n-date-picker v-model:value="dateRange" class="max-w-350px" type="daterange" clearable />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="完成日期范围">
            <n-date-picker v-model:value="endDateRange" class="max-w-350px" type="daterange" clearable />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>
    <p class="w-full text-left">
      <n-checkbox v-if="isBatch" :label="checkedTodos.length ? `选中${checkedTodos.length}` : '全选'" size="small" v-model:checked="isCheckAll" />
    </p>
    <n-checkbox-group v-model:value="checkedTodos">
      <n-space :vertical="store.isTodoList">
        <TodoItem v-for="(v, i) of showTodoList" :key="i" :item="v" :index="i + 1" :is-list="store.isTodoList" :isBatch="isBatch" />
      </n-space>
    </n-checkbox-group>
  </n-layout>
  <search-modal
    v-model:show="todoInfo.isShow"
    class="max-w-600px"
    :segmented="{
      content: 'soft',
      footer: 'soft',
    }"
    preset="card"
    title="添加待办事项">
      <search-form
        ref="formRef"
        class="text-left"
        :model="todoInfo"
        :formItems="formItems"
        :rules="rules"
      >
        <template #attachMents>
          <n-upload
            :custom-request="customRequest"
            :file-list="todoInfo.attachMents"
            :show-trigger="false"
            list-type="image-card"
            @preview="handlePreview"
            :on-remove="handleRemove"
          />
          <n-button
            type="info" size="small"
            :disabled="isUploading"
            @click="overHandleClick"
            >上传</n-button
          >
        </template>
      </search-form>

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
  </search-modal>

</template>
  
<script lang="ts" setup>
  import { open, save } from '@tauri-apps/api/dialog'
  import { writeTextFile, readTextFile } from '@tauri-apps/api/fs'
  import { invoke } from "@tauri-apps/api";
  import { convertFileSrc } from '@tauri-apps/api/tauri'

  import dayjs from 'dayjs'
  import TodoItem from './Item.vue'
  import { FormInst, UploadCustomRequestOptions, useDialog } from 'naive-ui'
  import type { UploadFileInfo } from 'naive-ui'
  import { useStore } from '../../store'
  import { formatTimeNormal, formatTimeDifference } from '../../hooks/useTime'

  import { Command } from '@tauri-apps/api/shell'
  import { os } from '../../common/global'

  import { useTodoAddForm } from './useTodo'
  const { todoInfo, rules, formItems } = useTodoAddForm()

  const store = useStore()
  const formRef = ref<FormInst>()

  const searchTodoKey = ref('')
  let searchTodoTypes = ref<string[]>([])
  const dateRange = ref<[number, number]>([new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime(), Date.now()])
  const endDateRange = ref<[number, number] | null>(null)
  function getTimeStamp(date: string) {
    return new Date(date).getTime()
  }

  const isUploading = ref(false)

  const dayofWeek = new Date().getDay()
  if ([6, 0].includes(dayofWeek)) {
    searchTodoTypes.value = ['3']
  } else {
    searchTodoTypes.value = ['1']
  }

  const showTodoList = computed(() => {
    let retArr: todoInfoType[] = store.todoData
    if (!searchTodoKey.value.trim()) {
      retArr = retArr.sort((v2, v1) => dayjs(v1.createdAt).valueOf() - dayjs(v2.createdAt).valueOf());
    } else {
      retArr = (retArr.filter(v => v.content.toLocaleLowerCase().indexOf(searchTodoKey.value.toLocaleLowerCase())!== -1)).sort((v2, v1) => getTimeStamp(v1.createdAt as string) - getTimeStamp(v2.createdAt as string))
      console.log('retArr: ',retArr)
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

  const dialog = useDialog()
  async function exportShowTodoList() {
    const exportInfo2Txt = async (needMemo: boolean = false) => {
      const filePath = await save({
        filters: [{
          name: 'showTodoList',
          extensions: ['txt']
        }]
      });

      if (filePath) {
        let exportData = showTodoList.value.map(v => `${v.isCompleted ? '已完成': '进行中'}-${v.content} ${v.isCompleted ? '耗时：' + timeDuration(v) : ''}\n`).join('')
        if (checkedTodos.value.length > 0) { 
          exportData = checkedTodos.value.map(v => `${v.isCompleted? '已完成': '进行中'}-${v.content}${needMemo ? '-' + v.memo : ''}\n`).join('')
        }
        writeTextFile(filePath, exportData)
        window.$notification.success({
          title: checkedTodos.value.length ? '勾选待办导出成功': '导出成功',
          duration: 3000,
        })
      } else {
        window.$notification.info({
          title: '取消导出',
          duration: 3000,
        })
      }
    }
    console.log('dialog: ', dialog)
    dialog.info({
      title: `提示`, content: `是否导出备注？`, positiveText: `是`, negativeText: `否`, 
      onPositiveClick: async () => exportInfo2Txt(true),
      onNegativeClick: () => exportInfo2Txt()
    })
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
        updatedAt: new Date(), // 更新时间
        attachMents: todoInfo.attachMents, // 附件信息
        memo: todoInfo.memo, // 备注
      })
      todoInfo.isShow = false
      todoInfo.content = ''
    })
  }

  const handleShowModal = () => {
    todoInfo.isShow = true
    todoInfo.content = ''
    todoInfo.level = ['4']
    todoInfo.type = searchTodoTypes.value
    todoInfo.isCompleted = false
    todoInfo.createdAt = new Date()
    todoInfo.updatedAt = new Date()
    todoInfo.attachMents = []
    todoInfo.memo = ''
    console.log(todoInfo)
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

  const customRequest = (options: UploadCustomRequestOptions) => {
    const file = options.file.file
    const fileType = options.file.name.split('.')[1]
  }

  const handlePreview = (file: UploadFileInfo) => {
    if (os === 'Windows_NT') {
      // windows打开
      const command = new Command('cmd', ['/C', 'start', file.name])
      command.on('close', (data) => {
        if (data.code) {
          window.$message.success('打开成功')
        }
      })
      command.on('error', (error) => window.$message.error(error.toString()))
      command.execute()
    }
  }

  const handleRemove = (options: any) => {
    const file = options.file as UploadFileInfo
    const fileList = options.fileList as Array<UploadFileInfo>
    const targetIndex = todoInfo.attachMents.findIndex(v => v.id = file.id)
    todoInfo.attachMents.splice(targetIndex, 1)
    options.fileList = todoInfo.attachMents
    console.log(2, todoInfo.attachMents)
    return true
  }
  
  async function overHandleClick() {
    const selected = await open({
      multiple: true,
      filters: [{
        name: 'Image',
        extensions: ['png', 'jpg', 'jpeg', 'txt', 'doc', 'docx']
      }]
    });
    if (Array.isArray(selected)) {
      selected.forEach(async selectedFilePath => {
        isUploading.value = true
        const url = convertFileSrc(selectedFilePath)
        const name = selectedFilePath.split('/').pop()
        todoInfo.attachMents.push({
          id: `${Date.now() + Math.ceil(Math.random() * 1000000)}`,
          name: name,
          status: 'finished',
          url,
          sourcePath: selectedFilePath
        })
        isUploading.value = false
      })
      console.log(1, todoInfo.attachMents)
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
    }
  }

  const emits = defineEmits(['update:checkedOptions'])

  defineExpose({
    handleShowModal,
    handleDeleteTodo
  })

</script>
  
<style>
  
</style>