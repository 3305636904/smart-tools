import { createApp } from 'vue'
import { store } from './store'
import { setOS } from './common/global'
import App from './App.vue'
import { router } from './router'
import './style.css'
import 'uno.css'

import { invoke } from "@tauri-apps/api";

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')
invoke("close_loadingscreen")

setOS()