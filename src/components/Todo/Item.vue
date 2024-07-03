<template>
  <n-card :class="['w-20vw', 'text-left', 'p-0', 'pos-relative', 'overflow-hidden', {'color-gray-500': props.item.isCompleted }]" :bordered="!props.item.isCompleted" :content-style="isEdit ? `padding: 0;` : ''" hoverable>
    <span class="pos-absolute top-1 right-1">
      <n-icon class="m-r-2" @click.stop="editItem">
        <IMaterialSymbolsEditSquareOutlineRounded v-show="!isEdit" class="text-15px cursor-pointer hover:color-blue-400" />
      </n-icon>
      <n-icon class="m-r-1" @click.stop="removeItem">
        <IMdiCloseCircleOutline v-show="!isEdit" class="text-15px cursor-pointer hover:color-red-500" />
      </n-icon>
    </span>
    <section @dblclick="dbEditItem" @blur="isEdit = false">
      <n-input ref="inputRef" type="textarea" class="w-full h-full" v-if="isEdit" @blur="isEdit = false" @keydown.enter="keyDown" v-model:value="item.content" ></n-input>
      <n-ellipsis v-else expand-trigger="click" line-clamp="3" :tooltip="false">
        {{item.content}}
      </n-ellipsis>
    </section>
  </n-card>

  <n-modal
    v-model:show="todoInfo.isShow"
    class="max-w-600px"
    :segmented="{
      content: 'soft',
      footer: 'soft',
    }"
    preset="card"
    title="编辑待办事项"
    size="small"
    :bordered="false">
    <n-form
      label-placement="left"
      label-width="auto"
      size="small"
      ref="formRef"
      require-mark-placement="right-hanging"
      :model="todoInfo"
      :rules="rules"
    >
      <n-form-item label="待办事项" path="content">
        <n-input
          v-model:value="todoInfo.content"
          type="textarea"
          placeholder="待办事项内容"
        />
      </n-form-item>
      <n-form-item label="重要程度" path="level">
        <n-radio-group v-model:value="todoInfo.level" name="radiobuttongroup1">
            <n-radio-button
              v-for="lev in levelOptions"
              :key="lev.value"
              :value="lev.value"
              :label="lev.label"
            />
          </n-radio-group>
      </n-form-item>
      <n-form-item label="事项分类" path="type">
        <n-select v-model:value="todoInfo.type" multiple :options="typeOptions" />
      </n-form-item>
      <n-form-item label="创建时间" path="createdAt">
        <n-p>{{ formatTime(new Date(todoInfo.createdAt))  }}</n-p>
      </n-form-item>
      <n-form-item label="上次修改时间" path="updatedAt">
        <n-p>{{ formatTime(todoInfo.updatedAt)  }}</n-p>
      </n-form-item>
      <n-form-item label="是否完成" path="isCompleted">
        <n-switch v-model:value="todoInfo.isCompleted" />
      </n-form-item>
      <n-form-item label="已花费时间" >
        <n-p>{{ getTimeDuration(new Date(todoInfo.createdAt), todoInfo.isCompleted ? todoInfo.updatedAt : new Date()).minutes }} 分钟</n-p>
        <!-- <n-switch v-model:value="todoInfo.isCompleted" /> -->
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="w-full flex justify-end">
        <n-button class="mr04" size="small" @click="todoInfo.isShow = false"
          >取消</n-button
        >
        <n-button
          type="info" size="small"
          @click="handleEditTodoConfirm"
          >确定</n-button
        >
      </div>
    </template>
  </n-modal>
</template>
  
<script lang="ts" setup>
  const isEdit = ref(false)
  const inputRef = ref<InputInst | null>()
  import { formatTime, getTimeDuration } from '../../hooks/useTime'
  import { FormInst, InputInst } from 'naive-ui'

  import { useStore } from '../../store'
  const store = useStore()

  const todoInfo = reactive({
    isShow: false,
    content: '',
    level: '',
    type: '',
    id: '', // 随机生成的 id
    isCompleted: false, // 初始状态为 false，即未完成
    createdAt: '', // 创建时间
    updatedAt: new Date() // 更新时间
  })

  const formRef = ref<FormInst>()

  const rules = ref({
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
  })
  
  const levelOptions = ref([
    { label: '重要或紧急', value: '1'},
    { label: '重要不紧急', value: '2'},
    { label: '紧急不重要', value: '3'},
    { label: '一般', value: '4'},
  ])

  const typeOptions = ref([
    { label: '工作', value: '1'},
    { label: '日常', value: '2'},
    { label: '��假', value: '3'},
    { label: '其他', value: '4'},
  ])

  function editItem() {
    todoInfo.isShow = true
    todoInfo.content = item.content
    todoInfo.level = item.level
    todoInfo.type = item.type
    todoInfo.id = item.id
    todoInfo.isCompleted = item.isCompleted
    todoInfo.createdAt = item.createdAt
  }

  function handleEditTodoConfirm(e: MouseEvent | KeyboardEvent) {
    e.preventDefault()
    formRef.value?.validate(err => {
      if (err) return
      const editDataIndex = store.todoData.findIndex(v => v.id === todoInfo.id)
      if (editDataIndex!== -1) {
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
        if (item.id) {
          const index = store.todoData.findIndex((v) => v.id === item.id)
          store.todoData.splice(index, 1)
        } else if (item.content) {
          const index = store.todoData.findIndex((v) => v.content === item.content)
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
      if (item.content.trim() !== '') {
        todoInfo.content = item.content
        handleEditTodoConfirm(e)
        isEdit.value = false
      } else {
        window.$message.warning(`待办内容不能为空`)
      }
    }
  }

  const props = defineProps<{
    item: Record<string, any>
  }>()

  const { item } = props
</script>
  
<style scoped>
  .n-card > .n-card__content {
    padding: 0;
  }
  .text-ellipsis-3 {
    overflow:hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
</style>