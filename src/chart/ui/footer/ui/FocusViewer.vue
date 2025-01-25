<script setup lang="ts">
import { useResizeObserver } from '@/chart/lib'
import { computed, onMounted, ref, toRef } from 'vue'
import { Focus } from '@/chart/ui/footer/model/focus.ts'
import { type AxisInfo, type ChartProcessedOptions, Dispatch, type PaneInfo, type Series } from '@/chart/model'

const props = defineProps<{
  selectorParent: string
  options: ChartProcessedOptions
  panesInfo: PaneInfo
  axesY: AxisInfo[]
  serieses: Series[] // unique identifier for the chart
  offsetAxes: number// offset axes from the left edge of the chart
  dispatcher: Dispatch
}>()

const { resizeState, resizeRef } = useResizeObserver()

const focus = ref<Focus>()
const lastPane = toRef(() => props.panesInfo!)

const selector = computed(() => props.selectorParent + 'focus')
const width = computed(() =>(resizeState.dimensions.width !== undefined) ? resizeState.dimensions.width - 130 - props.offsetAxes : 0)
const viewBox = computed(() => {
  if (resizeState.dimensions.width === undefined || resizeState.dimensions.height === undefined) {
    return `0 0 100 100`
  } else {
    return `0 0 ${width.value} ${resizeState.dimensions.height}`
  }
})

onMounted(() => {
  focus.value = new Focus(
    props.options,
    props.serieses,
    selector.value,
    lastPane.value,
    props.axesY,
    width.value,
    resizeState.dimensions.height,
    props.dispatcher
  )
})
</script>

<template>
  <div ref="resizeRef" class="chart-focus" :style="{ left: offsetAxes + `px` }">
    <svg
      :id="selector"
      :height="resizeState.dimensions.height"
      :width="width"
      :viewBox="viewBox"
      style="display:block"
    ></svg>
  </div>
</template>

<style scoped>
.chart-focus {
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
