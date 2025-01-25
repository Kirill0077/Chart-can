import type {
  AxisInfo,
  Bounds,
  ChartProcessedOptions,
  PaneInfo,
  ScaleY,
  Series,
} from '@/chart/model'
import {
  defaultOptionsChart,
  type LinearPoint,
  ScaleType,
  type TimePoint,
  type ValuesSeries,
} from '@/chart/model'
import { Canvas, ListeningArea, AxisX, AxesY, Crosshair } from '@/chart/ui/pan'
import type { Dispatch } from '@/chart/model/dispatch.ts'
import { Tooltip } from '@/chart/ui/tooltip'

export class Diagram {
  panSelector: string
  selector: string
  series: Series[]
  axesInfoY: AxisInfo[]
  viewBox: string
  baseContainer: Bounds
  options: ChartProcessedOptions
  canvas: Canvas
  dispatcher: Dispatch
  axisX: AxisX
  axesY: AxesY
  crosshair: Crosshair
  constScaleY: ScaleY
  listening: ListeningArea
  isRescaleX: boolean = true
  isRescaleY: boolean = true
  private readonly panInfo: PaneInfo
  private defOptions

  constructor(
    series: Series[],
    panInfo: PaneInfo,
    axesInfoY: AxisInfo[],
    options: ChartProcessedOptions,
    dispatcher: Dispatch,
    selector: string,
    boundWidth: number,
    boundHeight: number,
    offset: number,
    tooltip:Tooltip
  ) {
    this.options = options
    this.dispatcher = dispatcher
    this.panSelector = selector
    this.selector = this.panSelector + 'svg'
    this.series = series
    this.panInfo = panInfo
    this.axesInfoY = axesInfoY
    this.processAxesY()
    this.defOptions = defaultOptionsChart()
    this.baseContainer = {
      x: 0,
      y: 0,
      height: boundHeight,
      width: boundWidth,
    }
    const { canvas, axesY, axisX } = this.getBoundsContainers(offset)
    this.axesY = new AxesY(this.selector, this.axesInfoY, axesY, this.series)
    this.axisX = new AxisX(this.selector, this.panInfo, axisX, this.series, options)
    this.canvas = new Canvas(this.panSelector, this.panInfo, canvas, this.options)
    this.crosshair = new Crosshair(this.panSelector, canvas, this.series, this.options)
    this.listening = new ListeningArea(
      this.panSelector,
      this.panInfo,
      canvas,
      this.options,
      this.series,
      this.crosshair,
      this.dispatcher,
      tooltip
    )
    this.viewBox = this.viewBox = `0 0 ${boundWidth} ${boundHeight}`
    this.constScaleY = this.axesY.scalesY.get(this.axesInfoY[0].name)!
  }

  refresh(boundWidth: number, boundHeight: number) {
    this.baseContainer = {
      x: 0,
      y: 0,
      height: boundHeight,
      width: boundWidth,
    }
    this.viewBox = `0 0 ${boundWidth} ${boundHeight}`
    this.drawChart()
  }

  drawChart() {
    //канвас
    this.canvas.draw(this.series, this.axisX.scale, this.axesY.scalesY)
    this.axisX.draw(this.canvas.bounds.height)
    this.axesY.drawLine(this.canvas.bounds.width)
    this.calculateDataListening()
  }

  processAxesY() {
    this.axesInfoY = this.axesInfoY.filter(
      (ax) => this.series.find((s) => ax.name === s.axisName) !== undefined,
    )
  }

  calculateDataListening() {
    const domain = this.axisX.lastScale.domain()
    const zoomValues: ValuesSeries[] = []
    if (this.options.scaleType == ScaleType.time) {
      this.series.forEach((s) => {
        const points = s.points as TimePoint[]
        const filterSeries = points.filter(
          (item) =>
            new Date(item.time).getTime() >= (domain[0] as Date).getTime() &&
            new Date(item.time).getTime() <= (domain[1] as Date).getTime(),
        )
        zoomValues.push({
          x: filterSeries.map((fs) => fs.time),
          y: filterSeries.map((fs) => fs.value),
        })
      })
    } else {
      this.series.forEach((s) => {
        const points = s.points as LinearPoint[]
        const filterSeries = points.filter(
          (item) =>
            item.distance >= (domain[0] as number) && item.distance <= (domain[1] as number),
        )
        zoomValues.push({
          x: filterSeries.map((fs) => fs.distance),
          y: filterSeries.map((fs) => fs.value),
        })
      })
    }
    this.listening.dataListening = {
      scaleX: this.axisX.lastScale,
      scaleY: this.axesY.lastScalesY,
      zoomValues,
    }
  }

  private getBoundsContainers(offset: number): { canvas: Bounds; axesY: Bounds; axisX: Bounds } {
    // const axesYSet = new Set<string>(this.axesInfoY.map((ax) => ax.name))
    const axesY: Bounds = {
      x: this.baseContainer.x,
      y: this.baseContainer.y,
      height: this.baseContainer.height - this.defOptions.axis.x.height - 10,
      width: offset - 6,
    }
    const axisX: Bounds = {
      x: 0,
      y: axesY.height,
      height: this.defOptions.axis.x.height,
      width: this.baseContainer.width - axesY.width - 11,
    }
    const canvas: Bounds = {
      x: 0,
      y: axesY.y,
      width: axisX.width,
      height: axesY.height,
    }
    return {
      canvas,
      axesY,
      axisX,
    }
  }
}
