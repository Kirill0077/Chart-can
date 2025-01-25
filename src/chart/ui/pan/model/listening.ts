import * as d3 from 'd3'
import {
  type Bounds,
  type ChartProcessedOptions,
  type CrosshairData,
  Dispatch,
  type PaneInfo,
  type Series,
} from '@/chart/model'
import { type DataListening, ScaleType } from '@/chart/model'
import type { Point2D } from '@/chart/model'
import { Crosshair } from '@/chart/ui/pan'
import { Tooltip, type TooltipValue } from '@/chart/ui/tooltip'

export class ListeningArea {
  element: d3.Selection<SVGRectElement, unknown, HTMLElement, never>
  bounds: Bounds
  paneInfo: PaneInfo
  dataListening!: DataListening
  options: ChartProcessedOptions
  serieses: Series[]
  crosshair: Crosshair
  dispatch: Dispatch
  selector: string
  tooltip: Tooltip

  constructor(
    selectorParent: string,
    paneInfo: PaneInfo,
    bounds: Bounds,
    options: ChartProcessedOptions,
    serieses: Series[],
    crosshair: Crosshair,
    dispatch: Dispatch,
    tooltip: Tooltip,
  ) {
    this.tooltip = tooltip
    this.dispatch = dispatch
    this.serieses = serieses
    this.options = options
    this.bounds = bounds
    this.paneInfo = paneInfo
    this.selector = selectorParent + 'listening'
    this.element = this.createListeningArea(selectorParent)
    this.crosshair = crosshair
    this.initListener()
    this.dispatch.crosshairListening(this.selector, this)
  }

  private createListeningArea(selector: string) {
    return d3
      .select(`#${selector}`)
      .append('svg')
      .attr('id', this.selector)
      .style('left', `${this.bounds.x}px`)
      .style('top', `${this.bounds.y}px`)
      .attr('width', `${this.bounds.width}px`)
      .attr('height', `${this.bounds.height}px`)
      .style('position', `absolute`)
      .style("cursor", "crosshair")
      .style('z-index', 4)
      .append('rect')
      .attr('width', this.bounds.width)
      .attr('height', this.bounds.height)
      .attr('fill', 'transparent')
      .attr('stroke', 'transparent')
  }

  initListener() {
    this.element
      .on('mousemove', (event) => {
        this.move(event)
        this.dispatch.crosshairCall(this.selector, event)
        this.tooltip.moveTooltip({
          x: (event as MouseEvent).pageX,
          y: (event as MouseEvent).pageY,
        })
      })
      .on('pointerleave', () => {
        this.leave()
        this.tooltip.leaveTooltip()
        this.dispatch.crosshairCall(this.selector, null)
      })
  }

  move(event: MouseEvent) {
    if (this.options.crosshair.mode !== 'none') {
      switch (this.options.crosshair.mode) {
        case 'x':
          const { crosshairData, tooltipData } = this.movePointerByX(event)
          this.crosshair.moveCrosshair(crosshairData)
          this.tooltip.updateDataTooltip(tooltipData)
        case 'area':
          break
        default:
          break
      }
    }
  }

  leave() {
    this.crosshair.leaveCrosshair()
  }

  movePointerByX(event: MouseEvent): {
    crosshairData: CrosshairData
    tooltipData: TooltipValue
  } {
    const pointMouse = d3.pointer(event)
    const valueX = this.dataListening.scaleX.invert(pointMouse[0])
    const positionForCrosshair = new Map<string, Point2D>()
    const dataForTooltip = new Map<string, { x: number | Date; y: number }>()
    this.serieses.forEach((s, i) => {
      const zoomValuesSeries = this.dataListening.zoomValues[i]

      const index: number =
        this.options.scaleType == ScaleType.time
          ? d3.bisectCenter(zoomValuesSeries.x as Date[], valueX as Date)
          : d3.bisectCenter(zoomValuesSeries.x as number[], valueX as number)

      positionForCrosshair.set(s.displayName, {
        x: this.dataListening.scaleX(zoomValuesSeries.x[index]),
        y: this.dataListening.scaleY.get(s.axisName)!(zoomValuesSeries.y[index]),
      })
      dataForTooltip.set(s.displayName, {
        x: zoomValuesSeries.x[index],
        y: zoomValuesSeries.y[index],
      })

    })
    return {
      crosshairData: {
        position: positionForCrosshair,
      },
      tooltipData: dataForTooltip,
    }
  }

  private searchNearestPoint(
    data: Point2D[],
    pointCursor: Point2D,
    axisName: string,
  ): {
    index: number
    distance: number
  } {
    let closestPoint = 0
    let closestDistance = Infinity

    data.forEach((point, index) => {
      const distance = Math.sqrt(
        Math.pow(pointCursor.x - this.dataListening.scaleX(point.x), 2) +
          Math.pow(pointCursor.y - this.dataListening.scaleY.get(axisName)!(point.y), 2),
      )

      if (distance < closestDistance) {
        closestDistance = distance
        closestPoint = index
      }
    })
    return {
      distance: closestDistance,
      index: closestPoint,
    }
  }
}
