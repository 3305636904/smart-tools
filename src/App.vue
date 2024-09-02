<template>
  <naive-provider :class="['h-screen', {'shadow-gray-600': store.darkTheme }]">
    <lock-screen v-if="store.screenLocked" />
    <router-view v-else v-slot="{Component}">
      <transition
        :name="store.screenLocked ? 'fade-top' : 'fade-bottom'"
        mode="out-in"
        appear
      >
        <component :is="Component" />
      </transition>
    </router-view>  
  </naive-provider>
</template>

<script lang="ts" setup name="App">

import NaiveProvider from './components/NaiveProvider.vue'
import { useStore } from './store'
import LockScreen from './components/LockScreen.vue'

import { useSettings } from './components/Settings/useSettings'
const { changeThemeAuto } = useSettings()

const store = useStore()

changeThemeAuto()

</script>

<style>
#logo {
  display: block;
  width: 50%;
  height: 50%;
  margin: auto;
  padding: 10% 0 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-origin: content-box;
}

.fade-bottom-enter-active,
.fade-bottom-leave-active {
  transition: opacity 0.25s, transform 0.3s;
}

.fade-bottom-enter-from {
  opacity: 0;
  transform: translateY(-10%);
}

.fade-bottom-leave-to {
  opacity: 0;
  transform: translateY(10%);
}

.fade-top-enter-active,
.fade-top-leave-active {
  transition: opacity 0.2s, transform 0.25s;
}

.fade-top-enter-from {
  opacity: 0;
  transform: translateY(8%);
}

.fade-top-leave-to {
  opacity: 0;
  transform: translateY(-8%);
}
</style>
