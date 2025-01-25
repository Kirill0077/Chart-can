<script setup lang="ts">
import PanViewer from '@/chart/ui/pan/ui/PanViewer.vue'
import {
  type ChartProcessedOptions,
  defaultOptionsChart,
  type DomainPane,
  type Options,
} from '@/chart/model'
import { computed, onBeforeMount, onMounted, ref, toRef } from 'vue'
import { Focus } from '@/chart/ui/footer'
import { Tooltip, TooltipViewer } from '@/chart/ui/tooltip'
import { v4 as uuidv4 } from 'uuid'
import { Formats } from '@/chart/lib/formatsData.ts'
import { Dispatch } from '@/chart/model/dispatch.ts'

const props = defineProps<{
  options: Options
}>()
const selector = ref('chart' + uuidv4())

const options = toRef(() => props.options)

const { chartOptions } = useChartOptions()
const { panes, lastPane, isShowPanes } = usePanesChart()
const { offsetAxes } = useOffsetAxis()
const { toolRef, tooltip, serieses } = useTooltip()
const dispatcher = new Dispatch(
  selector.value,
  panes.value.map((p) => p.pane.name),
)

function useOffsetAxis() {
  const countAxis = ref()
  const offsetAxes = computed(() => countAxis.value * defaultOptionsChart().axis.y.width)

  onBeforeMount(() => {
    updateCountAxis(Math.max(...panes.value.map((p) => p.axesY.length)))
  })

  function updateCountAxis(count: number) {
    countAxis.value = count
  }

  return {
    offsetAxes,
  }
}

function useChartOptions() {
  const processedOptions = computed(
    (): ChartProcessedOptions => ({
      ...options.value.chart,
      zoomMode: options.value.chart.zoomMode ?? 'x',
      limitsZoom:
        options.value.chart.limitsZoom !== undefined
          ? options.value.chart.limitsZoom
          : {
              min: 1,
              max: 500,
            },
      crosshair:
        options.value.chart.crosshair !== undefined
          ? options.value.chart.crosshair
          : {
              mode: 'none',
              circle: {
                isShow: true,
                color: '#000',
              },
              horizontalLine: {
                isShow: true,
                color: '#888',
                width: 1,
              },
              tooltip: {
                isShow: true,
                isGrouping: true,
              },
              verticalLine: {
                color: 'black',
                width: 1,
                isShow: true,
              },
            },
      format:
        options.value.chart.format === undefined
          ? options.value.chart.scaleType == 'time'
            ? Formats.DefaultTime
            : Formats.NumberTwoDigits
          : options.value.chart.format,
    }),
  )
  return {
    chartOptions: processedOptions,
  }
}

function usePanesChart() {
  const isShowPanes = ref(false);
  const processedPanes = computed((): DomainPane[] => {
    const domainPanes: DomainPane[] = []
    options.value.panes.forEach((p) => {
      domainPanes.push({
        pane: p,
        axesY: options.value.axesY.filter((ax) => ax.paneName === p.name)!,
        serieses: options.value.serieses.filter((ax) => ax.paneName === p.name)!,
      })
    })
    return domainPanes
  })
  const lastPane = computed(() => processedPanes.value.at(-1)!)
  return {
    isShowPanes,
    panes: processedPanes,
    lastPane,
  }
}

function useTooltip() {
  const toolRef = ref()
  const serieses = computed(() => panes.value.flatMap((p) => p.serieses))
  const tooltip = ref()
  onMounted(() => {
    if (chartOptions.value.crosshair.tooltip.isShow){

      tooltip.value = new Tooltip(toolRef.value)
    }
    isShowPanes.value = true;
  })
  return {
    toolRef,
    tooltip,
    serieses,
  }
}
</script>

<template>
  <div class="chart-container" v-if="isShowPanes">
      <PanViewer
        v-for="pan in panes"
        :selector-parent="selector"
        :key="pan.pane.name"
        :pan-info="pan.pane"
        :serieses="pan.serieses"
        :axes-y="pan.axesY"
        :options="chartOptions"
        :offset-axes="offsetAxes"
        :chart-options="chartOptions"
        :dispatcher="dispatcher"
        :tooltip="tooltip"
      />

    <section class="chart-footer">
      <div class="chart-controls">TODO Controls</div>
      <Focus
        :selector-parent="selector"
        :panes-info="lastPane.pane"
        :axes-y="lastPane.axesY"
        :serieses="lastPane.serieses"
        :options="chartOptions"
        :offset-axes="offsetAxes"
        :dispatcher="dispatcher"
      />
    </section>
  </div>
  <TooltipViewer ref="toolRef" :options="chartOptions" :serieses="serieses" class="tooltip" />
</template>

<style scoped>
.chart-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 10px;
}

.chart-footer {
  position: relative;
  display: flex;
  flex-direction: row;
  height: 140px;
  gap: 10px;
}

.chart-controls {
  position: absolute;

  height: 100%;
  background-color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-controls {
  width: 140px;
}

.chart-focus {
  flex: 1 1 0;
}
</style>
