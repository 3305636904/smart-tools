<template>
  <search-modal
    v-model:show="visible"
    class="max-w-600px"
    :segmented="{
      content: 'soft',
      footer: 'soft',
    }"
    preset="card"
    title="发现新版本">

    <div class="flex flex-col gap-4">
      <span>更新版本：{{ updateManifest.currentVersion }}</span>
    </div>

    <template #footer>
      <div class="w-full flex justify-end">
        <n-button class="mr04" @click="visible = false" size="small"
          >取消</n-button
        >
        <n-button
          type="primary" size="small"
          @click="updateConfirm()"
          >更新</n-button
        >
      </div>
    </template>
  </search-modal>
</template>

<script lang="ts" setup>

import {
  checkUpdate as tauriCheckUpdate,
  installUpdate,
  onUpdaterEvent
} from '@tauri-apps/api/updater'
import { getVersion } from '@tauri-apps/api/app'
import { relaunch } from '@tauri-apps/api/process'

const visible = ref<boolean>(false)
const isDownload = ref<boolean>(false)
const updateManifest = ref<any>({})

const checkUpdate = async () => {
  try {
    const updateInfo = await tauriCheckUpdate()
    console.log('updateInfo: ', updateInfo)

    if (!updateInfo.shouldUpdate) return

    updateManifest.value = {
      ...updateInfo?.manifest,
      currentVersion: await getVersion()
    }

    visible.value = true

    return true
  } catch (error) {
    console.error(error)
    window.$message.success(`当前已是最新版本`)
  }
}

const unlisten = async () => await onUpdaterEvent(({ error, status }) => {
  switch (status) {
    case 'DONE':
      window.$message.success(`更新成功`, {
        duration: 5000, closable: true
      })
      visible.value = false
      relaunch()
      break

    case 'ERROR':
      window.$message.error(`网络似乎出了问题，请检查你的网络设置`, {
        duration: 5000, closable: true
      })
      break
  }
})


const updateConfirm = async () => {
  isDownload.value = true

  // Install the update. This will also restart the app on Windows!
  await installUpdate()

  unlisten()
}

checkUpdate()
</script>

<style>

</style>