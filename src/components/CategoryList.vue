<template>
  <n-layout class="h-full w-100vw">
    <n-layout-header
      class="fixed top-0 left-0 flex justify-between items-center h-64px shadow-lg z-10 pr-8"
      :class="{ 'shadow-gray-600': store.darkTheme }"
    >
      <n-h2 prefix="bar" class="m-0 ml-4">
        <n-text type="primary">{{activeTitle}}</n-text>
      </n-h2>
    </n-layout-header>
    <n-scrollbar>
      <n-layout-content class="h-full mt-64px mb-2 p-8">
        <n-collapse class="w-100vw overflow-hidden" :default-expanded-names="store.activeVal" @item-header-click="handleItemHeaderClick" accordion>
          <n-collapse-item title="快捷网站" :name="1">
            <template #header-extra>
              <n-tooltip placement="left" trigger="hover">
                <template #trigger>
                  <n-icon class="mr-5" @click.stop="clearAll1">
                    <i-carbon-clean v-if="store.activeVal === 1" class="text-20px" />
                  </n-icon>
                </template>
                <n-p>清除所有快捷网站</n-p>
              </n-tooltip>
              <n-tooltip placement="left" trigger="hover">
                <template #trigger>
                  <n-icon class="mr-5">
                    <i-line-md-upload-outline-loop v-show="store.activeVal === 1" class="text-20px" @click.stop="handleExport" />
                  </n-icon>
                </template>
                <n-p>导出快捷网站</n-p>
              </n-tooltip>
              <n-tooltip placement="left" trigger="hover">
                <template #trigger>
                  <n-icon class="mr-5">
                    <i-line-md-download-outline-loop v-show="store.activeVal === 1" class="text-20px" @click.stop="handleImport"/>
                  </n-icon>
                </template>
                <n-p>导入快捷网站</n-p>
              </n-tooltip>
              <n-popover placement="left" trigger="hover">
                <template #trigger>
                  <n-icon class="mr-5">
                    <i-carbon-category-new v-show="store.activeVal === 1" class="text-20px" @click.stop="handleAddCate"/>
                  </n-icon>
                </template>
                <n-p>添加分类</n-p>
              </n-popover>
              <n-popover placement="left" trigger="hover">
                <template #trigger>
                  <n-icon class="mr-20">
                    <i-ri-question-line v-show="store.activeVal === 1" class="text-20px" />
                  </n-icon>
                </template>
                <n-p>左键跳转，右键卡片编辑和删除</n-p>
              </n-popover>
            </template>
            <n-space>
              <category-card
                v-for="item in store.data"
                :key="item.label"
                :cate="item"
              />
            </n-space>
          </n-collapse-item>
          <n-collapse-item title="待办纪要" :name="2">
            <template #header-extra>
              <n-popover placement="left" trigger="hover">
                <template #trigger>
                  <n-icon class="mr-20">
                    <IZondiconsAddOutline v-show="store.activeVal === 2" class="text-16px" @click.stop="handleAddTodo"/>
                    <!-- <i-carbon-category-new v-show="store.activeVal === 2" class="text-20px" @click.stop="handleAddCate"/> -->
                  </n-icon>
                </template>
                <n-p>添加待办纪要</n-p>
              </n-popover>
            </template>
            <Todo ref="todoRef"/>
          </n-collapse-item>
        </n-collapse>
      </n-layout-content>
    </n-scrollbar>
    <cate-modal />
    <item-modal />
    <float-btn />
  </n-layout>
</template>

<script lang="ts" setup>

import { useStore } from '../store'

import CategoryCard from './CategoryCard.vue'
import CateModal from './CateModal.vue'
import ItemModal from './ItemModal.vue'
import FloatBtn from './FloatBtn.vue'
import Todo from './Todo/index.vue'
import type { CollapseProps } from 'naive-ui'

import { writeTextFile, readTextFile } from '@tauri-apps/api/fs'
import { open, save } from '@tauri-apps/api/dialog'

const store = useStore()

const todoRef = ref(null)

const activeTitle = computed(() => {
  // const store.cateToolList: Record<number, string> = { 1: `快捷网站`, 2: `待办纪要`, 3: `驼峰下划线相互转换` }
  return store.activeVal ? store.cateToolList[store.activeVal] : `快捷网站`
})

const handleItemHeaderClick: CollapseProps['onItemHeaderClick'] = ({ name, expanded }) => {
  if (!expanded) {
    store.activeVal = null
    return
  }
  store.activeVal = name
}

function handleAddTodo() {
  todoRef.value.handleShowModal()
}

const clearAll1 = () => {
  window.$dialog.warning({
    title: '警告',
    content: '确定删除所有数据？建议先点击上方按钮导出备份',
    positiveText: '确定',
    negativeText: '不确定',
    onPositiveClick: () => {
      // store.data = []
      // window.$notification.success({
      //   title: '清空成功',
      //   duration: 3000,
      // })
    },
  })
}

const handleExport = async (data: string) => {
  const selete = await save({
    filters: [
      {
        name: 'backup',
        extensions: ['json'],
      },
    ],
  })
  if (selete) {
    await writeTextFile(selete, JSON.stringify(store.data))
    window.$notification.success({
      title: '导出成功',
      duration: 3000,
    })
  } else {
    window.$notification.info({
      title: '取消导出',
      duration: 3000,
    })
  }
}
const handleImport = async () => {
  const selete = await open({
    filters: [
      {
        name: 'backup',
        extensions: ['json'],
      },
    ],
  })
  if (selete) {
    try {
      const data = await readTextFile(selete as string)
      console.log('import: ', data)
      store.data = JSON.parse(data)
      window.$notification.success({
        title: '导入成功',
        duration: 3000,
      })
    } catch (e) {
      window.$notification.error({
        title: '数据异常',
        content: '原因：' + e,
      })
    }
    return 
  } else {
    window.$notification.info({
      title: '取消导入',
      duration: 3000,
    })
  }
}

const handleAddCate = () => {
  store.cateModal.title = '添加分类'
  store.cateModal.label = ''
  store.cateModal.prevLabel = ''
  store.cateModal.isShow = true
}
</script>
