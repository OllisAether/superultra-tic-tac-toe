import { createApp } from 'vue'
import './scss/main.scss'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { vuetify } from './vuetify'

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(pinia)
  .use(vuetify)
  .mount('#app')
