import * as d3 from 'd3'
import {
  type Bounds, type ChartOptions, type ChartProcessedOptions,
  type Limits,
  type LinearPoint,
  type ScaleX,
  type Series,
  type TimePoint
} from '@/chart/model/types.ts'
import { type PaneInfo } from '@/chart/model'
import { calculateMaxX, calculateMinX, normolizeLimitsAxisY } from '@/chart/lib'

export class AxisX {
  scale: ScaleX;
  panInfo: PaneInfo;
  selector: string;
  bounds: Bounds;
  format: string;
  options:ChartProcessedOptions;
  lastScale:ScaleX;
  axisSelection: (
    g: d3.Selection<SVGGElement, unknown, HTMLElement, never>,
    scale: ScaleX,
    format: string,
  ) => d3.Selection<SVGGElement, unknown, HTMLElement, never>
  element: d3.Selection<SVGGElement, unknown, HTMLElement, never>

  constructor(selectorParent: string, panInfo: PaneInfo, bounds: Bounds, series: Series[], options:ChartProcessedOptions) {
    this.options = options;
    this.selector = selectorParent + 'axisX'
    this.panInfo = panInfo;
    this.bounds = bounds;
    this.processLimits(series);
    this.format = this.options.scaleType === 'time' ? '%H:%M:%S' : ',.2f'
    this.scale = this.options.scaleType === 'time' ? AxisX.xTime(this.panInfo.limitsAxisX!, bounds.width) : AxisX.xNumeric(this.panInfo.limitsAxisX!, bounds.width)
    this.lastScale = this.scale;
    this.axisSelection = this.options.scaleType === 'time' ? AxisX.xAxisTime : AxisX.xAxisNumeric
    this.element = this.createAxisX(selectorParent)
  }

  refresh(scale: ScaleX, height: number) {
    this.element.call(this.axisSelection, scale, this.format)
    this.drawLine(height);
    this.lastScale = scale;
  }

  draw(height: number) {
    this.drawLine(height)
  }

  static xTime(limits:Limits, width:number): d3.ScaleTime<number, number> {
    return d3
      .scaleTime()
      .domain([limits.min!,limits.max!])
      .range([0, width])
  }

  static xNumeric = (limits:Limits, width:number): d3.ScaleLinear<number, number> =>
    d3
      .scaleLinear()
      .domain(normolizeLimitsAxisY(limits, 2))
      .range([0, width])

  drawLine(height: number) {
    this.element.call((g) => {
      g.selectAll('.tick line').attr('y1', -height).attr('opacity', '0.5')
    })
  }

  static xAxisTime(
    g: d3.Selection<SVGGElement, unknown, HTMLElement, never>,
    scale: ScaleX,
    format: string,
  ): d3.Selection<SVGGElement, unknown, HTMLElement, never> {
    return g.call(d3.axisBottom(scale).ticks(10, d3.timeFormat(format)))
  }

  static xAxisNumeric(
    g: d3.Selection<SVGGElement, unknown, HTMLElement, never>,
    scale: ScaleX,
    format:string
  ): d3.Selection<SVGGElement, unknown, HTMLElement, never> {
    return g.call(
      d3.axisBottom(scale).ticks(
        10,
        d3
          .formatLocale({
            thousands: ' ',
            grouping: [3],
            currency: ['$', ''],
            decimal: '.',
          })
          .format(format),
      ),
    )
  }

  private createAxisX(selector: string): d3.Selection<SVGGElement, unknown, HTMLElement, never> {
    return d3
      .select(`#${selector}`)
      .append('g')
      .attr('id', this.selector)
      .attr('transform', `translate(${this.bounds.x},${this.bounds.y})`)
      .call(this.axisSelection, this.scale, this.format)
  }

  private processLimits(series: Series[]) {
    let limits
    if (this.options.scaleType == 'time') {
      limits = this.panInfo.limitsAxisX ?? AxisX.getLimitsTime(series)
    } else {
      limits = this.panInfo.limitsAxisX ?? AxisX.getLimitsNumeric(series)
    }
    this.panInfo.limitsAxisX = limits
  }


  static getLimitsNumeric(series: Series[]): Limits {
    const pointsSeries = series.map((s) => s.points as LinearPoint[])
    const arrAllTime = pointsSeries.map((points) => points.map((p) => p.distance))

    const minX: number =
      d3.min<number>(
        series.filter((s) => s.limitsX && s.limitsX.min).map((s) => s.limitsX!.min! as number),
      ) ?? (calculateMinX(arrAllTime) as number)

    const maxX: number =
      d3.max<number>(
        series.filter((s) => s.limitsX && s.limitsX.max).map((s) => s.limitsX!.max! as number),
      ) ?? (calculateMaxX(arrAllTime) as number)
    return {
      min: minX,
      max: maxX,
    }
  }

  static getLimitsTime(series: Series[]): Limits {
    const pointsSeries = series.map((s) => s.points as TimePoint[])
    const arrAllTime = pointsSeries.map((points) => points.map((p) => new Date(p.time)))

    const minX: Date =
      d3.min<Date>(
        series
          .filter((s) => s.limitsX && s.limitsX.min)
          .map((s) => new Date(s.limitsX!.min! as Date)),
      ) ?? (calculateMinX(arrAllTime) as Date)

    const maxX: Date =
      d3.max<Date>(
        series
          .filter((s) => s.limitsX && s.limitsX.min)
          .map((s) => new Date(s.limitsX!.min! as Date)),
      ) ?? (calculateMaxX(arrAllTime) as Date)
    return {
      min: minX,
      max: maxX,
    }
  }
}
