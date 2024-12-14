import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@scss/main.scss'

const store = createPinia()
const app = createApp(App)
app.use(store)
app.mount('#app')