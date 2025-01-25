import {
  type AxisInfo,
  type Bounds,
  defaultOptionsChart,
  type Limits,
  type ScaleY,
  type Series,
} from '@/chart/model'
import * as d3 from 'd3'
import { calculateMaxValue, calculateMinValue, normolizeLimitsAxisY } from '@/chart/lib'

export class AxesY {
  bounds: Bounds;
  selectorParent: string;
  axisBounds: Bounds;
  imaginaryAxis: d3.Selection<SVGGElement, unknown, HTMLElement, never>;
  axesInfo: Map<string, AxisInfo>
  scalesY: Map<string, ScaleY>
  lastScalesY: Map<string, ScaleY>
  selectors: Map<string, string>

  constructor(selectorParent: string, axesYInfo: AxisInfo[], bounds: Bounds, series: Series[]) {
    this.bounds = bounds
    this.selectorParent = selectorParent
    this.axesInfo = new Map<string, AxisInfo>(axesYInfo.map((ax) => [ax.name, ax]))
    this.axisBounds = this.createBoundsAxis(bounds)
    this.processLimits(series)
    this.selectors = new Map<string, string>(
      axesYInfo.map((ax) => [ax.name, selectorParent + ax.name]),
    )
    this.scalesY = this.y();
    this.lastScalesY = this.y();
    this.imaginaryAxis = this.createImaginaryAxis(selectorParent)
  }

  refresh(scale: Map<string, ScaleY>, width: number) {
    this.imaginaryAxis.call(
      yAxis,
      Array.from(scale.values()).at(-1)!,
      Array.from(this.axesInfo.values()).at(-1)!,
    )
    this.drawLine(width)
    this.lastScalesY = scale
  }

  y(): Map<string, d3.ScaleLinear<number, number>> {
    const result = new Map<string, ScaleY>()
    this.axesInfo.forEach((axesY, key) => {
      result.set(key, AxesY.yScale(axesY.limits!, this.bounds.height))
    })
    return result
  }

  static yScale(limits: Limits, height: number): ScaleY {
    return d3.scaleLinear().domain(normolizeLimitsAxisY(limits, 5)).nice().range([height, 0])
  }

  private createImaginaryAxis(
    selector: string,
  ): d3.Selection<SVGGElement, unknown, HTMLElement, never> {
    const yScale = this.y()
    const yAxisElement = d3
      .select(`#${selector}`)
      .append('g')
      .attr('class', 'svg-axis')
      .call(yAxis, Array.from(yScale.values()).at(-1)!, Array.from(this.axesInfo.values()).at(-1)!)
    yAxisElement.selectAll('.domain').attr('stroke', '')
    return yAxisElement
  }

  private processLimits(series: Series[]) {
    this.axesInfo.forEach((axis) => {
      const minValue =
        axis.limits != undefined && axis.limits.min != undefined
          ? axis.limits.min
          : calculateMinValue(series, axis)
      const maxValue =
        axis.limits != undefined && axis.limits.max != undefined
          ? axis.limits.max
          : calculateMaxValue(series, axis)
      axis.limits = {
        min: minValue,
        max: maxValue,
      }
    })
  }

  static getProcessedLimits(axis: AxisInfo, serieses: Series[]): { [K in keyof Limits]: number } {
    const minValue: number =
      axis.limits != undefined && axis.limits.min != undefined
        ? (axis.limits.min as number)
        : calculateMinValue(serieses, axis)
    const maxValue: number =
      axis.limits != undefined && axis.limits.max != undefined
        ? (axis.limits.max as number)
        : calculateMaxValue(serieses, axis)
    return {
      min: minValue,
      max: maxValue,
    }
  }

  private createBoundsAxis(bounds: Bounds): Bounds {
    const defOpt = defaultOptionsChart()
    return {
      x: -defOpt.axis.y.width,
      y: 0,
      height: bounds.height,
      width: defOpt.axis.y.width,
    }
  }

  private createBounds(axesInfo: AxisInfo[], bounds: Bounds): Map<string, Bounds> {
    const defOpt = defaultOptionsChart()
    return new Map(
      axesInfo.map((ax, index, array) => [
        ax.name,
        {
          x: bounds.width - defOpt.axis.y.width * (array.length - index - 1),
          y: bounds.y,
          height: bounds.height,
          width: defOpt.axis.y.width,
        },
      ]),
    )
  }

  drawLine(width: number) {
    this.imaginaryAxis.call((g) => {
      g.selectAll('.tick line').attr('x1', width).attr('x2', 0).attr('opacity', '0.5')
    })
  }
}

export function yAxis(
  g: d3.Selection<SVGGElement, unknown, HTMLElement, never>,
  y: d3.ScaleLinear<number, number>,
  info: AxisInfo,
) {
  return g.call(
    d3.axisLeft(y).ticks(
      7,
      d3
        .formatLocale({
          thousands: ' ',
          grouping: [3],
          currency: ['$', ''],
          decimal: '.',
        })
        .format(info.ticks.format ?? ',.2r'),
    ),
  )
}
