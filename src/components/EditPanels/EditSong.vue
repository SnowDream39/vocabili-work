<template>
  <div class="p-5 max-w-2xl mx-auto">
    <div class="bg-surface p-8 rounded-lg shadow-md">
      <h3 class="text-xl font-bold text-on-surface text-center mb-6">编辑歌曲信息</h3>

      <!-- 搜索区域 -->
      <div class="mb-6">
        <label class="block mb-2 font-medium text-on-surface">歌曲ID：</label>
        <div class="flex gap-2">
          <el-input
            v-model.number="searchId"
            placeholder="请输入歌曲ID"
            type="number"
            class="flex-1"
          />
          <el-button
            type="primary"
            @click="handleSearch"
            :loading="searching"
            :disabled="!searchId"
          >
            搜索
          </el-button>
        </div>
      </div>

      <!-- 编辑区域 -->
      <div v-if="songInfo" class="space-y-5">
        <div class="mb-5">
          <label class="block mb-2 font-medium text-on-surface">ID：</label>
          <el-input v-model.number="songInfo.id" disabled type="number" class="w-full" />
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-medium text-on-surface">歌曲名称：</label>
          <el-input v-model="songInfo.name" placeholder="请输入歌曲名称" class="w-full" />
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-medium text-on-surface">类型：</label>
          <el-select v-model="songInfo.type" placeholder="请选择歌曲类型" class="w-full">
            <el-option
              v-for="type in songTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-medium text-on-surface">VocaDB ID：</label>
          <el-input v-model.number="songInfo.vocadb_id" placeholder="请输入VocaDB ID" type="number" class="w-full" />
        </div>

        <div class="mb-5">
          <label class="block mb-2 font-medium text-on-surface">显示名称：</label>
          <el-input v-model="songInfo.display_name" placeholder="请输入显示名称" class="w-full" />
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
      title="确认更新歌曲信息"
      width="500px"
      :before-close="handleClose"
    >
      <div class="py-5">
        <div class="space-y-4">
          <div class="flex items-center">
            <label class="w-30 font-medium text-on-surface">歌曲ID：</label>
            <span class="text-gray-600">{{ originalSong?.id }}</span>
          </div>
          <div v-if="songInfo?.name !== originalSong?.name" class="flex items-center">
            <label class="w-30 font-medium text-on-surface">歌曲名称：</label>
            <span class="text-gray-500 line-through">{{ originalSong?.name }}</span>
            <span class="mx-2">→</span>
            <span class="text-blue-500 font-medium">{{ songInfo?.name }}</span>
          </div>
          <div v-if="songInfo?.type !== originalSong?.type" class="flex items-center">
            <label class="w-30 font-medium text-on-surface">类型：</label>
            <span class="text-gray-500 line-through">{{ originalSong?.type }}</span>
            <span class="mx-2">→</span>
            <span class="text-blue-500 font-medium">{{ songInfo?.type }}</span>
          </div>
          <div v-if="songInfo?.vocadb_id !== originalSong?.vocadb_id" class="flex items-center">
            <label class="w-30 font-medium text-on-surface">VocaDB ID：</label>
            <span class="text-gray-500 line-through">{{ originalSong?.vocadb_id || '空' }}</span>
            <span class="mx-2">→</span>
            <span class="text-blue-500 font-medium">{{ songInfo?.vocadb_id || '空' }}</span>
          </div>
          <div v-if="songInfo?.display_name !== originalSong?.display_name" class="flex items-center">
            <label class="w-30 font-medium text-on-surface">显示名称：</label>
            <span class="text-gray-500 line-through">{{ originalSong?.display_name || '空' }}</span>
            <span class="mx-2">→</span>
            <span class="text-blue-500 font-medium">{{ songInfo?.display_name || '空' }}</span>
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
import type { SongInfo, SongType } from '@/utils/types'

const dialogVisible = ref(false)
const searching = ref(false)
const submitting = ref(false)
const searchId = ref<number | null>(null)
const songInfo = ref<SongInfo | null>(null)
const originalSong = ref<SongInfo | null>(null)

const songTypes: SongType[] = ['原创', '翻唱', '本家重置', '串烧']

const hasChanges = computed(() => {
  if (!songInfo.value || !originalSong.value) return false
  return JSON.stringify(songInfo.value) !== JSON.stringify(originalSong.value)
})

const emit = defineEmits<{
  success: []
  error: [error: string]
}>()

const handleSearch = async () => {
  if (!searchId.value) {
    ElMessage.warning('请输入歌曲ID')
    return
  }

  try {
    searching.value = true
    const result = await api.selectSong(searchId.value)

    songInfo.value = { ...result.data }
    originalSong.value = { ...result.data }
    ElMessage.success('歌曲信息获取成功')
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '获取歌曲信息失败'
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
    songInfo.value = null
    originalSong.value = null
  } finally {
    searching.value = false
  }
}

const handleSubmit = async () => {
  if (!songInfo.value) {
    ElMessage.warning('没有可提交的歌曲信息')
    return
  }

  if (!songInfo.value.name.trim()) {
    ElMessage.warning('请输入歌曲名称')
    return
  }

  if (!songInfo.value.type) {
    ElMessage.warning('请选择歌曲类型')
    return
  }

  // 检查是否有变化
  if (JSON.stringify(songInfo.value) === JSON.stringify(originalSong.value)) {
    ElMessage.warning('没有检测到任何变化')
    return
  }

  dialogVisible.value = true
}

const confirmEdit = async () => {
  if (!songInfo.value) {
    ElMessage.error('歌曲信息不存在')
    return
  }

  try {
    submitting.value = true
    await api.editSong(songInfo.value)
    ElMessage.success('歌曲信息更新成功')
    dialogVisible.value = false

    // 重新获取最新信息
    if (songInfo.value.id) {
      await handleSearch()
    }

    emit('success')
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || error.message || '更新歌曲信息失败'
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
