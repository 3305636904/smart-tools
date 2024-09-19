<template>
  <div class="fixed flex flex-col bottom-8 right-4 z-9999">
    <n-tooltip placement="top-end" trigger="hover">
      <template #trigger>
        <n-button class="mb-2" circle size="large" @click="themeSwitch">
          <template #icon>
            <n-icon>
              <i-line-md-sunny-outline-loop v-if="!store.darkTheme" />
              <i-line-md-moon v-else />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ store.darkTheme ? '切换到浅色模式' : '切换到深色模式' }}
    </n-tooltip>
    <n-tooltip placement="top-end" trigger="hover">
      <template #trigger>
        <n-button
          class="mb-2"
          circle
          size="large"
          @click="store.screenLocked = true"
        >
          <template #icon>
            <n-icon>
              <i-material-symbols-lock-outline />
            </n-icon>
          </template>
        </n-button>
      </template>
      锁屏
    </n-tooltip>
    <!-- <n-tooltip placement="top-end" trigger="hover">
      <template #trigger>
        <n-button
          class="mb-2"
          circle
          size="large"
          @click="store.fullscreen = !store.fullscreen"
        >
          <template #icon>
            <n-icon>
              <i-material-symbols-fullscreen-rounded v-if="!store.fullscreen" />
              <i-material-symbols-fullscreen-exit-rounded v-else />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ store.fullscreen ? '退出全屏' : '全屏' }}
    </n-tooltip> -->
    <n-tooltip placement="top-end" trigger="hover">
      <template #trigger>
        <n-button
          class="mb-2"
          circle
          @click="showSetting"
          size="large"
        >
          <template #icon>
            <n-icon>
              <IUilSetting />
            </n-icon>
          </template>
        </n-button>
      </template>
      设置
    </n-tooltip>
  </div>
  <Settings ref="settingRef" />
</template>
<script lang="ts" setup>
import { useStore } from '../store'

const store = useStore()

const settingRef = ref()
const themeSwitch = () => {
  store.darkTheme = !store.darkTheme
  window.$loading.start()
  setTimeout(() => {
    window.$loading.finish()
  }, 100)
}

const showSetting = async () => {
  settingRef?.value.showSetting()
}
</script>
