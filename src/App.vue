<template>
  <el-config-provider :locale="zhCn">
    <Header />
    <main class="w-full grow">
      <RouterView/>
    </main>
    <footer>

    </footer>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import { zhCn } from 'element-plus/es/locales.mjs';
import Header from './components/Header.vue';
</script>
