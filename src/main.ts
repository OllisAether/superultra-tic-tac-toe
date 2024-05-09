import { createApp } from 'vue'
import './scss/main.scss'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(pinia)
  .mount('#app')
