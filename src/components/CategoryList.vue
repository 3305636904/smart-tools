<template>
  <n-layout :class="['h-100vh', 'w-full']">
    <n-layout-header
      class="flex justify-between items-center h-64px"
    >
      <n-h2 prefix="bar" class="m-0 ml-4 flex">
        <n-text type="primary">{{activeTitle}}</n-text>
      </n-h2>
      <div>
        <n-tooltip placement="left" trigger="hover">
          <template #trigger>
            <span class="ml-2 mr-2 cursor-default" @click="isYearTimeShow = !isYearTimeShow">{{isYearTimeShow ? '今年': '今天' }}剩余： <span class="color-orange text-12">{{ isYearTimeShow ? `${leftDays}` : `${hour}:${minute}:${second}` }}</span>{{ isYearTimeShow ? ` 天` : `` }}</span>
          </template>
          <span>{{ (isYearTimeShow && leftDays < 182) ? '虽已过半年，但切莫焦虑' : `珍惜每${!isYearTimeShow ? '一分': '天'}，切勿浪费时间` }}</span>
        </n-tooltip>
      </div>
    </n-layout-header>
    <n-scrollbar ref="contentRef" style="height: calc(100% - 64px);"  @scroll="handleScroll">
      <n-layout-content class="overflow-hidden p-6 pr-10px">
        <n-collapse class="overflow-hidden" display-directive="show" :default-expanded-names="store.activeVal" @item-header-click="handleItemHeaderClick" accordion>
          <n-collapse-item title="快捷网站" :name="1" display-directive="show" v-if="store.showCateToolList.includes(1)" :disabled="store.showCateToolList.length === 1">
            <template #header-extra>
              <span :class="['mr-4', 'rounded-8', 'p-2', 'pb-1', 'z-50', 'cursor-default', {'hover:bg-gray-700': store.darkTheme, 'hover:bg-gray-200': !store.darkTheme }]" @click.stop="()=>{}" v-if="store.activeVal === 1">
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5" @click.stop="clearAllData">
                      <i-carbon-clean v-if="store.activeVal === 1" class="text-20px" />
                    </n-icon>
                  </template>
                  清除所有快捷网站
                </n-tooltip>
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5">
                      <IClarityExportLine v-show="store.activeVal === 1" class="text-20px" @click.stop="handleExport" />
                    </n-icon>
                  </template>
                  导出快捷网站
                </n-tooltip>
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5">
                      <IClarityImportLine v-show="store.activeVal === 1" class="text-20px" @click.stop="handleImport"/>
                    </n-icon>
                  </template>
                  导入快捷网站
                </n-tooltip>
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5">
                      <i-carbon-category-new v-show="store.activeVal === 1" class="text-20px" @click.stop="handleAddCate"/>
                    </n-icon>
                  </template>
                  添加分类
                </n-tooltip>
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon>
                      <i-ri-question-line v-show="store.activeVal === 1" class="text-20px" />
                    </n-icon>
                  </template>
                  左键跳转，右键卡片编辑和删除
                </n-tooltip>
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
          <n-collapse-item title="待办纪要" :name="2" display-directive="show"  v-if="store.showCateToolList.includes(2)" :disabled="store.showCateToolList.length === 1">
            <template #header-extra>
              <span :class="['mr-4', 'rounded-8', 'p-2', 'pb-1', 'z-50', 'cursor-default', {'hover:bg-gray-700': store.darkTheme, 'hover:bg-gray-200': !store.darkTheme }]" @click.stop="()=>{}" v-if="store.activeVal === 2">
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5" @click.stop="switchListType">
                      <IMaterialSymbolsMenu v-if="store.isTodoList" class="text-18px" />
                      <IGgMenuGridR v-else class="text-18px" />
                    </n-icon>
                  </template>
                  切换为{{ store.isTodoList ? '方块' : '列表' }}
                </n-tooltip>
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5" @click.stop="clearAllData">
                      <i-carbon-clean class="text-18px" />
                    </n-icon>
                  </template>
                  清除所有待办事项
                </n-tooltip>
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5">
                      <IClarityExportLine class="text-18px" @click.stop="handleExport" />
                    </n-icon>
                  </template>
                  导出所有待办事项
                </n-tooltip>
                <n-tooltip placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon class="mr-5">
                      <IClarityImportLine class="text-18px" @click.stop="handleImport"/>
                    </n-icon>
                  </template>
                  导入待办事项
                </n-tooltip>
                <n-popover placement="left" trigger="hover">
                  <template #trigger>
                    <n-icon>
                      <IZondiconsAddOutline class="text-16px" @click.stop="handleAddTodo"/>
                    </n-icon>
                  </template>
                  添加待办纪要
                </n-popover>
              </span>
            </template>
            <TodoList ref="todoRef" v-model:checkedOptions="checkedTodoOptions" />
          </n-collapse-item>
        </n-collapse>        
      </n-layout-content>
      <n-tooltip v-if="showTopButton" placement="top" trigger="hover">
        <template #trigger>
          <n-button
            circle
            size="small"
            class="fixed right-5 bottom-1" 
            @click="scrollToTop"
          >
            <ISystemUiconsPushUp/>
          </n-button>
        </template>
        回到顶部
      </n-tooltip>
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

import dayjs from 'dayjs'

import { formatTimeTodayLast } from '../hooks/useTime'

const { hour, minute, second } = formatTimeTodayLast()

const store = useStore()
const todoRef = ref<typeof TodoList>()

const contentRef = ref()

const checkedTodoOptions = ref<Record<string, any>[]>([])

const isYearTimeShow = ref<Boolean>(false)

onMounted(() => {
  getLeftDays()
})

const showTopButton = ref(false)

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
  showTopButton.value = false
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

const leftDays = ref(0)
const getLeftDays = () => {
  // 今天的标准时间
  let today = new Date();
  // 本年最后标准时间
  let endYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
  // 一天的毫秒数
  let msPerDay = 24 * 60 * 60 * 1000;
  // 计算剩余毫秒除以一天的毫秒数，就是天数
  leftDays.value = Math.round((endYear.getTime() - today.getTime()) / msPerDay);
}


function handleScroll(e: Event) {
  const scrollTop = (e.target as HTMLElement).scrollTop || (e.target as HTMLElement).scrollTop;
  // const distanceToBottom = (e.target as HTMLElement).scrollHeight - (e.target as HTMLElement).scrollTop - window.innerHeight;
  showTopButton.value =  scrollTop > (window.innerHeight*1.45)
}
const scrollToTop = () => {
  contentRef?.value.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
</script>
