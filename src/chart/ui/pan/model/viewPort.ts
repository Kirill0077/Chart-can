import * as d3 from 'd3'
import type { ScaleX, ScaleY } from '@/chart/model'

export class ViewPort {
  rescaledX: ScaleX
  rescaledY: Map<string, ScaleY>
  private xTransform: d3.ZoomTransform
  private yTransform: d3.ZoomTransform
  private currentTransform: d3.ZoomTransform
  private readonly scaleX: ScaleX
  private readonly scaleY: Map<string, ScaleY>

  constructor(scaleX: ScaleX, scaleY: Map<string, ScaleY>) {
    this.xTransform = d3.zoomIdentity
    this.yTransform = d3.zoomIdentity
    this.currentTransform = d3.zoomIdentity
    this.scaleX = scaleX
    this.scaleY = scaleY
    this.rescaledX = scaleX
    this.rescaledY = scaleY
  }

  translate(transform: d3.ZoomTransform, isXTrans:boolean, isYTrans:boolean) {
    if(isXTrans && isYTrans){
      if (this.currentTransform.k == this.xTransform.k && this.currentTransform.k == this.yTransform.k) {
        this.xTransform = transform
        this.yTransform = transform
      } else if (this.currentTransform.k == this.xTransform.k) {
        this.xTransform = transform
        const kY = (transform.k / this.currentTransform.k) * this.yTransform.k
        const y = transform.y / transform.k
        this.yTransform = d3.zoomIdentity.scale(kY).translate(0, y)
      } else {
        this.yTransform = transform
        const kX = (transform.k / this.currentTransform.k) * this.xTransform.k
        const x = transform.x / transform.k
        this.xTransform = d3.zoomIdentity.scale(kX).translate(x, 0)
      }
    } else if(isXTrans){
      this.xTransform = transform;
    } else{
      this.yTransform = transform;
    }

    this.currentTransform = transform
    this.rescale()
    return {
      rescaledX: this.rescaledX,
      rescaledY: this.rescaledY,
    }
  }

  private rescale() {
    this.rescaledX = this.xTransform.rescaleX(this.scaleX)
    this.rescaledY = new Map<string, ScaleY>(
      Array.from(this.scaleY.entries()).map(([key, value]) => [key, this.yTransform.rescaleY(value)]),
    )
  }
}
