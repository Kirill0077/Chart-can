<script setup lang="ts">
import type { AxisInfo, Bounds } from '@/chart/model'
import { computed, onMounted, ref, toRef, watch } from 'vue'
import * as d3 from 'd3'
import { AxesY, yAxis } from '@/chart/ui/pan'
import { normolizeLimitsAxisY } from '@/chart/lib'

const props = defineProps<{
  axisInfo: AxisInfo;
  bounds: Bounds;
  panId: string;
  axesContainer: AxesY;
}>()

const bounds = toRef(() => props.bounds)
const axisInfo = toRef(() => props.axisInfo)
const selectorAxis = computed(() => props.panId + axisInfo.value.paneName + axisInfo.value.name)
const viewBox = computed(
  () => `${props.bounds.x / 2} 0 ${props.bounds.width / 2+1} ${props.bounds.height}`,
)
const yAxisEl = ref<d3.Selection<SVGGElement, unknown, HTMLElement, never>>();


onMounted(() => {
  yAxisEl.value = createAxis();
  watch(()=>props.axesContainer.lastScalesY, (scale)=>{
    yAxisEl.value!.call(yAxis, scale.get(axisInfo.value.name)!, axisInfo.value)
  })
})

function createAxis() {
  const scale = d3
    .scaleLinear()
    .domain(normolizeLimitsAxisY(axisInfo.value.limits!, 5))
    .nice()
    .range([props.bounds.height, 0])
  return d3.select(`#${selectorAxis.value}`).append('g').call(yAxis, scale, axisInfo.value)
}


</script>

<template>
  <div class="axes-y" :style="{ height: bounds.height + `px`, width: bounds.width + `px` }">
    <div class="container-axis-label">
      <span class="axis-label">
        {{ axisInfo.displayName }}
      </span>
    </div>
    <svg
      :id="selectorAxis"
      :viewBox="viewBox"
      :width="bounds.width / 2"
      :height="bounds.height"
    ></svg>
  </div>
</template>

<style scoped>
.axes-y {
  display: grid;
  justify-content: end;
  grid-template-columns: 1fr 1fr;
}
.container-axis-label{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.axis-label {
  transform: rotate(-90deg);
  transform-origin: top;
}
</style>
