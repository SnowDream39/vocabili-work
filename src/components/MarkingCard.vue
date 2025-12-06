<template>
  <SuspendPanel
    class="marking-card max-w-150 w-full p-4"
    :class="{
      'bg-yellow-200/70!': record.status == 'auto',
      'bg-sky-200/70!': record.status == 'done',
    }"
  >
    <div class="w-full sm:grid sm:grid-cols-[1fr_2fr]">
      <div name="left" class=" mx-2" :title="record.title" >
        <a :href="props.svmode ? `https://www.bilibili.com/video/av${record.aid}` :  `https://www.bilibili.com/video/${record.bvid}`" target="_blank">
          <img :src="record.image_url" alt="thumbnail" class="w-full" referrerpolicy="no-referrer" />
        </a>
        <el-switch v-model="includeEntries[index]" active-text="收录" class="mb-2" />
        <div v-if="record.status == 'auto'" class="font-bold">AI打标</div>
      </div>
      <div name="right" class="grow" >
        <div class="text-lg font-bold">{{ record.title }}</div>
        <div class="grid grid-cols-1 grid-rows-[repeat(8,auto)] lg:grid-cols-2 lg:grid-rows-[repeat(4,auto)]">
          <div v-for="field in fields" class="flex flex-row w-full">
            <span class="w-15">{{ field.label }}</span>
            <div v-if="field.type === 'string-hint'" class="flex flex-nowrap grow">
              <el-autocomplete
                v-model="record[field.prop]"
                :fetch-suggestions="queryName"
                @select="selectName"
                style="height: 30px"
              ></el-autocomplete>
              <div v-if="song">
                <a target="_blank" :href="`https://vocabili.top/song/${song.id}`" >
                  <el-button type="primary">页面</el-button>
                </a>
              </div>
            </div>
            <MarkingTags
              v-if="['tags', 'tags-hint'].includes(field.type)"
              :type="field.search ?? field.prop"
              :use-hint="field.type == 'tags-hint'"
              v-model="record[field.prop]"
            ></MarkingTags>
            <el-select
              v-if="field.type === 'select'"
              v-model="record[field.prop]"
              style="height: 30px"
            >
              <el-option
                v-for="item of field.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div>时长：{{ record.duration }}</div>
          <div>分P：{{ record.page }}</div>
        </div>
      </div>
    </div>
    <div>
      <div class="max-h-12 overflow-hidden">{{ record.intro }}</div>
    </div>

  </SuspendPanel>
</template>

<script lang="ts" setup>
import { ElAutocomplete, ElSelect, ElSwitch, ElOption, ElButton } from 'element-plus';
import MarkingTags from '@/components/MarkingTags.vue';
import SuspendPanel from '@/components/SuspendPanel.vue';
import { requester } from '@/utils/api/requester';
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
  record: any
  includeEntries: any[]
  index: number
  svmode: boolean
}>();

const fields = props.svmode ? [
  { type:'tags', label: '榜单', prop: 'synthesizer', },
  { type:'select', label: '版权', prop: 'copyright', options: [
    {value:1, label: '自制'},
    {value:2, label: '转载'},
    {value:3, label: '自制（3）'},
    {value:101, label: '转载投自制'},
    {value:100, label: '自制投转载'},
  ]},
] : [
  { type:'string-hint', label: '歌名', prop: 'name' },
  { type:'tags-hint', label: '歌手', prop: 'vocal', search: 'vocalist' },
  { type:'tags-hint', label: '作者', prop: 'author', search: 'producer' },
  { type:'tags-hint', label: '引擎', prop: 'synthesizer', search: 'synthesizer' },
  { type:'select', label: '版权', prop: 'copyright', options: [
    {value:1, label: '自制'},
    {value:2, label:'转载'},
    {value:3, label: '自制（3）'},
    {value:101, label: '转载投自制'},
    {value:100, label: '自制投转载'},
  ]},
  { type:'select', label: '类别', prop: 'type', options: [
    {value:'翻唱', label: '翻唱'},
    {value:'原创', label: '原创'},
    {value:'串烧', label:'串烧'},
    {value: '本家重置', label: '本家重置'},
  ]},
]

const statusMap: Record<string, string> = {
  done: '已打标',
  auto: 'AI打标',
  check: '未打标'
}

// ============ 搜索现有 ==============

const song = ref<any>()

async function queryName(name: string) {
  if (name.length == 0) return []
  const result = await requester.search_song_by_name(name, {threshold: 0.4})
  const res =  result.result.map((item: any) => ({
    value: item.metadata.name,
    id: item.metadata.id,
  }))
  return res
}

function selectName(item: any){
  song.value = item
}

onMounted(async () => {
  if (props.svmode) return
  const response = await requester.search_song_by_name(props.record.name, { threshold: 1})
  if (response.total) {
    song.value = response.result.map((item: any) => ({
    value: item.metadata.name,
    id: item.metadata.id,
  }))[0]
  }
})

</script>
