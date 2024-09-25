<template>
  <n-button circle class="fixed bottom-1 right-1 z-9999 cursor-pointer" @click.stop="switchBtnHandle">
    <i-MaterialSymbolsArrowLeftRounded :class="['text-22px transition-all-300',showBtn ? 'transform-rotate-180' : '']"/>
  </n-button>
  <div class="fixed flex flex-col bottom-10 right-1 z-9999" v-if="showBtn">
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

const showBtn = ref<Boolean>(false)

function switchBtnHandle() {
  showBtn.value = !showBtn.value
}

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
