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
          <n-tabs type="segment" v-model:value="activeTab" animated class="mb-4">
            <n-tab name="theme" tab="主题设置">主题设置</n-tab >
            <n-tab name="todoSetting" tab="待办选项设置">待办选项设置</n-tab >
            <n-tab name="saveDate" tab="同步数据到服务器">同步数据到服务器</n-tab >
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
import dayjs from 'dayjs';

interface resType {code: number, data: any|{list: any}, msg: string}

const store = useStore()

const { activeTab, selectedTheme, themeOptions, modalTitle, model, formItems, rules, handleSettingConfirm, changeThemeAuto } = useSettings()

const showSetting = () => {
  model.isShow = !model.isShow

  if (model.isShow ) {
    changeThemeAuto()
  }
}

const saveToServer = () => {
  const completedData: paramsTodoType[] = store.todoData.filter(v => v.isCompleted)
  .map((todo, i) => {
    let returnTodo: any = todo
    if (!todo.id) returnTodo.id = Date.now() + Math.floor(Math.random() * 10000) + i
    if (todo.attachMents && Array.isArray(todo.attachMents) && todo.attachMents.length > 0) returnTodo.attachMents = todo.attachMents.map(v => {
      if (typeof v == 'object' && Object.hasOwn(v, 'url')) return v.url
      return v
    })
    if (todo.type && !Array.isArray(todo.type)) {
      returnTodo.type = [todo.type]
    }
    // if (returnTodo.updatedAt) returnTodo.updatedAt = new Date(returnTodo.updatedAt).toString().split('(')[0]
    delete returnTodo.UpdatedAt
    delete returnTodo.ID
    return returnTodo
  })
  let toSaveData: paramsTodoType[] = completedData.filter(v => !v.isRomote)
  let toUpdateData: paramsTodoType[] = completedData.filter(v => v.isRomote && v.isEdited).map(returnTodo => {
    if (returnTodo.updatedAt) {
      returnTodo.updatedAt = dayjs(returnTodo.updatedAt).format('YYYY-MM-DDTHH:mm:ssZ')
    }
    return returnTodo
  })
  let toDelDataIds  = store.delRemoteTodoData.map(v => v.id)
  // console.log(toSaveData, toUpdateData)
  // return
  const { VITE_APP_API_URL } = import.meta.env
  console.log('VITE_APP_API_URL: ', VITE_APP_API_URL)
  const saveUrl = `/bizTask/createBatchBizTask`
  const updateUrl = `/bizTask/updateBatchBizTask`
  const deleteUrl = `/bizTask/delBatchBizTask`
  const async2Server = (url: string, data: any[]): Promise<resType> => {
    return new Promise((resolve, reject) => {
      console.log('ur: ', `${VITE_APP_API_URL}${url}`)
      fetch(`${VITE_APP_API_URL}${url}`, {
        method: 'POST',
        body: Body.json({requestBizTaskList: data})
      }).then(res => {
        if (res.status === 200) {
          const result = (res.data  as resType)
          if (result.code !== 0) {
            reject(result)
          }
          resolve(result)
        }else {
          console.error(res)
          reject(res)
        }
      }).catch(err => {
        console.error(err)
        reject(err)
      })
    })
  }
  const asyncDeleteServer = (url: string, data: any[]): Promise<resType> => {
    return new Promise((resolve, reject) => {
      fetch(`${VITE_APP_API_URL}${url}`, {
        method: 'POST',
        body: Body.json({ids: data})
      }).then(res => {
        if (res.status === 200) {
          const result = (res.data)
          resolve(result as resType)
        }else {
          reject(res)
        }
      }).catch(err => {
        reject(err)
      })
    })
  }
  console.log(toSaveData.length, toUpdateData.length)
  console.log(toSaveData, toUpdateData)
  const promiseList = []
  if (toSaveData.length === 0 && toUpdateData.length === 0) {
    window.$message.info(`当前数据已经是最新状态，无需同步。`)
    return
  }
  if (toSaveData.length > 0) {
    promiseList.push(async2Server(saveUrl, toSaveData))
  }
  if (toUpdateData.length > 0) {
    promiseList.push(async2Server(updateUrl, toUpdateData))
  }
  if (toDelDataIds.length > 0) {
    promiseList.push(asyncDeleteServer(deleteUrl, toDelDataIds))
  }
  let nRef
  Promise.all(promiseList).then(resArr => {
    if (resArr && Array.isArray(resArr) && resArr.length > 0) {
      // nRef = window.$notification.create({
      //   title: resArr.map(v => v?.msg).join(', '),
      //   onClose: () => nRef = null
      // })
      nRef = window.$notification.success({
        title: '操作成功。',
        content: resArr.map(v => v?.msg).join(', '),
        onClose: () => nRef = null
      })
      const getSysBizTaskListProm = (): Promise<{status: number, data: resType}> => fetch(`${VITE_APP_API_URL}/bizTask/getSysBizTaskList`, {
        method: 'POST',
        body: Body.json({})
      })
      store.delRemoteTodoData = []
      getSysBizTaskListProm().then(res => {
        if (res.status === 200) {
          const result = res.data
          if (result.data?.list && result.data?.list.length > 0) {
            console.log('list: ', result.data.list)
            store.todoData = store.todoData.filter(v => !v.isCompleted).concat(result.data.list.map((v: paramsTodoType) => {
              v.isRomote = true
              if (v.ID) v.id = v.ID
              if (v.Content) v.content = v.Content
              if (v.CreatedAt) v.createdAt = v.CreatedAt
              if (v.UpdatedAt) v.updatedAt = v.UpdatedAt
              return v
            }))
          }
        } else {
          window.$notification.error({
            title: '同步数据失败',
            duration: 3000,
          })
        }
      })
    }
  }).catch(err => {
    console.error(err)
    nRef = window.$notification.error({
      title: '操作失败。',
      content: err,
      onClose: () => nRef = null
    })
  })
  
}

defineExpose({ showSetting })
</script>

<style>

</style>