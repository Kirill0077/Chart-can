<script setup lang="ts">
import { Lab1401Chart } from '@/chart'
import { type Options, type PaneInfo, ScaleType } from '@/chart/model'
import { ref } from 'vue'
import { getPlotData } from '@/test/testChart.ts'
import { Formats } from '@/chart/lib/formatsData.ts'

const panInfo = ref<PaneInfo>({
  name: 'one',
  diagramType: 'line',
})

const panInfoSecond = ref<PaneInfo>({
  name: 'two',
  diagramType: 'line',
})

const panInfoThird = ref<PaneInfo>({
  name: 'three',
  diagramType: 'line',
})

const options = ref<Options>({
  chart: {
    limitsZoom: undefined,
    format: Formats.NumberTwoDigits,
    scaleType: ScaleType.numeric,
    zoomMode: 'xy',
    crosshair:{
      tooltip:{
        isShow: true,
        isGrouping:true,
      },
      verticalLine:{
        isShow:true,
      },
      horizontalLine:{
        isShow:true,
      },
      circle:{
        radius: 5,
        isShow: true,
      },
      mode:'x'
    }
  },
  //panInfoSecond.value, panInfoThird.value
  panes: [panInfo.value,panInfoSecond.value, panInfoThird.value],
  axesY: [
    {
      paneName: 'one',
      name: 'tAxis',
      displayName: 'Temperature',
      ticks: {
        countTicks: 5,
        format: ',.2f',
      },
      suffix: 'Suffix',
      limits: {
        min: -50,
        max: 70,
      },
    },
    {
      paneName: 'two',
      name: 'tAxis',
      displayName: 'Temperature',
      ticks: {
        countTicks: 5,
        format: ',.1f',
      },
      suffix: 'Suffix',
      limits: {
        min: -50,
        max: 70,
      },
    },
    {
      paneName: 'two',
      name: 'lAxis',
      displayName: 'Elevation',
      ticks: {
        countTicks: 9,
        format: ',.1f',
      },
      suffix: 'Suffix',
      limits: {
        min: 0,
        max: 220,
      },
    },
    {
      paneName: 'three',
      name: 'lAxis',
      displayName: 'Elevation',
      ticks: {
        countTicks: 9,
        format: ',.1f',
      },
      suffix: 'Suffix',
      limits: {
        min: 193,
        max: 203,
      },
    },
  ],
  serieses: getPlotData(),
})
</script>

<template>
  <main class="main">
    <Lab1401Chart :options="options" />
  </main>
</template>

<style scoped>
.main {
  width: 1600px;
  height: 100svh;
}
</style>
