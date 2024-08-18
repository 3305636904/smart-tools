<template>
  <search-modal
    v-model:show="model.isShow"
    class="max-w-600px"
    :segmented="{
      content: 'soft',
      footer: 'soft',
    }"
    preset="card"
    title="选项设置"
  >
    <SearchForm ref="formRef" :model="model" :formItems="formItems" :rules="rules" />
    <template #footer>
      <div class="w-full flex justify-end">
        <n-button class="mr04" @click="model.isShow = false" size="small"
          >取消</n-button
        >
        <n-button
          type="info" size="small"
          @click="handleSettingConfirm"
          >确定</n-button
        >
      </div>
    </template>
  </search-modal>
</template>

<script setup lang="ts" name="settings">
import { useSettings } from './useSettings'

const { model, formItems, rules, handleSettingConfirm } = useSettings()

const showSetting = () => {
  model.isShow = !model.isShow
}

defineExpose({ showSetting })
</script>

<style>

</style>