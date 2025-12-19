<template>
  <div class="p-5 max-w-2xl mx-auto">
    <div class="bg-surface p-8 rounded-lg shadow-md">
      <h3 class="text-xl font-bold text-on-surface text-center mb-6">编辑艺术家信息</h3>
      <div class="mb-5">
        <label class="block mb-2 font-medium text-on-surface">类型：</label>
        <el-select v-model="editForm.type" placeholder="请选择类型" class="w-full">
          <el-option v-for="item in artistTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="mb-5">
        <label class="block mb-2 font-medium text-on-surface">ID：</label>
        <el-input v-model.number="editForm.id" placeholder="请输入ID" type="number" @blur="handleSelectOldName" class="w-full" />
        <div v-if="old_name">{{ old_name }}</div>
      </div>
      <div class="mb-5">
        <label class="block mb-2 font-medium text-on-surface">新名称：</label>
        <el-input v-model="editForm.name" placeholder="请输入新的艺术家名称" class="w-full" />
      </div>
      <el-button type="primary" @click="handleSubmit" :loading="confirming" class="w-full">
        提交编辑请求
      </el-button>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="确认编辑艺术家信息"
      width="500px"
      :before-close="handleClose"
    >
    <div class="py-5">
      <template v-if="editData?.new_artist">
        <div class="flex items-center mb-4">
          <label class="w-30 font-medium text-on-surface">原有实体：</label>
          <span class="text-gray-500 line-through">{{ editData?.old_artist.name }}</span>
        </div>
        <div class="flex items-center mb-4">
          <label class="w-30 font-medium text-on-surface">合并目标：</label>
          <span class="text-blue-500 font-medium">{{ editData?.new_artist.name }}</span>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center mb-4">
          <label class="w-30 font-medium text-on-surface">原名：</label>
          <span class="text-gray-500 line-through">{{ editData?.old_artist.name }}</span>
        </div>
        <div class="flex items-center mb-4">
          <label class="w-30 font-medium text-on-surface">修改名称：</label>
          <span class="text-blue-500 font-medium">{{ editForm.name }}</span>
        </div>
      </template>
      <div class="flex items-center mb-4">
        <label class="w-30 font-medium text-on-surface">任务ID：</label>
        <span class="text-green-500 font-mono bg-blue-50 px-2 py-1 rounded">{{ editData?.task_id }}</span>
      </div>
    </div>

    <template #footer>
      <div class="text-right">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="confirmEdit" :loading="confirming">
          确认编辑
        </el-button>
      </div>
    </template>
  </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElButton, ElMessage, ElSelect, ElOption, ElInput } from 'element-plus'
import api from '@/utils/api/api'

interface Artist {
  id: number
  name: string
}


interface EditData {
  task_id: string
  old_artist: Artist
  new_artist: Artist
}

const dialogVisible = ref(false)
const confirming = ref(false)
const editData = ref<EditData | null>(null)
const old_name = ref<string>()
const editForm = ref({
  type: 'producer',
  id: 0,
  name: ''
})

const artistTypes = [
  { label: '歌手', value: 'vocalist' },
  { label: '作者', value: 'producer' },
  { label: 'UP主', value: 'uploader' },
  { label: '引擎', value: 'synthesizer' }
]

const emit = defineEmits<{
  success: []
  error: [error: string]
}>()

const handleSubmit = async () => {
  if (!editForm.value.type || !editForm.value.id || !editForm.value.name) {
    ElMessage.warning('请填写完整信息')
    return
  }

  await showEditDialog(editForm.value.type, Number(editForm.value.id), editForm.value.name)
}

const handleSelectOldName = async () => {
  if (!editForm.value.type || !editForm.value.id) {
    return
  }

  try {
    confirming.value = true
    const result = await api.selectArtist(editForm.value.type, editForm.value.id)
    if (result.data) {
      old_name.value = result.data.name
    }
    confirming.value = false
  } catch (error: any) {}
}

const showEditDialog = async (type: string, id: number, name: string) => {
  try {
    confirming.value = true
    const result = await api.editArtistCheck(type, id, name)
    console.log('result', result)

    if (result.task_id && result.old_artist) {
      editData.value = result
      dialogVisible.value = true
    } else {
      ElMessage.error('返回数据格式错误')
      emit('error', '返回数据格式错误')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '检查编辑请求失败'
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
  } finally {
    confirming.value = false
  }
}

const confirmEdit = async () => {
  if (!editData.value?.task_id) {
    ElMessage.error('任务ID不存在')
    return
  }

  try {
    confirming.value = true
    await api.editArtistConfirm(editData.value.task_id)
    ElMessage.success('编辑确认成功')
    dialogVisible.value = false
    emit('success')
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || '确认编辑失败'
    ElMessage.error(errorMsg)
    emit('error', errorMsg)
  } finally {
    confirming.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
  editData.value = null
}

const handleClose = () => {
  handleCancel()
}

defineExpose({
  showEditDialog
})
</script>

<style scoped>
/* 所有样式已替换为Tailwind CSS */
</style>
