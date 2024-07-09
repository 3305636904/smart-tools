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
              <span class="mr-20">
                <n-tooltip placement="left" trigger="hover">
                <template #trigger>
                  <n-icon class="mr-5" @click.stop="clearAllData">
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
                  <n-icon>
                    <i-ri-question-line v-show="store.activeVal === 1" class="text-20px" />
                  </n-icon>
                </template>
                <n-p>左键跳转，右键卡片编辑和删除</n-p>
              </n-popover>
              </span>
            </template>
            <n-p class="w-20vw">
              <n-input class="text-left" v-model:value="searchWebKey" placeholder="输入快捷网站或分类名称" clearable />
            </n-p>
            <n-space>
              <category-card
                v-for="item in showWebList"
                :key="item.label"
                :cate="item"
              />
            </n-space>
          </n-collapse-item>
          <n-collapse-item title="待办纪要" :name="2">
            <template #header-extra>
              <span class="mr-20" v-if="store.activeVal === 2">
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5" @click.stop="switchListType">
                      <IMaterialSymbolsMenu v-if="store.isTodoList" class="text-18px" />
                      <IGgMenuGridR v-else class="text-18px" />
                    </n-icon>
                  </template>
                  <n-p>切换为{{ store.isTodoList ? '方块' : '列表' }}</n-p>
                </n-tooltip>
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5" @click.stop="clearAllData">
                      <i-carbon-clean class="text-18px" />
                    </n-icon>
                  </template>
                  <n-p>清除所有待办事项</n-p>
                </n-tooltip>
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5">
                      <i-line-md-upload-outline-loop class="text-18px" @click.stop="handleExport" />
                    </n-icon>
                  </template>
                  <n-p>导出所有待办事项</n-p>
                </n-tooltip>
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5">
                      <i-line-md-download-outline-loop class="text-18px" @click.stop="handleImport"/>
                    </n-icon>
                  </template>
                  <n-p>导入待办事项</n-p>
                </n-tooltip>
                <n-popover placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon>
                      <IZondiconsAddOutline class="text-16px" @click.stop="handleAddTodo"/>
                    </n-icon>
                  </template>
                  <n-p>添加待办纪要</n-p>
                </n-popover>
              </span>
            </template>
            <TodoList ref="todoRef" v-model:checkedOptions="checkedTodoOptions" />
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
import TodoList from './Todo/index.vue'
import type { CollapseProps } from 'naive-ui'

import { writeTextFile, readTextFile } from '@tauri-apps/api/fs'
import { open, save } from '@tauri-apps/api/dialog'

const store = useStore()
const todoRef = ref<typeof TodoList>()

const checkedTodoOptions = ref<Record<string, any>[]>([])

const searchWebKey = ref('')
const showWebList = computed(() => {
  if (!searchWebKey.value.trim()) return store.data;

  return store.data.filter(v => v.label.indexOf(searchWebKey.value) !== -1 || v.list.some(v => v.label.indexOf(searchWebKey.value)!== -1))
})

const activeTitle = computed(() => {
  return store.activeVal ? store.cateToolList[store.activeVal as number] : `快捷网站`
})

const handleItemHeaderClick: CollapseProps['onItemHeaderClick'] = ({ name, expanded }) => {
  if (!expanded) {
    store.activeVal = null
    return
  }
  store.activeVal = name
}

function switchListType() {
  store.isTodoList = !store.isTodoList
}

function handleAddTodo() {
  todoRef.value?.handleShowModal()
}

const clearAllData = () => {
  window.$dialog.warning({
    title: '警告',
    content: '确定删除所有数据？建议先点击上方按钮导出备份',
    positiveText: '确定',
    negativeText: '不确定',
    onPositiveClick: () => {
      if (store.activeVal === 1) {
        store.data = []
      } else if (store.activeVal === 2) {
        store.todoData = []
      }
      window.$notification.success({
        title: '清空成功',
        duration: 3000,
      })
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
  let exportData = store.activeVal === 1 ? store.data : store.todoData
  // if (store.activeVal === 2) {
  //   exportData = checkedTodoOptions.value
  // }
  if (selete) {
    await writeTextFile(selete, JSON.stringify(exportData))
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
      if (store.activeVal === 1) {
        store.data = JSON.parse(data)
      } else if (store.activeVal === 2) {
        store.todoData = JSON.parse(data)
      }
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
