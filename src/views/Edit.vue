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
import EditName from '@/components/EditPanels/EditName.vue';
import EditSong from '@/components/EditPanels/EditSong.vue';
import EditVideo from '@/components/EditPanels/EditVideo.vue';
const activeTab = ref<string>('edit-artist');

const tabs = [
  {
    label: '艺术家',
    name: 'edit-artist',
    component: EditName,
  },
  {
    label: '歌曲',
    name: 'edit-song',
    component: EditSong,
  },
  {
    label: '视频',
    name: 'edit-video',
    component: EditVideo,
  }
]
</script>
