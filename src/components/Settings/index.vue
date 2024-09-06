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
      <div v-else-if="activeTab === 'saveDate'" class="w-full">
        <n-button type="primary" v-if="store.loginBizUser" size="small" :disabled="loading" @click="saveToServer">确定同步</n-button>
        <n-button class="ml-3" type="warning" v-if="store.loginBizUser" size="small" :disabled="loading" @click="logout">退出用户</n-button>
        <div class="w-60%" v-else>
          <n-tabs type="segment" v-model:value="activeSync" @update:value="handleUpdateActiveSync" animated>
            <n-tab-pane name="login" tab="登录">
              <search-form class="text-left" :formItems="userFormItems" :model="userForm" :rules="userRules" >
                  <template #operation>
                    <div class="v-base text-right">
                      <n-button type="primary" size="small" :disabled="loading" @click="userLogin()">登录</n-button>
                    </div>
                  </template>
              </search-form>
            </n-tab-pane >
            <n-tab-pane name="regist" tab="注册">
              <search-form class="text-left" :formItems="userFormItems" :model="userForm" :rules="userRules" >
                  <template #operation>
                    <div class="v-base text-right">
                      <n-button type="primary" size="small" :disabled="loading" @click="createNewUser()">创建新用户</n-button>
                    </div>
                  </template>
              </search-form>
            </n-tab-pane >
          </n-tabs>
          
        </div>
      </div>
    </n-card>
    <template #footer>
      <div class="w-full flex justify-end">
        <n-button class="mr04" @click="model.isShow = false" size="small"
          >取消</n-button
        >
        <n-button v-show="['theme', 'todoSetting'].includes(activeTab)"
          type="primary" size="small"
          @click="handleSettingConfirm"
          >确定</n-button
        >
      </div>
    </template>
  </search-modal>
</template>

<script setup lang="ts" name="settings">
// import { fetch, Body } from '@tauri-apps/api/http';

import { useStore } from '../../store'
import { useSettings } from './useSettings'

import dayjs from 'dayjs';

// interface resType {code: number, data: any|{list: any}, msg: string}

const store = useStore()

const { 
  activeTab, activeSync,
  selectedTheme, themeOptions, modalTitle,
  model, formItems, rules, loading,
  userFormItems, userForm, userRules,
  handleSettingConfirm, changeThemeAuto, handleUpdateActiveSync,
  postPromise, userLogin, createNewUser, getSysBizTaskListFn
} = useSettings()


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
    if (!todo.id) {
      const newId = Date.now() + (Math.floor(Math.random() * 10000) + i)
      returnTodo.ID = newId
      returnTodo.id = newId
    }
    if (todo.attachMents && Array.isArray(todo.attachMents) && todo.attachMents.length > 0) returnTodo.attachMents = todo.attachMents.map(v => {
      if (typeof v == 'object' && Object.hasOwn(v, 'url')) return v.url
      return v
    })
    if (todo.type && !Array.isArray(todo.type)) {
      returnTodo.type = [todo.type]
    }
    delete returnTodo.UpdatedAt
    return returnTodo
  })
  let toSaveData: paramsTodoType[] = completedData.filter(v => !v.isRomote)
  let toUpdateData: paramsTodoType[] = completedData.filter(v => v.isRomote && v.isEdited).map(returnTodo => {
    if (returnTodo.updatedAt) {
      returnTodo.updatedAt = dayjs(returnTodo.updatedAt).format('YYYY-MM-DDTHH:mm:ssZ')
    }
    return returnTodo
  })
  let toDelDataIds  = store.delRemoteTodoData
  const saveUrl = `/bizTask/createBatchBizTask`
  const updateUrl = `/bizTask/updateBatchBizTask`
  const deleteUrl = `/bizTask/delBatchBizTask`

  console.log(toSaveData.length, toUpdateData.length, toDelDataIds.length)
  console.log(toSaveData, toUpdateData, toDelDataIds)
  const promiseList = []
  if (toSaveData.length === 0 && toUpdateData.length === 0 && toDelDataIds.length === 0) {
    getSysBizTaskListFn()
    window.$message.info(`当前数据已经是最新状态。`)
    return
  }
  if (toSaveData.length > 0) {
    promiseList.push(postPromise(saveUrl, { requestBizTaskList: toSaveData}, { 'biz-user': store.loginBizUser || '' }))
  }
  if (toUpdateData.length > 0) {
    promiseList.push(postPromise(updateUrl, {requestBizTaskList: toUpdateData}, { 'biz-user': store.loginBizUser || '' }))
  }
  if (toDelDataIds.length > 0) {
    promiseList.push(postPromise(deleteUrl, { ids: toDelDataIds }, { 'biz-user': store.loginBizUser || '' }))
  }
  let nRef
  Promise.all(promiseList).then(resArr => {
    if (resArr && Array.isArray(resArr) && resArr.length > 0) {
      nRef = window.$notification.success({
        title: '操作成功。',
        content: resArr.map(v => v?.msg).join(', '),
        onClose: () => nRef = null
      })
      store.delRemoteTodoData = []
      getSysBizTaskListFn()
    }
  }).catch(err => {
    console.error(err)
    const errorMsg = err && Array.isArray(err) ? err.map(v => v.msg) : err.msg;
    nRef = window.$notification.error({
      title: '操作失败。',
      content: errorMsg,
      onClose: () => nRef = null
    })
  })
  
}

const logout = () => {
  store.loginBizUser = ''
  localStorage.removeItem('biz-user')
}

defineExpose({ showSetting })
</script>

<style>

</style>