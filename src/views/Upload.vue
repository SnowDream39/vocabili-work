<template>
  <div class="flex flex-col items-center">
    <h1 class="big-title">在线更新数据库</h1>
    <div>非相关人员勿动</div>

    <div class="w-full max-w-4xl mt-8">
      <!-- 文件上传区域 -->
      <UploadFile @add-file="handleUploadFile" />
    </div>

    <!-- 排名文件处理弹窗 -->
    <el-dialog
      v-model="boardDialogVisible"
      title="排名文件处理"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="boardIdentity" class="space-y-4">
        <!-- 文件信息显示 -->
        <div class="p-4 rounded">
          <h3 class="font-semibold mb-2">文件信息：</h3>
          <p><strong>刊物：</strong>{{ boards[boardIdentity.board] }}</p>
          <p><strong>榜单：</strong>{{ parts[boardIdentity.part] }}</p>
          <p><strong>期数：</strong>{{ boardIdentity.issue }}</p>
        </div>

        <!-- 检查结果 -->
        <div v-if="boardCheckStatus">
          <h3 class="font-semibold mb-2">检查结果：</h3>
          <div v-if="boardCheckStatus === 'success'" class="text-green-600">
            ✓ 文件检查通过
          </div>
          <div v-else-if="boardCheckStatus === 'failed'" class="text-red-600">
            ✗ 文件检查失败：{{ boardCheckError }}
          </div>
          <div v-else-if="boardChecking" class="text-blue-600">
            检查中...
          </div>
        </div>

        <!-- 更新结果 -->
        <div v-if="boardUpdateStatus">
          <h3 class="font-semibold mb-2">更新结果：</h3>
          <div v-if="boardUpdateStatus === 'success'" class="text-green-600">
            ✓ 数据更新成功
          </div>
          <div v-else-if="boardUpdateStatus === 'failed'" class="text-red-600">
            ✗ 数据更新失败：{{ boardUpdateError }}
          </div>
          <div v-else-if="boardUpdateStatus === 'updating'" class="text-blue-600">
            更新中...
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="boardDialogVisible = false">取消</el-button>
          <el-button
            v-if="!boardCheckStatus"
            type="primary"
            @click="handleBoardCheck"
            :loading="boardChecking"
          >
            检查文件
          </el-button>
          <el-button
            v-if="boardCheckStatus === 'success'"
            type="primary"
            @click="handleBoardUpdate"
            :loading="boardUpdating"
          >
            确定更新
          </el-button>
          <el-button
            v-if="boardUpdateStatus === 'success'"
            type="success"
            @click="handleBoardComplete"
          >
            完成
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 数据文件处理弹窗 -->
    <el-dialog
      v-model="dataDialogVisible"
      title="数据文件处理"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="dataIdentity" class="space-y-4">
        <!-- 文件信息显示 -->
        <div class="p-4 rounded">
          <h3 class="font-semibold mb-2">文件信息：</h3>
          <p><strong>日期：</strong>{{ dataIdentity.date.toFormat('yyyy-MM-dd') }}</p>
        </div>

        <!-- 数据文件处理结果 -->
        <div v-if="dataStatus">
          <h3 class="font-semibold mb-2">处理结果：</h3>
          <div v-if="dataStatus === 'success'" class="text-green-600">
            ✓ 数据文件处理成功
          </div>
          <div v-else-if="dataStatus === 'failed'" class="text-red-600">
            ✗ 数据文件处理失败：{{ dataError }}
          </div>
          <div v-else-if="dataStatus === 'processing'" class="text-blue-600">
            处理中...
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button
            v-if="dataStatus !== 'processing'"
            @click="dataDialogVisible = false"
          >
            {{ dataStatus === 'success' ? '关闭' : '取消' }}
          </el-button>
          <el-button
            v-if="dataStatus === 'success'"
            type="success"
            @click="handleDataComplete"
          >
            完成
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import UploadFile from '@/components/UploadFile.vue';
import type { BoardIdentity, DataIdentity } from '@/utils/filename';
import { isBoardIdentity, isDataIdentity } from '@/utils/filename';
import { ref } from 'vue';
import { ElDialog, ElButton } from 'element-plus';
import api from '@/utils/api/api';

// 排名文件相关状态
const boardIdentity = ref<BoardIdentity | null>(null);
const boardDialogVisible = ref(false);
const boardCheckStatus = ref<'success' | 'failed' | ''>('');
const boardCheckError = ref('');
const boardUpdateStatus = ref<'success' | 'failed' | 'updating' | ''>('');
const boardUpdateError = ref('');
const boardChecking = ref(false);
const boardUpdating = ref(false);

// 数据文件相关状态
const dataIdentity = ref<DataIdentity | null>(null);
const dataDialogVisible = ref(false);
const dataStatus = ref<'success' | 'failed' | 'processing' | ''>('');
const dataError = ref('');
const dataProcessing = ref(false);

const boards = {
  'vocaloid-daily': '日刊',
  'vocaloid-weekly': '周刊',
  'vocaloid-monthly': '月刊',
};

const parts = {
  'main': '主榜',
  'new': '新曲榜',
};



function handleUploadFile(identity: BoardIdentity | DataIdentity) {
  if (isBoardIdentity(identity)) {
    handleBoardFile(identity);
  } else if (isDataIdentity(identity)) {
    handleDataFile(identity);
  }
}

function handleBoardFile(identity: BoardIdentity) {
  boardIdentity.value = identity;
  boardCheckStatus.value = '';
  boardUpdateStatus.value = '';
  boardCheckError.value = '';
  boardUpdateError.value = '';
  boardDialogVisible.value = true;
}

function handleDataFile(identity: DataIdentity) {
  dataIdentity.value = identity;
  dataStatus.value = '';
  dataError.value = '';
  dataDialogVisible.value = true;
  // 直接开始处理数据文件
  handleDataProcess();
}

async function handleBoardCheck() {
  if (!boardIdentity.value) return;

  boardChecking.value = true;
  try {
    const res = await api.checkFile(
      boardIdentity.value.board,
      boardIdentity.value.part,
      boardIdentity.value.issue
    );
    if (res.detail === '') {
      boardCheckStatus.value = 'success';
      boardCheckError.value = '';
    } else {
      boardCheckStatus.value = 'failed';
      boardCheckError.value = res.detail;
    }
  } catch (err: any) {
    boardCheckStatus.value = 'failed';
    boardCheckError.value = err?.response?.data?.message || err.message || '检查失败';
  } finally {
    boardChecking.value = false;
  }
}

async function handleBoardUpdate() {
  if (!boardIdentity.value) return;

  boardUpdating.value = true;
  boardUpdateStatus.value = 'updating';
  try {
    await api.updateRanking(
      boardIdentity.value.board,
      boardIdentity.value.part,
      boardIdentity.value.issue
    );
    boardUpdateStatus.value = 'success';
    boardUpdateError.value = '';
  } catch (err: any) {
    boardUpdateStatus.value = 'failed';
    boardUpdateError.value = err?.response?.data?.message || err.message || '更新失败';
  } finally {
    boardUpdating.value = false;
  }
}

function handleBoardComplete() {
  boardDialogVisible.value = false;
  boardIdentity.value = null;
  boardCheckStatus.value = '';
  boardUpdateStatus.value = '';
  boardCheckError.value = '';
  boardUpdateError.value = '';
}

async function handleDataProcess() {
  if (!dataIdentity.value) return;

  dataProcessing.value = true;
  dataStatus.value = 'processing';
  try {
    await api.updateSnapshot(dataIdentity.value.date.toFormat('yyyy-MM-dd'));
    dataStatus.value = 'success';
    dataError.value = '';
  } catch (err: any) {
    dataStatus.value = 'failed';
    dataError.value = err?.response?.data?.message || err.message || '处理失败';
  } finally {
    dataProcessing.value = false;
  }
}

function handleDataComplete() {
  dataDialogVisible.value = false;
  dataIdentity.value = null;
  dataStatus.value = '';
  dataError.value = '';
}

</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
