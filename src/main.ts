import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useAuthStore } from '@stores/useAuthStore'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@scss/main.scss'

const store = createPinia()
const app = createApp(App)
app.use(store)

// Pages render once restoreSession settles (DefaultLayout waits while status is 'restoring').
const authStore = useAuthStore()
authStore.startSessionListeners()
authStore.restoreSession()

app.mount('#app')
