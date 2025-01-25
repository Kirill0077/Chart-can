import {
  type AxisInfo,
  type Bounds,
  type ChartProcessedOptions,
  defaultOptionsChart,
  Dispatch,
  type Limits,
  type LinearPoint,
  type PaneInfo,
  ScaleType,
  type ScaleX,
  type ScaleY,
  type Series,
  type TimePoint,
} from '@/chart/model'
import * as d3 from 'd3'
import { normolizeLimitsAxisY } from '@/chart/lib'
import { AxesY, AxisX } from '@/chart/ui/pan'
import { BrushX } from '@/chart/ui/footer/model/brushX.ts'

export class Focus {
  bounds: Bounds
  series: Series
  paneInfo: PaneInfo
  axis: AxisInfo
  options: ChartProcessedOptions
  private selector: string
  private readonly axisSelection: (
    g: d3.Selection<SVGGElement, unknown, HTMLElement, never>,
    scale: ScaleX,
    format: string,
  ) => d3.Selection<SVGGElement, unknown, HTMLElement, never>
  private readonly limitsX: Limits
  private readonly limitsY: { [K in keyof Limits]: number }
  private scaleX: ScaleX
  private readonly scaleY: ScaleY
  dispatcher: Dispatch
  brush: BrushX

  constructor(
    options: ChartProcessedOptions,
    serieses: Series[],
    selector: string,
    lastPane: PaneInfo,
    axes: AxisInfo[],
    boundWidth: number,
    boundHeight: number,
    dispatcher: Dispatch,
  ) {
    this.dispatcher = dispatcher
    this.options = options
    this.paneInfo = lastPane
    this.bounds = {
      x: 0,
      y: 0,
      width: boundWidth,
      height: boundHeight,
    }
    this.selector = selector
    this.series = serieses.at(-1)!
    this.axis = axes.find((ax) => ax.name === this.series.axisName)!
    this.axisSelection = this.options.scaleType === 'time' ? AxisX.xAxisTime : AxisX.xAxisNumeric
    this.limitsX =
      this.options.scaleType == 'time'
        ? AxisX.getLimitsTime([this.series])
        : AxisX.getLimitsNumeric([this.series])
    this.limitsY = AxesY.getProcessedLimits(this.axis, [this.series])
    this.scaleX =
      this.options.scaleType == 'time'
        ? AxisX.xTime(this.limitsX, this.bounds.width)
        : AxisX.xNumeric(this.limitsX, this.bounds.width)
    this.scaleY = AxesY.yScale(this.limitsY, this.bounds.height)
    this.createFocusAxisX()
    this.drawFocus()
    this.brush = new BrushX(this.scaleX, selector, this.bounds, this.dispatcher)

    this.brush.drawBrush()
    this.dispatcher.zoomListeningFocus(BrushX.dispatchBrushX, {
      scaleX: this.scaleX,
      behavior: this.brush.brushXAxis(),
      el: this.brush.el,
    })
  }

  refresh(width: number, height: number) {
    this.bounds = {
      x: 0,
      y: 0,
      width: width,
      height: height,
    }
    this.drawFocus()
  }

  drawFocus() {
    const pathD = this.lineFocus()
    d3.select(`#${this.selector}`)
      .append('g')
      .append('path')
      .attr('clip-path', 'url(#inner-clip)')
      .attr('fill', 'none')
      .attr('stroke', `${this.series.style.color}`)
      .attr('d', pathD)
  }

  createFocusAxisX() {
    d3.select(`#${this.selector}`)
      .append('g')
      .attr('transform', `translate(${this.bounds.x},${defaultOptionsChart().focus.height})`)
      .call(
        this.axisSelection,
        this.options.scaleType === 'time'
          ? AxisX.xTime(this.limitsX, this.bounds.width)
          : AxisX.xNumeric(this.limitsX, this.bounds.width),
        this.options.format,
      )
  }

  lineFocus = () => {
    const points = this.series.points
    const domain = d3.extent(points.map((p) => p.value))
    if (!domain) {
      throw Error('Not found extent')
    }
    this.scaleY
      .domain(
        normolizeLimitsAxisY(
          {
            min: domain[0],
            max: domain[1],
          },
          15,
        ),
      )
      .range([defaultOptionsChart().focus.height, 0])
    if (this.options.scaleType === ScaleType.time) {
      return d3
        .line<TimePoint>()
        .x((d) => this.scaleX(new Date(d.time)))
        .y((d) => this.scaleY(d.value))(this.series.points as TimePoint[])
    } else {
      return d3
        .line<LinearPoint>()
        .x((d) => this.scaleX(d.distance))
        .y((d) => this.scaleY(d.value))(this.series.points as LinearPoint[])
    }
  }
}
