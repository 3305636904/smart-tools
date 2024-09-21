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
        <n-button type="primary" v-if="store.loginBizUser" size="small" :loading="loading" @click="saveToServer">确定同步</n-button>
        <n-button class="ml-3" type="warning" v-if="store.loginBizUser" size="small" :loading="loading" @click="logoutFn">退出用户</n-button>
        <div class="w-60%" v-else>
          <n-tabs type="segment" v-model:value="activeSync" @update:value="handleUpdateActiveSync" animated>
            <n-tab-pane name="login" tab="登录">
              <search-form class="text-left" :formItems="userFormItems" :model="userForm" :rules="userRules" >
                  <template #operation>
                    <div class="v-base text-right">
                      <n-button type="primary" size="small" :loading="loading" @click="userLogin()">登录</n-button>
                    </div>
                  </template>
              </search-form>
            </n-tab-pane >
            <n-tab-pane name="regist" tab="注册">
              <search-form class="text-left" :formItems="userFormItems" :model="userForm" :rules="userRules" >
                  <template #operation>
                    <div class="v-base text-right">
                      <n-button type="primary" size="small" :loading="loading" @click="createNewUser()">创建新用户</n-button>
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
import { getToken } from '../../utils/auth'

import { useStore } from '../../store'
import { useSettings, Body } from './useSettings'

import dayjs from 'dayjs';

// interface resType {code: number, data: any|{list: any}, msg: string}

const store = useStore()

const { 
  activeTab, activeSync,
  selectedTheme, themeOptions, modalTitle,
  model, formItems, rules, loading,
  userFormItems, userForm, userRules, toRFC3339,
  handleSettingConfirm, changeThemeAuto, handleUpdateActiveSync, logout,
  fetchPostPromise, userLogin, createNewUser, getSysBizTaskListFn
} = useSettings()


const showSetting = () => {
  model.isShow = !model.isShow

  // if (model.isShow ) {
  //   changeThemeAuto()
  // }
}

const enSureSave2Server = (cb = ()=>{}) => {
  /**
   * 1、只同步已完成的数据，没有id的时候会重新生成id
   */
   const completedData: paramsTodoType[] = store.todoData
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
  /**
   * 2、根据isRomote标识区分数据是否已经在服务器，isEdited标识是否修改过
   */
  let toSaveData: paramsTodoType[] = completedData.filter(v => !v.isRomote)
  let toUpdateData: paramsTodoType[] = completedData.filter(v => v.isRomote && v.isEdited).map(returnTodo => {
    if (returnTodo.updatedAt) {
      // 兼容时间格式 需要是 ISO 8601 格式
      // returnTodo.updatedAt = dayjs(returnTodo.updatedAt).format('YYYY-MM-DDTHH:mm:ssZ')
      returnTodo.updatedAt = toRFC3339(new Date(returnTodo.updatedAt))
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
    cb()
    return
  }
  if (toSaveData.length > 0) {
    const params = { requestBizTaskList: toSaveData}
    promiseList.push(fetchPostPromise(saveUrl, params, { 'biz-user': store.loginBizUser || '' }))
    // promiseList.push(service({ url: saveUrl, method: 'POST', data: {requestBizTaskList: toSaveData} }) as Promise<resType>)
  }
  if (toUpdateData.length > 0) {
    const params = {requestBizTaskList: toUpdateData}
    promiseList.push(fetchPostPromise(updateUrl, params, { 'biz-user': store.loginBizUser || '' }))
    // promiseList.push(service({ url: updateUrl, method: 'POST', data: {requestBizTaskList: toUpdateData} }) as Promise<resType>)
  }
  if (toDelDataIds.length > 0) {
    const params = { ids: toDelDataIds }
    promiseList.push(fetchPostPromise(deleteUrl, params, { 'biz-user': store.loginBizUser || '' }))
    // promiseList.push(service({ url: updateUrl, method: 'POST', data: {ids: toDelDataIds} }) as Promise<resType>)
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
      cb()
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
    cb()
  })
}

const saveToServer = () => {
  window.$dialog.warning({
    title: `温馨提示`,
    content: `为防止因为网络等原因导致数据丢失，请先备份数据，再进行同步操作。`,
    positiveText: '去备份',
    negativeText: '直接同步',
    onPositiveClick: () => {
    },
    onNegativeClick: () => {
      enSureSave2Server()
    }
  })
  
}

function logoutFn() {
  logout()
}

defineExpose({ showSetting })
</script>

<style>

</style>