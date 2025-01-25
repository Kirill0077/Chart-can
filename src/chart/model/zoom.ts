import * as d3 from 'd3'
import {
  type Bounds,
  type ChartProcessedOptions,
  defaultOptionsChart,
  type Limits,
  type PaneInfo,
  type ScaleX,
  type ScaleY,
  type ZoomEvent,
} from '@/chart/model/index.ts'
import { Diagram, ViewPort } from '@/chart/ui/pan'

export class Zoom {
  diagram: Diagram
  behavior: d3.ZoomBehavior<d3.ZoomedElementBaseType, unknown>
  limits: {
    [K in keyof Limits]-?: Exclude<Limits[K], Date>
  }
  paneInfo: PaneInfo
  chartOptions: ChartProcessedOptions
  currentTransform: d3.ZoomTransform

  private defOpt
  private viewPort: ViewPort

  constructor(paneInfo: PaneInfo, diagram: Diagram, chartOptions: ChartProcessedOptions) {
    this.viewPort = new ViewPort(diagram.axisX.scale, diagram.axesY.scalesY)
    this.currentTransform = d3.zoomIdentity
    this.chartOptions = chartOptions
    this.diagram = diagram
    this.defOpt = defaultOptionsChart()
    this.paneInfo = paneInfo
    this.limits = {
      min: chartOptions.limitsZoom.min as number,
      max: chartOptions.limitsZoom.max as number,
    }
    this.behavior = this.zoom(diagram.listening.bounds)
    this.diagram.listening.element.call(this.behavior as never)
    this.diagram.dispatcher.zoomListening(paneInfo.name, {
      diagram: this.diagram,
      behavior: this.behavior,
    })
  }

  zoom(bounds: Bounds) {
    return d3
      .zoom()
      .scaleExtent([this.limits.min, this.limits.max])
      .translateExtent([
        [0, 0],
        [bounds.width, bounds.height],
      ])
      .on('zoom end', (event) => {
        switch (this.chartOptions.zoomMode) {
          case 'x':
            this.zoomingX(event)
            break
          case 'y':
            this.zoomingY(event)
            break
          default:
            this.zoomingXY(event)
            break
        }
        this.diagram.listening.leave()
        this.diagram.dispatcher.crosshairCall(this.diagram.listening.selector, null)
      })
  }

  zoomingX(event: ZoomEvent) {
    const { transform, sourceEvent } = event
    this.currentTransform = transform
    const scaleX: ScaleX = this.diagram.axisX.scale
    const rescaledX = transform.rescaleX(scaleX) as ScaleX
    this.diagram.axisX.refresh(rescaledX, this.diagram.canvas.bounds.height)
    this.diagram.canvas.draw(this.diagram.series, rescaledX, this.diagram.axesY.y())
    this.diagram.calculateDataListening()
    if (sourceEvent !== null) {
      this.diagram.dispatcher.zoomCall(this.paneInfo.name, transform, rescaledX, null)
    }
  }

  zoomingY(event: ZoomEvent) {
    const { transform, sourceEvent } = event
    const scaleY = this.diagram.axesY.y()
    const rescaledY = new Map<string, ScaleY>(
      Array.from(scaleY.entries()).map(([key, value]) => [key, transform.rescaleY(value)]),
    )
    this.diagram.axesY.refresh(rescaledY, this.diagram.canvas.bounds.width)
    this.diagram.canvas.draw(this.diagram.series, this.diagram.axisX.scale, rescaledY)
    if (sourceEvent !== null) {
      this.diagram.dispatcher.zoomCall(
        this.paneInfo.name,
        transform,
        null,
        rescaledY.values().next().value!,
      )
    }
  }

  zoomingXY(event: ZoomEvent) {
    const { transform, sourceEvent } = event
    this.currentTransform = transform
    const { rescaledX, rescaledY } = this.viewPort.translate(
      transform,
      this.diagram.isRescaleX,
      this.diagram.isRescaleY,
    )
    this.diagram.axisX.refresh(rescaledX, this.diagram.canvas.bounds.height)
    this.diagram.axesY.refresh(rescaledY, this.diagram.canvas.bounds.width)
    this.diagram.canvas.draw(this.diagram.series, rescaledX, rescaledY)
    this.diagram.calculateDataListening()
    if (sourceEvent !== null) {
      this.diagram.dispatcher.zoomCall(
        this.paneInfo.name,
        transform,
        rescaledX,
        rescaledY.values().next().value!,
      )
    }
  }

  static ZoomBrushX(
    value: (number | Date)[],
    diagram: Diagram,
    behavior: d3.ZoomBehavior<Element, unknown>,
    currentTransform: d3.ZoomTransform,
  ) {
    const xScale = diagram.axisX.scale
    const k = Math.min(
      diagram.options.limitsZoom.max as number,
      (Math.abs(xScale.range()[1] - xScale.range()[0]) /
        Math.abs(xScale(value[1]) - xScale(value[0]))) as number,
    )
    const newTransform = d3.zoomIdentity
      .scale(k)
      .translate(-xScale(value[0]), currentTransform.y / currentTransform.k)
    diagram.isRescaleY = false
    diagram.listening.element.call(behavior.transform as any, newTransform)
    diagram.dispatcher.currentTransform = newTransform
    diagram.isRescaleY = true
  }

  static ZoomBrushY(
    value: [number, number],
    diagram: Diagram,
    behavior: d3.ZoomBehavior<Element, unknown>,
    currentTransform: d3.ZoomTransform,
  ) {
    const yScale = diagram.constScaleY
    const k = Math.min(
      diagram.options.limitsZoom.max as number,
      (Math.abs(yScale.range()[1] - yScale.range()[0]) / Math.abs(value[1] - value[0])) as number,
    )
    const newTransform = d3.zoomIdentity
      .scale(k)
      .translate(currentTransform.k / currentTransform.x, -value[0])

    diagram.isRescaleX = false
    diagram.listening.element.call(behavior.transform as any, newTransform)
    diagram.dispatcher.currentTransform = newTransform
    diagram.isRescaleX = true
  }

  static dispatchZoom(
    value: d3.ZoomTransform,
    diagram: Diagram,
    behavior: d3.ZoomBehavior<Element, unknown>,
  ) {
    diagram.listening.element.call(behavior.transform as any, value)
  }
}
