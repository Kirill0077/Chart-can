import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  type AxisInfo,
  type Limits,
  type LinearPoint,
  ScaleType,
  type Series,
  type TimePoint,
} from '@/chart/model/types'
import * as d3 from 'd3'
import { defaultOptionsChart } from '@/chart/model/defOptions.ts'

/**
 * Вычисление зума по временной шкале
 * @param limits границы временной шкалы
 * @param divider количество миллисекунд на графике при конечном результате зума
 */
export function calculateZoom(limits: Limits, divider: number): number {
  const min = new Date(limits.min as Date)
  const max = new Date(limits.max as Date)
  return (max.getTime() - min.getTime()) / divider
}

export function calculateMinX(series: Array<Array<Date | number>>): Date | number {
  if (series.length == 0) {
    return 0
  }
  const arrayMin: Array<Date | number> = []
  series.forEach((arr) => {
    const minArray = d3.min<Date | number>(arr)
    if (minArray !== undefined && minArray !== null) {
      arrayMin.push(minArray)
    }
  })

  const min = d3.min<Date | number>(arrayMin)
  if (min !== undefined && min !== null) {
    return min
  } else {
    throw new Error('max not found')
  }
}

export function calculateMaxX(series: Array<Array<Date | number>>): Date | number {
  if (series.length == 0) {
    return 0
  }
  const arrayMax: Array<Date | number> = []

  series.forEach((arr) => {
    const maxArray = d3.max<Date | number>(arr)
    if (maxArray) {
      arrayMax.push(maxArray)
    }
  })

  const max = d3.max<Date | number>(arrayMax)
  if (max) {
    return max
  } else {
    throw new Error('max not found')
  }
}

export function calculateMinValue(series: Series[], axis: AxisInfo): number {
  if (series.length == 0) {
    return defaultOptionsChart().axis.y.limitsDef.min
  }
  const minAllSeires: number[] = []

  series.forEach((s) => {
    if (axis.name == s.axisName) {
      if (s.points.length == 0) {
        return 0
      }
      const min = d3.min<number>(s.points.map((p) => p.value))
      if (min) {
        minAllSeires.push(min)
      } else {
        //throw new Error("min not found");
        minAllSeires.push(0)
      }
    }
  })

  return d3.min(minAllSeires)!
}

export function calculateMaxValue(series: Series[], axis: AxisInfo): number {
  if (series.length == 0) {
    return defaultOptionsChart().axis.y.limitsDef.max
  }
  const maxAllSeires: number[] = []
  series.forEach((s) => {
    if (axis.name == s.axisName) {
      const max = d3.max<number>(s.points.map((p) => p.value))
      if (max) {
        maxAllSeires.push(max)
      } else {
        maxAllSeires.push(1)
        //throw new Error("max not found");
      }
    }
  })

  return d3.max(maxAllSeires)!
}

export const useResizeObserver = () => {
  // create a new ref,
  // which needs to be attached to an element in a template
  const resizeRef = ref()
  const resizeState = reactive({
    dimensions: {} as DOMRectReadOnly,
  })

  const observer = new ResizeObserver((entries) => {
    // called initially and on resize
    entries.forEach((entry) => {
      resizeState.dimensions = entry.contentRect
    })
  })

  onMounted(() => {
    // set initial dimensions right before observing: Element.getBoundingClientRect()
    resizeState.dimensions = resizeRef.value.getBoundingClientRect()
    observer.observe(resizeRef.value)
  })

  onBeforeUnmount(() => {
    observer.unobserve(resizeRef.value)
  })

  const viewBox = computed(() => {
    if (resizeState.dimensions.width === undefined || resizeState.dimensions.height === undefined) {
      return '0 0 100 100'
    } else {
      return `0 0 ${resizeState.dimensions.width} ${resizeState.dimensions.height}`
    }
  })
  // return to make them available to whoever consumes this hook
  return { resizeState, resizeRef, viewBox }
}


/**
 * Нормализует верхнию и нижнию границу графика вметсте с отступами
 * @param limits границы оси или серии
 * @param padding отступы от графниц в % от дипапзона
 * @returns границы [min, max]
 */
export function normolizeLimitsAxisY(limits: Limits, padding: number): [number, number] {
  const min = limits.min as number
  const max = limits.max as number

  const delta = Math.abs(max - min)

  const newMin = min - delta * (padding / 100)
  const newMax = max + delta * (padding / 100)

  return [newMin, newMax]
}

export function groupBySeries(series: Series[], typeScale: ScaleType): Map<string, string[]> {
  const groups: Map<string, string[]> = new Map<string, string[]>()

  if (typeScale == ScaleType.numeric) {
    series.forEach((s) => {
      const points = s.points as LinearPoint[]
      const key = points.map((p) => p.distance).join('')
      const hashKey = simpleHash(key)
      if (!groups.has(hashKey)) {
        groups.set(hashKey, [])
      }
      const series = groups.get(hashKey)!
      series.push(s.displayName)
      groups.set(hashKey, series)
    })
  } else {
    series.forEach((s) => {
      const points = s.points as TimePoint[]
      const key = points.map((p) => p.time).join('')
      const hashKey = simpleHash(key)
      if (!groups.has(hashKey)) {
        groups.set(hashKey, [])
      }
      const series = groups.get(hashKey)!
      series.push(s.displayName)
      groups.set(hashKey, series)
    })
  }

  return groups
}

export function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Преобразование в 32-битное целое
  }
  return hash.toString()
}

export function hexToRgba(hex: string, opacity = 1): string {
  // Убираем символ '#' если он есть
  hex = hex.replace(/^#/, '')

  // Если сокращённая форма HEX (например, #03F), расширяем её до полного формата (например, #0033FF)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  // Преобразуем HEX в RGB
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  // Возвращаем цвет в формате RGBA
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}


