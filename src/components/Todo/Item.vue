<template>
  <n-card class="w-20vw text-left p-0 pos-relative overflow-hidden" :content-style="isEdit ? `padding: 0;` : ''" hoverable>
    <n-icon class="pos-absolute top-1 right-1" @click.stop="removeItem">
      <IMdiCloseCircleOutline v-show="!isEdit" class="text-15px cursor-pointer hover:color-red-500" />
    </n-icon>
    <section @dblclick="dbEditItem" @blur="isEdit = false">
      <n-input ref="inputRef" type="textarea" class="w-full h-full" v-if="isEdit" @blur="isEdit = false" v-model:value="item.content" ></n-input>
      <n-ellipsis v-else expand-trigger="click" line-clamp="3" :tooltip="false">
        {{item.content}}
      </n-ellipsis>
    </section>
  </n-card>
</template>
  
<script lang="ts" setup>
  const isEdit = ref(false)
  const inputRef = ref(null)

  import { useStore } from '../../store'
  const store = useStore()  
  
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
      inputRef.value.focus()
    })
  }

  function strSplit(str: string, chunkSize: number = 10): string {
    const arr = str.match(new RegExp(`.{1,${chunkSize}}`, 'g'));
    return (arr && arr.length > 0 && `<div class="text-left">${arr.join('<br>')}</div>`) || ''
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