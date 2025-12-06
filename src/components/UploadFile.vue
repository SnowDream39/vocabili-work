<template>
  <div class="max-w-120 p-4 border border-gray-200 rounded-md">
    <h2 class="small-title">文件上传 📤</h2>
    <div>务必确保文件名符合平时的规范</div>
    <input type="file" @change="onFileChange" />
    <div v-if="fileName">选择: {{ fileName }}</div>

    <el-button :disabled="!file" @click="upload">上传</el-button>

    <div v-if="progressVisible" class="progress">
      进度: {{ progress }}%
    </div>

    <div v-if="resultUrl">
      上传成功: <b>{{ resultUrl }}</b>
    </div>

    <div v-if="error" class="text-red-600">错误: {{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import api from '@/utils/api/api'
import { extractFileName, isBoardIdentity, type BoardIdentity } from '@/utils/filename'

const file = ref(null)
const fileName = ref('')
const progress = ref(0)
const progressVisible = ref(false)
const resultUrl = ref('')
const error = ref('')
const emit = defineEmits<{
  (e: 'addFile', value:  BoardIdentity): void
}>()


function onFileChange(e: any) {
  const f = e.target.files?.[0] ?? null
  file.value = f
  fileName.value = f ? f.name : ''
  progress.value = 0
  resultUrl.value = ''
  error.value = ''

  const identity = extractFileName(f.name)
  if (isBoardIdentity(identity)) {
    emit('addFile', identity)
  }
}

async function upload() {
  if (!file.value) return

  const form = new FormData()
  form.append('file', file.value)

  try {
    progressVisible.value = true
    const res = await api.uploadFile(file.value, progress)
    // 后端返回 { url: "/uploads/xxx.ext" }
    resultUrl.value = res.data.url ? res.data.url : ''
    error.value = ''
  } catch (err: any) {
    error.value = err?.response?.data?.message || err.message || '上传失败'
  } finally {
    progressVisible.value = false
  }
}
</script>

<style scoped>
</style>
