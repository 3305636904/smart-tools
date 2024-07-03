<template>
  <n-layout class="h-75vh w-100vw">
    <n-space>
      <TodoItem v-for="(v, i) of props.todoData" :key="i" :item="v"/>
    </n-space>
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
    size="huge"
    :bordered="false">
    <n-form
      label-placement="left"
      label-width="auto"
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
    </n-form>
    <template #footer>
      <div class="w-full flex justify-end">
        <n-button class="mr04" @click="todoInfo.isShow = false"
          >取消</n-button
        >
        <n-button
          type="info"
          @click="handleAddTodoConfirm"
          >确定</n-button
        >
      </div>
    </template>
  </n-modal>

</template>
  
<script lang="ts" setup>
  import TodoItem from './Item.vue'
  import { FormInst } from 'naive-ui'
  import { useStore } from '../../store'
  const store = useStore()
  const formRef = ref<FormInst>()

  const rules = ref({
    content: {
      required: true,
      message: '请输入待办事项内容',
      trigger: 'blur'
    }
  })

  const props = defineProps<{
    todoData: Record<string, any>
  }>()

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

  const todoInfo = reactive({
    isShow: false,
    content: '',
    level: '4',
    type: ''
  })

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
      // store.addTodo(todoInfo.content, todoInfo.level, todoInfo.type)
      todoInfo.isShow = false
      todoInfo.content = ''
    })
  }

  const handleShowModal = () => {
    todoInfo.isShow = true
  }

  defineExpose({
    handleShowModal
  })

</script>
  
<style>
  
</style>