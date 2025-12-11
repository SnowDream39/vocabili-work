<template>
  <div v-if="props.useHint">
    <!-- 已选择的标签 -->
    <div class="mb-2">
      <el-tag
        v-for="(tag, index) in tags"
        :key="index"
        closable
        @close="removeTag(index)"
        class="mr-2"
      >
        {{ tag }}
      </el-tag>
    </div>

    <!-- 输入框 + 搜索 -->
    <div class="flex gap-2">
      <el-autocomplete
        v-if="props.useHint"
        v-model="input"
        :fetch-suggestions="querySearch"
        placeholder="输入标签..."
        @select="handleSelect"
        :select-when-unmatched="true"
        clearable
        @keyup.enter="handleAddTag"
        class="flex-1"
      />
      <el-button
        v-if="isMobile"
        type="primary"
        @click="handleAddTag"
        :disabled="!input.trim()"
        class="flex-shrink-0 text-sm px-3 py-2 md:text-base md:px-4 md:py-2"
      >
        添加
      </el-button>
    </div>

  </div>

  <div v-else>
    <el-input-tag
      v-model="tags"
    >
      <template #tag="{ value }">
        <span>{{ svMap[value] }}</span>
      </template>
    </el-input-tag>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { ElMessage } from "element-plus"
import { ElTag, ElAutocomplete, ElInputTag } from "element-plus";
import { useMediaQuery } from "@vueuse/core";
import api from "@/utils/api/api";

const props = defineProps<{
  type: string
  useHint: boolean
}>()

const value = defineModel<string>({required: true})

// 标签列表
const tags = ref<string[]>([])
// 输入框
const input = ref<string>("")
// 移动端检测
const isMobile = useMediaQuery("(max-width: 768px)")

// SV榜使用的子榜单
const svMap = ref<Record<string, any>>({
  '1': 'SV榜',
  '2': '国产榜',
  '3': 'UTAU榜',
})
// ============ 交互操作逻辑 ==========

// 模拟搜索 API
async function apiSearch(query: string): Promise<string[]> {
  const response: any = await api.search(props.type, query)
  return response.data.map((item: any) => item.name)
}


async function querySearch(query: string, cb: any) {
  console.log(query)
  if (query) {
    const results = await apiSearch(query)
    cb(results.map((item: string) => ({ value: item })))
    return results.map((item: string) => ({ value: item }))
  } else {
    return []
  }
}

// 选择结果
function handleSelect(item: Record<string, any>) {
  if (!tags.value.includes(item.value)) {
    tags.value.push(item.value)
  } else {
    ElMessage.warning("已经添加过该标签了")
  }
  input.value = ""
}

// 添加标签（通过按钮或回车）
function handleAddTag() {
  const trimmedInput = input.value.trim()
  if (!trimmedInput) {
    return
  }

  if (!tags.value.includes(trimmedInput)) {
    tags.value.push(trimmedInput)
    input.value = ""
  } else {
    ElMessage.warning("已经添加过该标签了")
  }
}


// 删除标签
function removeTag(index: number) {
  tags.value.splice(index, 1)
}

// =========== 底层 ==========

onMounted(() => {
  if (value.value) {
    tags.value = value.value.split("、")
  }
})

watch(() => tags.value.length, () => {
  value.value = tags.value.join("、")
})



</script>
