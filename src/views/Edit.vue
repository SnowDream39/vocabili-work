<template>
  <div class="flex flex-col items-center">
    <div class="big-title">编辑信息</div>
    <el-tabs v-model="activeTab" class="w-full">
      <el-tab-pane v-for="tab in tabs" :label="tab.label" :name="tab.name">
        <component :is="tab.component" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>



<script setup lang="ts">
import { ElTabs, ElTabPane } from 'element-plus';
import { ref } from 'vue';
import EditName from '@/components/EditName.vue';
import EditWork from '@/components/EditWork.vue';
const activeTab = ref<string>('edit-artist');

const tabs = [
  {
    label: '编辑艺术家信息',
    name: 'edit-artist',
    component: EditName,
  },
]
</script>
