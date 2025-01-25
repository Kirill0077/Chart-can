<script setup lang="ts">
import type { Series } from '@/chart/model'
import { toRef } from 'vue'

const props = defineProps<{
  serieses: Series[];
}>()
const serieses = toRef(()=>props.serieses);
</script>

<template>
  <div class="legend-container">
    <article v-for="series in serieses" :key="series.displayName" class="legend-series">
      <div class="legend-series_marker" :style="{backgroundColor:series.style.color}"/>
      <span class="legend-series_label">{{ series.displayName }}</span>
    </article>
  </div>
</template>

<style scoped>
.legend-container {
  padding-inline: 10px;
  display: flex;
  width: 140px;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
}
.legend-series {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}
.legend-series_marker {
  width: 10px;
  height: 10px;
  border-radius: 100%;
}
.legend-series_label {
  text-wrap: wrap;
  font-size: 12px;
}
</style>
