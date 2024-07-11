<template>
  <n-card
    class="max-w-400px min-w-200px"
    :segmented="{
      content: 'soft',
    }"
    size="small"
    hoverable
  >
    <template #header>
      <n-tag v-if="!isSearch" class="cursor-pointer" type="success" @dblclick="handleSearchList">{{ cate.label }}</n-tag>
      <n-input v-else v-model:value="searchCateKey" ref="searchCateInputRef" class="w-8vw text-left" @blur="isSearch = false" placeholder="请输入快捷网站名称" />
    </template>
    <template #header-extra>
      <n-dropdown :options="cateOptions" @select="handleSelect">
        <n-button quaternary circle class="ml-1">
          <template #icon>
            <n-icon>
              <i-material-symbols-expand-circle-down-outline-rounded />
            </n-icon>
          </template>
        </n-button>
      </n-dropdown>
      <n-button quaternary circle @click="handleSelect('add')">
        <template #icon>
          <n-icon>
            <IGridiconsAddOutline/>
          </n-icon>
        </template>
      </n-button>
    </template>
    <n-space class="min-h-20px" vertical>
      <template v-if="isNeedShowMore">
        <item-card
          v-for="item in searchedCateList.slice(0, 2)"
          class="w-full"
          :key="item.label + '1'"
          :item="item"
          :cate="cate.label"
          ></item-card>
          <div v-if="searchedCateList.slice(0, 2).length > 2" @click.stop="handleShowMore" class="cursor-default w-full h-full flex-1 flex items-center justify-center hover:accent-emerald">
            展开
          </div>
      </template>
      <item-card
        v-else
        v-for="item in searchedCateList"
        class="w-full"
        :key="item.label"
        :item="item"
        :cate="cate.label"
        ></item-card>
        <div v-if="searchedCateList.length > 2" @click.stop="handleShowMore" class="cursor-default w-full h-full flex-1 flex items-center justify-center hover:accent-emerald">
          收起
        </div>
    </n-space>
  </n-card>
</template>
<script lang="ts" setup>
import ItemCard from './ItemCard.vue'
import AddItem from '~icons/line-md/document-add'
import EditCate from '~icons/line-md/edit'
import DeleteCate from '~icons/line-md/close-circle'
import ClearCate from '~icons/line-md/document-remove'
import { NIcon } from 'naive-ui'
import { useStore } from '../store'
const store = useStore()
const props = defineProps<{
  cate: Category
}>()
const cateOptions = [
  {
    label: '添加快捷方式',
    key: 'add',
    icon: () => h(NIcon, null, { default: () => h(AddItem) }),
  },
  {
    label: '编辑分类名',
    key: 'edit',
    icon: () => h(NIcon, null, { default: () => h(EditCate) }),
  },
  {
    label: '清空分类',
    key: 'clear',
    icon: () => h(NIcon, null, { default: () => h(ClearCate) }),
  },
  {
    label: '删除分类',
    key: 'delete',
    icon: () => h(NIcon, null, { default: () => h(DeleteCate) }),
  },
]

const searchCateInputRef = ref()

const handleSelect = (key: string) => {
  if (key === 'add') {
    store.itemModal.title = '添加快捷方式'
    store.itemModal.formData = {
      label: '',
      value: '',
    }
    store.itemModal.cate = props.cate.label
    store.itemModal.isShow = true
  } else if (key === 'edit') {
    store.cateModal.label = props.cate.label
    store.cateModal.prevLabel = props.cate.label
    store.cateModal.title = '修改分类'
    store.cateModal.isShow = true
  } else if (key === 'clear') {
    window.$dialog.warning({
      title: '警告',
      content: '确定清空分类列表？',
      positiveText: '确定',
      negativeText: '不确定',
      onPositiveClick: () => {
        const index = store.data.findIndex((v) => v.label === props.cate.label)
        store.data[index].list = []
        window.$notification.success({
          title: '清空成功',
          duration: 3000,
        })
      },
    })
  } else if (key === 'delete') {
    window.$dialog.warning({
      title: '警告',
      content: '确定删除分类列表？',
      positiveText: '确定',
      negativeText: '不确定',
      onPositiveClick: () => {
        const index = store.data.findIndex((v) => v.label === props.cate.label)
        store.data.splice(index, 1)
        window.$notification.success({
          title: '分类 ' + props.cate.label + ' 删除成功',
          duration: 3000,
        })
      },
    })
  }
}

const isSearch = ref<Boolean>(false)
const searchCateKey = ref('')
const handleSearchList = () => {
  isSearch.value = true
  nextTick(() => {
    searchCateInputRef.value?.focus()
  })
}

const isNeedShowMore = ref<Boolean>(true)
function handleShowMore() {
  isNeedShowMore.value = !isNeedShowMore.value
}

let searchedCateList = computed(() => {
  let returnList = props.cate.list
  if (isSearch.value && searchCateKey.value) {
    returnList = props.cate.list.filter(v => v.label.indexOf(searchCateKey.value) !== -1)
  }
  return returnList
})


</script>
