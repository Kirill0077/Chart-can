<script setup lang="ts">
import type { ChartProcessedOptions, Series } from '@/chart/model'
import { ref, toRef, watch } from 'vue'
import { GroupingViewer, BaseViewer } from '@/chart/ui/tooltip'

const props = defineProps<{
  options: ChartProcessedOptions
  serieses: Series[]
}>()

const isGroup = toRef(() => props.options.crosshair.tooltip.isGrouping)
const values = ref()

defineExpose({
  updateValue(newValue: Map<string, { x: number | Date; y: number }>)
  {
    values.value = newValue;
  },
});
</script>

<template>
  <div class="tooltip">
    <slot name="tooltip">
      <GroupingViewer v-if="isGroup" :options="options" :serieses="serieses" :values="values"/>
      <BaseViewer v-else />
    </slot>
  </div>
</template>

<style scoped>
.tooltip {
  visibility: hidden;
  position: fixed;
  border-radius: 5px;
  --bg-opacity: 1;
  --shadow-color: #020617;
  --shadow-colored: 0 10px 15px -3px var(--shadow-color), 0 4px 6px -4px var(--shadow-color);
  --shadow: var(--shadow-colored);
  background-color: rgb(30 41 59 / var(--bg-opacity)) /* #1e293b */;
  --shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
    var(--shadow);
  pointer-events: none;
  z-index: 999;
  overflow: visible;
}
</style>
