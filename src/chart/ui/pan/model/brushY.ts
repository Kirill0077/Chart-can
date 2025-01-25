import * as d3 from 'd3'
import { type Bounds, type BrushEvent, Dispatch, type ScaleY } from '@/chart/model'

export class BrushY {
  selection: d3.BrushSelection
  selectorParent: string
  selector: string
  el: d3.Selection<SVGGElement, unknown, HTMLElement, never>
  scale: ScaleY
  private bounds: Bounds
  private dispatcher: Dispatch
  private readonly paneName: string

  constructor(
    scale: ScaleY,
    selectorParent: string,
    boundsScroll: Bounds,
    dispatcher: Dispatch,
    paneName: string,
  ) {
    this.scale = scale
    this.paneName = paneName
    this.dispatcher = dispatcher
    this.selection = [scale.range()[1] + 0.5, scale.range()[0] - 1]
    this.selectorParent = selectorParent
    this.selector = selectorParent + 'brush'
    this.bounds = boundsScroll
    this.el = this.createBrushY()
  }

  drawBrush() {
    this.el.call(this.brushY())
    this.el.call(this.brushY().move, this.selection)
  }

  brushY = () =>
    d3
      .brushY()
      .extent([
        [0.5, 0.5],
        [this.bounds.width - 1, this.bounds.height - 1],
      ])
      .on('brush end', (event) => {
        this.brushed(event)
      })

  private createBrushY() {
    return d3.selectAll(`#${this.selectorParent}`).append('g').attr('id', this.selector)
  }

  private brushed(event: BrushEvent) {
    const { selection, sourceEvent } = event
    if (sourceEvent != null) {
      this.dispatcher.brushYCall(this.paneName + 'scroll', selection as [number, number])
    }
  }

  static dispatchBrushY(
    rescaleY: ScaleY,
    scaleY: ScaleY,
    el: d3.Selection<SVGGElement, unknown, HTMLElement, never>,
    behavior: d3.BrushBehavior<unknown>,
  ) {
    const domainY: d3.BrushSelection = [scaleY(rescaleY.domain()[1]), scaleY(rescaleY.domain()[0])]
    el.call(behavior.move, domainY)
  }

  static dispatchBrushYScroll(
    domainY: d3.BrushSelection,
    el: d3.Selection<SVGGElement, unknown, HTMLElement, never>,
    behavior: d3.BrushBehavior<unknown>,
  ) {

    el.call(behavior.move, domainY)
  }
}
