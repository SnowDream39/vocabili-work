<template>
  <div class="p-5 max-w-2xl mx-auto">
    <div class="bg-surface p-8 rounded-lg shadow-md">
      <h3 class="text-xl font-bold text-on-surface text-center mb-6">编辑视频信息</h3>

      <!-- 搜索区域 -->
      <div class="mb-6">
        <label class="block mb-2 font-medium text-on-surface">视频BV号：</label>
        <div class="flex gap-2">
          <el-input
            v-model="searchBvid"
            placeholder="请输入视频BV号"
            class="flex-1"
          />
          <el-button
            type="primary"
            @click="handleSearch"
            :loading="searching"
            :disabled="!searchBvid"
          >
            搜索
          </el-button>
        </div>
      </div>

      <!-- 编辑区域 -->
      <div v-if="videoInfo" class="space-y-5">
        <div class="mb-5">
          <label class="block mb-2 font-medium text-on-surface">BV号：</label>
          <el-input v-model="videoInfo.bvid" disabled class="w-full" />
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-medium text-on-surface">视频标题：</label>
          <el-input v-model="videoInfo.title" placeholder="请输入视频标题" class="w-full" />
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-medium text-on-surface">版权类型：</label>
          <el-select v-model="videoInfo.copyright" placeholder="请选择版权类型" class="w-full">
            <el-option
              v-for="copyright in copyrightOptions"
              :key="copyright.value"
              :label="copyright.label"
              :value="copyright.value"
            />
          </el-select>
        </div>

        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          class="w-full"
        >
          提交更新
        </el-button>
      </div>
    </div>

    <!-- 确认对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="确认更新视频信息"
      width="500px"
      :before-close="handleClose"
    >
      <div class="py-5">
        <div class="space-y-4">
          <div class="flex items-center">
            <label class="w-30 font-medium text-on-surface">BV号：</label>
            <span class="text-gray-600">{{ originalVideo?.bvid }}</span>
          </div>
          <div v-if="videoInfo?.title !== originalVideo?.title" class="flex items-center">
            <label class="w-30 font-medium text-on-surface">视频标题：</label>
            <span class="text-gray-500 line-through">{{ originalVideo?.title }}</span>
            <span class="mx-2">→</span>
            <span class="text-blue-500 font-medium">{{ videoInfo?.title }}</span>
          </div>
          <div v-if="videoInfo?.copyright !== originalVideo?.copyright" class="flex items-center">
            <label class="w-30 font-medium text-on-surface">版权类型：</label>
            <span class="text-gray-500 line-through">{{ getCopyrightLabel(originalVideo?.copyright) }}</span>
            <span class="mx-2">→</span>
            <span class="text-blue-500 font-medium">{{ getCopyrightLabel(videoInfo?.copyright) }}</span>
          </div>
          <div v-if="!hasChanges" class="flex items-center">
            <label class="w-30 font-medium text-on-surface">状态：</label>
            <span class="text-gray-500">没有检测到任何变化</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="text-right">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="confirmEdit" :loading="submitting">
            确认更新
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElDialog, ElButton, ElMessage, ElSelect, ElOption, ElInput } from 'element-plus'
import api from '@/utils/api/api'
import type { VideoInfo, Copyright } from '@/utils/types'

const dialogVisible = ref(false)
const searching = ref(false)
const submitting = ref(false)
const searchBvid = ref<string>('')
const videoInfo = ref<VideoInfo | null>(null)
const originalVideo = ref<VideoInfo | null>(null)

const copyrightOptions = [
  { label: '自制', value: 1 },
  { label: '转载', value: 2 },
  { label: '薛定谔态', value: 3 },
  { label: '转载投自制', value: 101 },
  { label: '自制投转载', value: 100 }
]

const hasChanges = computed(() => {
  if (!videoInfo.value || !originalVideo.value) return false
  return JSON.stringify(videoInfo.value) !== JSON.stringify(originalVideo.value)
})

const getCopyrightLabel = (copyright?: Copyright) => {
  const option = copyrightOptions.find(opt => opt.value === copyright)
  return option?.label || '未知'
}

const emit = defineEmits<{
  success: []
  error: [error: string]
}>()

const handleSearch = async () => {
  if (!searchBvid.value.trim()) {
    ElMessage.warning('请输入视频BV号')
    return
  }

  try {
    searching.value = true
    const result = await api.selectVideo(searchBvid.value)

    videoInfo.value = { ...result.data }
    originalVideo.value = { ...result.data }
    ElMessage.success('视频信息获取成功')
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '获取视频信息失败'
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
    videoInfo.value = null
    originalVideo.value = null
  } finally {
    searching.value = false
  }
}

const handleSubmit = async () => {
  if (!videoInfo.value) {
    ElMessage.warning('没有可提交的视频信息')
    return
  }

  if (!videoInfo.value.title.trim()) {
    ElMessage.warning('请输入视频标题')
    return
  }

  if (!videoInfo.value.copyright) {
    ElMessage.warning('请选择版权类型')
    return
  }

  // 检查是否有变化
  if (JSON.stringify(videoInfo.value) === JSON.stringify(originalVideo.value)) {
    ElMessage.warning('没有检测到任何变化')
    return
  }

  dialogVisible.value = true
}

const confirmEdit = async () => {
  if (!videoInfo.value) {
    ElMessage.error('视频信息不存在')
    return
  }

  try {
    submitting.value = true
    await api.editVideo(videoInfo.value)
    ElMessage.success('视频信息更新成功')
    dialogVisible.value = false

    // 重新获取最新信息
    if (videoInfo.value.bvid) {
      await handleSearch()
    }

    emit('success')
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || error.message || '更新视频信息失败'
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleClose = () => {
  handleCancel()
}

defineExpose({
  handleSearch
})
</script>

<style scoped>
/* 所有样式已替换为Tailwind CSS */
</style>
