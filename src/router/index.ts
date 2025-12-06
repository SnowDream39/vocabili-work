import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/Home.vue') },
  { path: '/mark', component: () => import('@/views/Mark.vue') },
  { path: '/upload', component: () => import('@/views/Upload.vue') },
  { path: '/edit', component: () => import('@/views/Edit.vue') },
 { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
