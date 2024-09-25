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
            <!-- <n-tab name="todoSetting" tab="待办选项设置">待办选项设置</n-tab > -->
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
import { useSettings } from './useSettings'

import { axiosServie } from '../../hooks/useRequest'
const { service } = axiosServie()

import dayjs from 'dayjs';

// interface resType {code: number, data: any|{list: any}, msg: string}

const store = useStore()

const { 
  activeTab, activeSync,
  selectedTheme, themeOptions, modalTitle,
  model, formItems, rules, loading,
  userFormItems, userForm, userRules,
  handleSettingConfirm, changeThemeAuto, handleUpdateActiveSync, logout,
  userLogin, createNewUser, getSysBizTaskListFn, enSureSave2Server
} = useSettings()

const isLogin = computed(() => {
  return getToken()
})

function logoutFn() {
  logout()
  store.todoData = []
}

const showSetting = () => {
  model.isShow = !model.isShow
  // getUtoolToken()
  // if (model.isShow ) {
  //   changeThemeAuto()
  // }
}


const saveToServer = () => {
  enSureSave2Server()
}



defineExpose({ showSetting })
</script>

<style>

</style>