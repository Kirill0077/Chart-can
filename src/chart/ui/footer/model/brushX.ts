import * as d3 from 'd3'
import { type Bounds, type BrushEvent, Dispatch, type ScaleX } from '@/chart/model'

export class BrushX
{
  selection: d3.BrushSelection
  selectorParent: string
  selector: string
  el: d3.Selection<SVGGElement, unknown, HTMLElement, never>
  scale: ScaleX
  private boundsFocus: Bounds;
  private dispatcher: Dispatch;

  constructor(xScale: ScaleX, selector: string, boundsFocus: Bounds, dispatcher: Dispatch) {
    this.dispatcher = dispatcher;
    this.scale = xScale;
    this.selection = [xScale.range()[0] + 0.5, xScale.range()[1] - 1];
    this.selectorParent = selector;
    this.selector = selector + 'brush';
    this.boundsFocus = boundsFocus;
    this.el = this.createBrushX();
  }

  drawBrush() {
    this.el.call(this.brushXAxis());
    this.el.call(this.brushXAxis().move, this.selection);
  }

  private createBrushX() {
    return d3.select(`#${this.selectorParent}`).append('g').attr('id', this.selector)
  }

  brushXAxis = () =>
    d3
      .brushX()
      .extent([
        [0.5, 0.5],
        [this.boundsFocus.width - 1, this.boundsFocus.height - 1],
      ])
      .handleSize(15)
      .on('brush end', (event) => {
        this.brushed(event)
      })

  private brushed(event:BrushEvent){
    const { selection, sourceEvent } = event;
    if(sourceEvent != null){
      const domain = selection && (selection as any).map(this.scale.invert);
      this.dispatcher.brushXCall(domain)
    }
  }
  static dispatchBrushX(
    rescaleX: ScaleX,
    scaleX: ScaleX,
    el: d3.Selection<SVGGElement, unknown, HTMLElement, never>,
    behavior: d3.BrushBehavior<unknown>,
  ) {
    const domainX: d3.BrushSelection = [scaleX(rescaleX.domain()[0]), scaleX(rescaleX.domain()[1])-1]
    el.call(behavior.move, domainX)
  }
}
