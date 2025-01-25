<script setup lang="ts">
import {
  type ChartProcessedOptions,
  type Series,
  type LinearPoint,
  type TimePoint,
} from '@/chart/model'
import { simpleHash } from '@/chart/lib'
import { computed, toRef } from 'vue'
import type { TooltipValue } from '@/chart/ui/tooltip'
import { writeFormatTitleX, toFormatNumber } from '@/chart/lib/formatsData.ts'

const props = defineProps<{
  options: ChartProcessedOptions
  serieses: Series[]
  values: TooltipValue
}>()

const values = toRef(() => props.values)
const options = toRef(() => props.options)
const serieses = toRef(() => props.serieses)
const groups = computed(() => {
  const groups: Map<string, Series[]> = new Map<string, Series[]>()
  serieses.value.forEach((s) => {
    const points = s.points
    const key =
      options.value.scaleType === 'time'
        ? points.map((p: TimePoint) => p.time).join('')
        : points.map((p: LinearPoint) => p.distance).join('')
    const hashKey = simpleHash(key)
    if (!groups.has(hashKey)) {
      groups.set(hashKey, [])
    }
    const series = groups.get(hashKey)!
    series.push(s)
    groups.set(hashKey, series)
  })
  return groups
})

function groupXValue(group: [string, Series[]]): string {
  if (props.options.crosshair.mode === 'area') {
    const key = Array.from(values.value!.keys())
    return writeFormatTitleX(
      values.value?.get(key[0])!.x,
      props.options.scaleType,
      props.options.crosshair.tooltip.formatAxisX,
    )
  } else {
    return writeFormatTitleX(
      values.value?.get(group[1][0].displayName)?.x,
      props.options.scaleType,
      props.options.crosshair.tooltip.formatAxisX,
    )
  }
}
</script>

<template>
  <div class="tooltip-container">
    <div v-for="group in groups" :key="group[0]" class="tooltip-item">
      <div class="tooltip-item_title">
        <span>{{ options.crosshair.tooltip.axisXTitle }} :</span>
        <span class="tooltip-item_title_value">
          {{ groupXValue(group) }}
        </span>
        <span class="tooltip-item_title_suffix">{{ options.crosshair.tooltip.suffix }}</span>
      </div>
      <div class="tooltip-item_group">
        <div
          :style="{
            height: '100%',
            gridRow: `span ${group[1].length} / span ${group[1].length} `,
          }"
          class="tooltip-item_group_marker"
        >
          <div
            v-for="s in group[1]"
            v-show="values?.has(s.displayName)"
            :key="s.displayName"
            :style="{
              flex: 'none',
              width: '0.75rem',
              height: '0.75rem',
              borderRadius: '9999px',
              backgroundColor: s.style.color,
            }"
          ></div>
        </div>

        <div
          :style="{
            gridRow: `span ${group[1].length} / span ${group[1].length}`,
          }"
          class="tooltip-item_group_label"
        >
          <span v-for="s in group[1]" v-show="values?.has(s.displayName)" :key="s.displayName"
            >{{ s.crosshairOprions?.tooltip?.title }} :</span
          >
        </div>
        <div
          :style="{
            gridRow: `span ${group[1].length} / span ${group[1].length}`,
          }"
          class="tooltip-item_group_value"
        >
          <span v-for="s in group[1]" v-show="values?.has(s.displayName)" :key="s.displayName">{{
            toFormatNumber(values?.get(s.displayName)?.y, s.crosshairOprions?.tooltip?.format)
          }}</span>
        </div>
        <div
          :style="{
            gridRow: `span ${group[1].length} / span ${group[1].length}`,
          }"
          class="tooltip-item_group_suffix"
        >
          <span v-for="s in group[1]" v-show="values?.has(s.displayName)" :key="s.displayName">{{
            s.crosshairOprions?.tooltip?.suffix
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tooltip-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.tooltip-item {
  display: flex;
  flex-direction: column;
}

.tooltip-item_title {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 24px;
  gap: 8px;
}

.tooltip-item_title_value {
  font-weight: 600;
}

.tooltip-item_title_suffix {
  font-weight: 600;
}

.tooltip-item_group {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.tooltip-item_group_marker {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-block: 0.4rem;
  align-items: center;
  margin: 0;
  gap: 4px;
}

.tooltip-item_group_label {
  display: flex;
  flex-direction: column;
  text-wrap: nowrap;
}

.tooltip-item_group_value {
  display: flex;
  flex-direction: column;
  text-align: right;
  margin-left: 4px;
}

.tooltip-item_group_suffix {
  display: flex;
  flex-direction: column;
  text-align: left;
  opacity: 50%;
}
</style>
