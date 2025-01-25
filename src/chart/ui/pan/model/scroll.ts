import { type Bounds, defaultOptionsChart, type ScaleY } from '@/chart/model'
import { BrushY } from '@/chart/ui/pan/model/brushY.ts'
import { Dispatch } from '@/chart/model'

export class Scroll {
  selector: string
  bounds: Bounds
  brush!: BrushY
  dispatcher: Dispatch
  paneName: string
  scale: ScaleY

  constructor(scale: ScaleY, selector: string, dispatcher: Dispatch, paneName: string) {
    this.scale = scale
    this.paneName = paneName
    this.dispatcher = dispatcher
    this.bounds = {
      x: 0,
      y: 0,
      width: defaultOptionsChart().scroll.width,
      height: scale.range()[0],
    }
    this.selector = selector
  }

  drawScroll() {
    this.brush = new BrushY(this.scale, this.selector, this.bounds, this.dispatcher, this.paneName)
    this.brush.drawBrush()
    this.dispatcher.zoomListeningScroll(this.paneName + 'scroll', BrushY.dispatchBrushY, {
      behavior: this.brush.brushY(),
      el: this.brush.el,
      scaleY: this.scale,
    })
  }
}
