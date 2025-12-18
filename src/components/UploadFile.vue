<template>
  <div class="w-full p-6 border border-gray-200 rounded-lg">
    <h2 class="text-xl font-semibold mb-4">文件上传</h2>
    <div class="mb-4 text-gray-600">务必确保文件名符合平时的规范</div>
    <input type="file" @change="onFileChange" class="mb-4" />
    <div v-if="fileName" class="mb-4">选择: {{ fileName }}</div>

    <div v-if="progressVisible" class="mb-4">
      进度: {{ Math.floor(progress*100) }}%
    </div>

    <div v-if="resultUrl" class="mb-4 text-green-600">
      上传成功: <b>{{ resultUrl }}</b>
    </div>

    <div v-if="error" class="text-red-600">错误: {{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '@/utils/api/api'
import { extractFileName, type BoardIdentity, type DataIdentity } from '@/utils/filename'

const file = ref(null)
const fileName = ref('')
const progress = ref(0)
const progressVisible = ref(false)
const resultUrl = ref('')
const error = ref('')
const identity = ref<BoardIdentity | DataIdentity>()
const emit = defineEmits<{
  (e: 'complete', value: BoardIdentity | DataIdentity): void
}>()

async function onFileChange(e: any) {
  const f = e.target.files?.[0] ?? null
  if (!f) return

  file.value = f
  fileName.value = f.name
  progress.value = 0
  resultUrl.value = ''
  error.value = ''

  identity.value = extractFileName(f.name)

  await upload()
}

async function upload() {
  if (!file.value) return

  try {
    progressVisible.value = true
    const res = await api.uploadFile(file.value, {
      onProgress: (p: number) => {progress.value = p},
      onComplete: () => { emit('complete', identity.value!) }
    })
    // 后端返回 { url: "/uploads/xxx.ext" }
    resultUrl.value = res.data?.url ?? ''
    error.value = ''
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? err?.message ?? '上传失败'
  } finally {
    progressVisible.value = false
  }
}
</script>

<style scoped>
</style>
