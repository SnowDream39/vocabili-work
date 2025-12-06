<template>
  <div>
    <h2 class="small-title">更新数据</h2>
    <el-button @click="updateRanking">更新</el-button>

    <div v-if="status">{{ status }}</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>


<script setup lang="ts">
import { ElButton } from 'element-plus';
import { isBoardIdentity, type BoardIdentity, type DataIdentity } from '@/utils/filename';
import api from '@/utils/api/api';
import { ref } from 'vue';


const props = defineProps<{
  identity: BoardIdentity | DataIdentity;
}>()

const status = ref<string | null>(null)
const error = ref<string | null>(null)

async function updateRanking() {
  const { identity } = props;
  if (isBoardIdentity(identity)) {
    try {
      status.value = '更新中...';
      await api.updateRanking(identity.board, identity.part, identity.issue);
      status.value = '更新成功';
    } catch (err: any) {
      status.value = '更新失败';
      error.value = err?.response?.data?.message || err.message || '上传失败'
    }
  }
}

</script>
