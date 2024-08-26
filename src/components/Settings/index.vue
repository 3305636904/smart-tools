<template>
  <search-modal
    v-model:show="model.isShow"
    class="max-w-600px"
    :segmented="{
      content: 'soft',
      footer: 'soft',
    }"
    preset="card"
    :title="modalTitle"
  >
    <n-card content-class="min-h-30">
      <template #header>
        <div class="w-full flex justify-items-center">
          <n-tabs type="segment" v-model:value="activeTab" animated class="mb-4 w-50">
            <n-tab name="theme" tab="主题设置">主题设置</n-tab >
            <n-tab name="todoSetting" tab="待办选项设置">待办选项设置</n-tab >
            <!-- <n-tab name="saveDate" tab="同步数据到服务器">同步数据到服务器</n-tab > -->
          </n-tabs>
        </div>
      </template>
      <n-radio-group v-if="activeTab === 'theme'" v-model:value="selectedTheme" name="theme" size="small">
        <n-radio-button
          v-for="(item, index) in themeOptions"
          :key="`${item.value}${index}`"
          :value="item.value"
          :label="item.label"
          size="small"
        >
          {{ item.label }}
        </n-radio-button>
      </n-radio-group>
      <SearchForm v-else-if="activeTab === 'todoSetting'" ref="formRef" :model="model" :formItems="formItems" :rules="rules" />
      <n-button v-else-if="activeTab === 'saveDate'" type="primary" size="small" @click="saveToServer">确定同步</n-button>
    </n-card>
    <template #footer>
      <div class="w-full flex justify-end">
        <n-button class="mr04" @click="model.isShow = false" size="small"
          >取消</n-button
        >
        <n-button
          type="primary" size="small"
          @click="handleSettingConfirm"
          >确定</n-button
        >
      </div>
    </template>
  </search-modal>
</template>

<script setup lang="ts" name="settings">
import { fetch, Body } from '@tauri-apps/api/http';

import { useStore } from '../../store'
import { useSettings } from './useSettings'

const store = useStore()

const { activeTab, selectedTheme, themeOptions, modalTitle, model, formItems, rules, handleSettingConfirm, changeThemeAuto } = useSettings()

const showSetting = () => {
  model.isShow = !model.isShow

  if (model.isShow ) {
    changeThemeAuto()
  }
}

const saveToServer = () => {
  console.log(store.todoData)
  const toSaveData = store.todoData.filter(v => !v.id)
  const toUpdateData = store.todoData.filter(v => v.id)
  const saveUrl = `/bizTask/createBatchBizTask`
  const updateUrl = `/bizTask/updateBatchBizTask`
  const async2Server = async (url: string, data: any[]) => {
    const res = await fetch(`http://127.0.0.1:8888${url}`, {
      method: 'POST',
      body: Body.json({requestBizTaskList: data})
    })
    if (res.status === 200) {
      const result = (res.data as {code: number, data: any, msg: string})
      window.$notification.success({
        title: result?.msg,
        duration: 3000,
      })
    }
  }
  console.log(toSaveData.length, toUpdateData.length)
  if (toSaveData.length > 0) {
    async2Server(saveUrl, toSaveData)
  }
  if (toUpdateData.length > 0) {
    async2Server(updateUrl, toSaveData)
  }
}

defineExpose({ showSetting })
</script>

<style>

</style>