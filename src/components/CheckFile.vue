<template>
  <div>
    <h2 class="small-title">文件检查</h2>
    <el-form v-if="isBoardIdentity(props.identity)" :model="props.identity" label-width="80px">
      <el-form-item label="刊物">
        <el-select v-model="props.identity.board" placeholder="请选择" class="w-30!">
          <el-option v-for="(value, key) in boards" :key="key" :label="value" :value="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="榜">
        <el-select v-model="props.identity.part" placeholder="请选择" class="w-30!">
          <el-option v-for="(value, key) in parts" :key="key" :label="value" :value="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="期">
        <el-input v-model="props.identity.issue" class="w-30!"></el-input>
      </el-form-item>
    </el-form>
    <el-button @click="checkFile">检查</el-button>
    <div v-if="checkResult.status == 'success'">无错误</div>
    <div v-if="checkResult.status == 'failed'">{{ checkResult.detail }}</div>
  </div>
</template>


<script setup lang="ts">
import api from '@/utils/api/api';
import { isBoardIdentity, type BoardIdentity, type DataIdentity } from '@/utils/filename';
import { ElForm, ElFormItem, ElOption, ElSelect, ElInput, ElButton } from 'element-plus';
import { ref } from 'vue';

const props = defineProps<{
  identity: BoardIdentity | DataIdentity
}>()

type CheckStatus = 'waiting' | 'success' | 'failed';

const emits = defineEmits<{
  (e: 'checked', status: 'success' | 'failed'): void
}>()
const checkResult = ref<{
  status: CheckStatus,
  detail: string
}>({
  status: 'waiting',
  detail: '',
});

const boards = {
  'vocaloid-daily': '日刊',
  'vocaloid-weekly': '周刊',
  'vocaloid-monthly': '月刊',
}

const parts = {
  'main': '主榜',
  'new': '新曲榜',
}

async function checkFile() {
  if (isBoardIdentity(props.identity)) {
    const form = props.identity;
    const res = await api.checkFile(form.board, form.part, form.issue);
    if (res.data.detail === ''){
      checkResult.value = {
        status: 'success',
        detail: ''
      };
    } else {
      checkResult.value = {
        status: 'failed',
        detail: res.data.detail
      };
    }
    // @ts-ignore
    emits('checked', checkResult.value.status);
  }
}

</script>
