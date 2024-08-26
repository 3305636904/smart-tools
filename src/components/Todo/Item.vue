<template>
  <n-card v-if="!props.isList" content-class="content-clz" :class="['w-20vw', 'text-left', 'p-0', 'relative', 'overflow-hidden', {'color-gray-500': props.item.isCompleted }]"
  @mouseenter="() => (isEnter = true)" @mouseleave="() => (isEnter = false)"
  :bordered="!props.item.isCompleted" :content-style="isEdit ? `padding: 0;` : ''" hoverable>
    <n-checkbox size="small" v-show="props.isBatch" class="absolute top-1 left-3.5 w-2px h-2px" :value="props.item" />
    <span v-show="!props.item.isCompleted && !isEdit">
      <n-popover trigger="hover" raw>
        <template #trigger>
          <span :class="['absolute', 'top-1', {'left-8': props.isBatch, 'left-3' : !props.isBatch }, 'text-size-8px', 'color-red']">{{ spendDuration }}</span>
        </template>
        <span :class="['text-size-12px', 'color-red', 'p-1', {'bg-gray-700': store.darkTheme, 'bg-gray-400': !store.darkTheme}]">{{ spendDuration }}</span>
      </n-popover>
    </span>
    <n-switch :round="false" :railStyle="switchStatusColor" class="v-base mr-1.5" size="small" v-model:value="props.item.isCompleted" >
      <template #unchecked>待关闭</template>
      <template #checked>已关闭</template>
    </n-switch>
    <span :class="['top-1', 'transition-all', 'transition-duration-800', { 'hidden' : !isEnter }]">
      <n-icon class="m-r-2" @click.stop="editItem">
        <IMaterialSymbolsEditSquareOutlineRounded v-show="!isEdit" class="text-15px cursor-pointer hover:color-blue-400" />
      </n-icon>
      <n-icon class="m-r-1" @click.stop="removeItem">
        <IMdiCloseCircleOutline v-show="!isEdit" class="text-15px cursor-pointer hover:color-red-500" />
      </n-icon>
    </span>
    <section @dblclick="dbEditItem" @blur="isEdit = false">
      <n-input ref="inputRef" type="textarea" :autosize="{ minRows: 1 }" v-if="isEdit" @blur="isEdit = false" @keydown.enter="keyDown" v-model:value="item.content" ></n-input>
      <n-ellipsis v-else expand-trigger="click" line-clamp="3" :tooltip="false">
        <span>{{ props.index }}. </span>
        <span :class="{ 'line-through': props.item.isCompleted }">{{props.item.content}}</span>
      </n-ellipsis>
    </section>
  </n-card>
  <n-p v-else 
    :class="['text-left', 'p-1', 'pt-2', 'pos-relative', 'overflow-hidden', 'border-b-emerald', 'b-rounded-1.5', {'hover:bg-dark': store.darkTheme, 'hover:bg-gray-200': !store.darkTheme}]"
    style="width: calc(100% - 15px);"
    @mouseenter="() => (isEnter = true)" @mouseleave="() => (isEnter = false)">
    <!--  -->
    <span v-show="!props.item.isCompleted && !isEdit">
      <n-popover trigger="hover" raw>
        <template #trigger>
          <span class="pos-absolute top-0 left-3 text-size-6px color-red">{{ spendDuration }}</span>
        </template>
        <span :class="['text-size-12px', 'color-red', 'p-1', {'bg-gray-700': store.darkTheme, 'bg-gray-400': !store.darkTheme}]">{{ spendDuration }}</span>
      </n-popover>
    </span>
    <div class="block w-full position-relative" @dblclick="dbEditItem" @blur="isEdit = false">
      <n-checkbox size="small" v-if="!isEdit" v-show="props.isBatch" class="position-absolute left-0 top-1 w-2 h-2" :value="props.item" />
      <n-input ref="inputRef" type="textarea" :autosize="{ minRows: 1 }" v-if="isEdit" @blur="isEdit = false" @keydown.enter="keyDown" v-model:value="item.content" ></n-input>
      <p v-else class="m-0 w-full flex justify-start">
        <n-ellipsis :class="['transition-width', 'transition-duration-1000', 'flex-1', { 'pl-5' : !isEdit && props.isBatch }]" expand-trigger="click" line-clamp="1" :tooltip="false">
          <span>{{ props.index }}. </span>
          <span :class="['mr-1.5', { 'color-gray-700': !store.darkTheme, 'color-gray-400': store.darkTheme, 'line-through': props.item.isCompleted }]">{{props.item.content}}</span>
        </n-ellipsis>
        <n-switch :round="false" :railStyle="switchStatusColor" class="v-text-top" size="small" v-model:value="props.item.isCompleted" >
          <template #unchecked>待关闭</template>
          <template #checked>已关闭</template>
        </n-switch>
        <span :class="{'hidden' : !isEnter }">
          <n-icon class="ml-3 mr-3" @click.stop="editItem">
            <IMaterialSymbolsEditSquareOutlineRounded v-show="!isEdit" class="text-14px cursor-pointer hover:color-blue-400" />
          </n-icon>
          <n-icon @click.stop="removeItem">
            <IMdiCloseCircleOutline v-show="!isEdit" class="text-14px cursor-pointer hover:color-red-500" />
          </n-icon>
        </span>
      </p>
    </div>
  </n-p >

  <search-modal 
    v-model:show="todoInfo.isShow"
    class="max-w-600px"
    preset="card"
    title="编辑待办事项"
    :segmented="{
      content: 'soft',
      footer: 'soft',
    }"
    :bordered="false"
  >
    <search-form
      ref="formRef"
      class="text-left"
      :model="todoInfo"
      :rules="rules"
      :formItems="formItems"
    >
      <template #createdAt>
        <n-p>{{ formatTime(todoInfo.createdAt)  }}</n-p>
      </template>
      <template #updatedAt>
        <n-p>{{ formatTime(todoInfo.updatedAt)  }}</n-p>
      </template>
      <template #spendDuration>
        <n-p class="color-red">{{ spendDuration }}</n-p>
      </template>
      <template #attachMents>
        <n-upload
          :file-list="todoInfo.attachMents"
          :show-trigger="false"
          list-type="image-card"
          @preview="handlePreview"
          :on-remove="handleRemove"
        />
        <n-button
          type="primary" size="small"
          :disabled="isUploading"
          @click="overHandleClick"
          >上传</n-button
        >
      </template>
    </search-form>
    <template #footer>
      <div class="w-full flex justify-end">
        <n-button class="mr04" size="small" @click="todoInfo.isShow = false"
          >取消</n-button
        >
        <n-button
          type="primary" size="small"
          @click="handleEditTodoConfirm"
          >确定</n-button
        >
      </div>
    </template>
  </search-modal>
</template>
  
<script lang="ts" setup name="todoItem">
  import { open } from '@tauri-apps/api/dialog'
  let isEdit = ref(false)
  const inputRef = ref<InputInst | null>()
  import { formatTimeDifference } from '../../hooks/useTime'
  import { FormInst, InputInst } from 'naive-ui'
  import type { UploadFileInfo } from 'naive-ui'
  import dayjs from 'dayjs'

  import { convertFileSrc } from '@tauri-apps/api/tauri'
  import { Command } from '@tauri-apps/api/shell'
  import { os } from '../../common/global'

  import { useStore } from '../../store'
  const store = useStore()

  const emits = defineEmits(['changeCheckOptions'])

  const isUploading = ref(false)

  import { useTodoEditForm } from './useTodo'
  const { todoInfo, rules, formItems } = useTodoEditForm()

  const formRef = ref<FormInst>()

  const isEnter = ref(false)
  const checked = ref(false)

  function switchStatusColor({ focused, checked }: { focused: boolean, checked: boolean }) {
    return {
      background: !checked ? '#2a947d' : '#816060'
    }
  }

  function formatTime(val: any) {
    return dayjs(val).format('YYYY-MM-DD HH:mm:ss')
  }

  let checkedTodoData: Record<string, any> = [] 
  function handleCheckedChange(curChecked: boolean) {
    checked.value = curChecked
    const targetIndex = store.todoData.findIndex(v => v.id === props.item.id)
    if (checked) {
      if (targetIndex === -1) {
        checkedTodoData.push(props.item)
      }
    } else {
      if (targetIndex !== -1) {
        checkedTodoData.splice(targetIndex, 1)
      }
    }
    emits('changeCheckOptions', checkedTodoData)
  }

  const spendDuration = computed(() => {
    const {days, hours, minutes, seconds} = formatTimeDifference((props.item.isCompleted ? new Date(props.item.updatedAt as number).getTime() : new Date().getTime()) - new Date(props.item.createdAt as number).getTime())
    const day = days ? days + '天' : ''
    const hour = hours ? hours + '小时' : ''
    const minute = minutes ? minutes + '分' : ''
    const second = seconds ? seconds + '秒' : ''
    return `${day}${hour}${minute}${second}`
  })
  

  function editItem() {
    todoInfo.isShow = true
    todoInfo.content = props.item.content
    todoInfo.level = props.item.level
    todoInfo.type = props.item.type
    if (props.item.id != null) {
      todoInfo.id = props.item.id
    }
    todoInfo.isCompleted = props.item.isCompleted
    todoInfo.createdAt = props.item.createdAt
    todoInfo.updatedAt = props.item.updatedAt
    todoInfo.attachMents = props.item.attachMents
    todoInfo.memo = props.item.memo
  }

  function handleEditTodoConfirm(e: MouseEvent | KeyboardEvent) {
    e.preventDefault()
    formRef.value?.validate(err => {
      if (err) {
        console.log('err: ', err)
      }
      const editDataIndex = store.todoData.findIndex(v => v.id === todoInfo.id)
      if (editDataIndex!== -1) {
        todoInfo.updatedAt = new Date()
        store.todoData[editDataIndex] = { ...store.todoData[editDataIndex], ...todoInfo }
      }
      todoInfo.isShow = false
    })
  }
  
  function removeItem() {
    window.$dialog.warning({
      title: '警告',
      content: '确定移除当前纪要？',
      positiveText: '确定',
      negativeText: '不确定',
      onPositiveClick: () => {
        if (props.item.id) {
          const index = store.todoData.findIndex((v) => v.id === props.item.id)
          store.todoData.splice(index, 1)
        } else if (props.item.content) {
          const index = store.todoData.findIndex((v) => v.content === props.item.content)
          store.todoData.splice(index, 1)
        }
        window.$notification.success({
          title: '删除成功',
          duration: 3000,
        })
      },
    })
  }

  function dbEditItem() {
    isEdit.value = true
    nextTick(() => {
      inputRef.value?.focus()
    })
  }

  function keyDown(e: KeyboardEvent) {
    if (e.ctrlKey) {
      if (props.item.content.trim() !== '') {
        todoInfo.content = props.item.content
        handleEditTodoConfirm(e)
        isEdit.value = false
      } else {
        window.$message.warning(`待办内容不能为空`)
      }
    }
  }

  async function overHandleClick() {
    const selected = await open({
      multiple: true,
      filters: [{
        name: 'Image',
        extensions: ['png', 'jpg', 'jpeg', 'txt', 'doc', 'docx']
      }]
    });
    // console.log('111 attachMents: ', todoInfo.attachMents)
    if (Array.isArray(selected)) {
      selected.forEach(async selectedFilePath => {
        isUploading.value = true
        const url = convertFileSrc(selectedFilePath)
        const name = selectedFilePath.split('/').pop()
        const newTodoItem = {
          id: `${Date.now() + Math.ceil(Math.random() * 1000000)}`,
          name: name as string,
          status: 'finished',
          url: url
        } as attachMentsType
        todoInfo.attachMents.push(newTodoItem)
        console.log('attachMents: ', todoInfo.attachMents)
        isUploading.value = false
        window.$message.success('上传成功')
      })
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
    }
  }

  const handlePreview = (file: UploadFileInfo) => {
    console.log('file: ', file, 'os: ', os)
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
    return new Promise((resolve, reject) => {
      window.$dialog.warning({
        title: '警告',
        content: '确定删除所选附件？',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          const file = options.file as UploadFileInfo
          const fileList = options.fileList as Array<UploadFileInfo>
          const targetIndex = todoInfo.attachMents.findIndex(v => v.id = file.id)
          todoInfo.attachMents.splice(targetIndex, 1)
          options.fileList = todoInfo.attachMents
          console.log(2, todoInfo.attachMents)
          return true
        }
      })
    })
  }

  const props = defineProps<{
    index: number,
    item: todoInfoType,
    isList: Boolean,
    isBatch: Boolean
  }>()

</script>
  
<style scoped>
:deep(.content-clz) {
  padding: 1em;
}
</style>