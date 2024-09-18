import { createApp } from 'vue'
import { store } from './store'
import { setOS } from './common/global'
import App from './App.vue'
import { router } from './router'
import './style.css'
import 'uno.css'

// import { invoke } from "@tauri-apps/api";

onMounted(() => {
  document.addEventListener('DOMContentLoaded', () =>{
    // invoke("close_loadingscreen")
  })
})

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')


setOS()