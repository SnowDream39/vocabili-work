import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/styles.css'
import 'virtual:uno.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

app.config.errorHandler = (err: any) => {
  console.error('Vue Error:', err)
  ElMessage({
    message: err.message,
    type: 'error',
    duration: 3000, // 3秒后自动消失
    showClose: true,
    offset: 66
  })
}

// 监听深色模式
const media = window.matchMedia('(prefers-color-scheme: dark)')

function updateTheme() {
  if (media.matches) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

updateTheme()
