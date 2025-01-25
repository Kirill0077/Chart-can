<script setup lang="ts">
import { Scroll } from '@/chart/ui/pan'
import { onMounted, toRef } from 'vue'

const props = defineProps<{
  scroll:Scroll
}>()

const selector = toRef(() => props.scroll.selector)
const width = toRef(() => props.scroll.bounds.width)
const height = toRef(() => props.scroll.bounds.height)
const viewBox = toRef(() => `0 0 ${width.value-2} ${height.value-2}`)

onMounted(()=>{
  props.scroll.drawScroll()
})
</script>

<template>
  <div ref="resizeRef" class="chart-scroll">
    <svg
      :id="selector"
      :height="height"
      :width="width"
      :viewBox="viewBox"
      class="svg-scroll"
      style="display: block"
    ></svg>
  </div>
</template>

<style scoped>
.chart-scroll {
  position: relative;
  width: 20px;
  height: 100%;
}
.svg-scroll{
  border: 1px solid
}
</style>
