<script setup lang="ts">
import {
  type AxisInfo,
  type ChartProcessedOptions,
  type PaneInfo,
  type Series,
  Dispatch,
} from '@/chart/model'
import { useResizeObserver } from '@/chart/lib'
import { computed, onMounted, ref, watch } from 'vue'
import { Diagram, Scroll } from '@/chart/ui/pan/model'
import { Zoom } from '@/chart/model/zoom.ts'
import { toRef } from 'vue'
import { LegendViewer, ScrollViewer } from '@/chart/ui/pan'
import AxisContainer from '@/chart/ui/pan/ui/axesY/AxisContainer.vue'
import { Tooltip } from '@/chart/ui/tooltip'

const props = defineProps<{
  selectorParent: string
  panInfo: PaneInfo
  axesY: AxisInfo[]
  serieses: Series[]
  chartOptions: ChartProcessedOptions
  dispatcher: Dispatch;
  tooltip: Tooltip;
  offsetAxes: number
}>()

const panInfo = toRef(() => props.panInfo)
const serieses = toRef(() => props.serieses)
const axesY = toRef(() => props.axesY)
const offsetAxes = toRef(() => props.offsetAxes)
const dispatcher = toRef(() => props.dispatcher)

const { resizeState, resizeRef, viewBox } = useResizeObserver()
const isVisibleAxesY = ref(false)
const isVisibleScroll = ref(false)

const { diagram, selector } = useDiagram()
const { scroll } = useScroll()
useZoom()

onMounted(() => {
  isVisibleAxesY.value = true
  isVisibleScroll.value = true
})

function useDiagram() {
  const selector = computed(() => props.selectorParent + props.panInfo.name)
  const diagram = ref<Diagram>()
  onMounted(() => {
    diagram.value = new Diagram(
      serieses.value,
      panInfo.value,
      axesY.value,
      props.chartOptions,
      dispatcher.value,
      selector.value,
      resizeState.dimensions.width,
      resizeState.dimensions.height,
      offsetAxes.value,
      props.tooltip,
    )
    diagram.value.drawChart()
  })
  watch(
    () => [resizeState.dimensions.width, resizeState.dimensions.height],
    ([w, h]) => {
      diagram.value!.refresh(w, h)
    },
  )
  return {
    diagram,
    selector,
  }
}

function useZoom() {
  const zoom = ref<Zoom>()
  onMounted(() => {
    if (diagram.value) {
      zoom.value = new Zoom(props.panInfo, diagram.value, props.chartOptions)
    }
  })
}

function useScroll() {
  const scroll = ref<Scroll>()
  const scaleY = computed(() =>
    diagram.value ? diagram.value.axesY.scalesY.get(diagram.value.axesInfoY[0].name) : null,
  )
  const selectorScroll = computed(() => selector.value + 'scroll')
  onMounted(() => {
    if (scaleY.value)
      scroll.value = new Scroll(
        scaleY.value,
        selectorScroll.value,
        dispatcher.value,
        panInfo.value.name,
      )
  })
  return {
    scroll,
  }
}
</script>

<template>
  <section class="pan-container">
    <AxisContainer v-if="isVisibleAxesY" :offset="offsetAxes" :axes-y-container="diagram!.axesY" />
    <div ref="resizeRef" :id="selector" class="diagram-container">
      <svg
        :id="selector + 'svg'"
        :height="resizeState.dimensions.height"
        :width="resizeState.dimensions.width"
        :viewBox="viewBox"
        class="svg-container"
      ></svg>
    </div>
    <ScrollViewer v-if="isVisibleScroll" :scroll="scroll!" />
    <LegendViewer :serieses="serieses" :style="{ height: diagram?.axesY.bounds.height + `px` }" />
  </section>
</template>

<style>
.pan-container {
  display: flex;
  flex-direction: row;
  flex: 1 1 0;
  height: 100%;
}

.diagram-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.crosshair-line {
  stroke: rgb(214, 203, 203);
  stroke-dasharray: 5, 5;
  stroke-width: 1px;
}

.svg-container {
  position: absolute;
  z-index: 1;
}

.chart-legend {
  background-color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.axis-gridlines {
  stroke: #ddd !important;
}
</style>
