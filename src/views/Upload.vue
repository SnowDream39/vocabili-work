<template>
  <div class="flex flex-col items-center">
    <h1 class="big-title">在线更新数据库</h1>
    <div>测试中，勿动</div>
    <UploadFile @add-file="handleBoard" />
    <CheckFile v-if="fileIdentity" @checked="handleChecked" :identity="fileIdentity" />
    <UpdateRanking v-if="fileIdentity && checkStatus === 'success'" :identity="fileIdentity" />
  </div>
</template>

<script setup lang="ts">
import CheckFile from '@/components/CheckFile.vue';
import UpdateRanking from '@/components/UpdateRanking.vue';
import UploadFile from '@/components/UploadFile.vue';
import type { BoardIdentity, DataIdentity } from '@/utils/filename';
import { ref } from 'vue';

const fileIdentity = ref<BoardIdentity | DataIdentity | null>(null);
const checkStatus = ref('');

function handleBoard(identity: BoardIdentity) {
  fileIdentity.value = identity;
}

function handleChecked(status: string) {
  checkStatus.value = status;
}

</script>

<style scoped>

</style>
