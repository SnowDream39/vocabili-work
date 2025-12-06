<template>
  <div
    class="bg-surface-container/70 rounded-lg shadow-lg overflow-hidden transition"
    :class="{
      'hover:shadow-xl hover:scale-101': props.interact
    }"
  >
    <slot></slot>
  </div>
</template>


<script setup lang="ts">
const props = defineProps<{
  interact?: boolean
}>()
</script>
