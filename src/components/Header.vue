<template>
  <header class="h-10 w-full grid grid-cols-3 items-stretch justify-stretch">
    <router-link v-for="nav in navs" :to="nav.path" class="surface-clickable flex items-center justify-center">
      <div class="text-link">{{ nav.name }}</div>
    </router-link>

  </header>

</template>

<script setup lang="ts">

const navs = [
  {
    name: '打标',
    path: '/mark'
  },
  {
    name: '上传',
    path: '/upload'
  },
  {
    name: '编辑',
    path: '/edit'
  }
]

</script>
