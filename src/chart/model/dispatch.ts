import * as d3 from 'd3'
import { BrushY, Diagram, ListeningArea } from '@/chart/ui/pan'
import type { ScaleX, ScaleY } from '@/chart/model/types.ts'
import { Zoom } from '@/chart/model/zoom.ts'

export class Dispatch {
  dispatch: d3.Dispatch<object>
  selectorParent: string
  selectorsPanes: string[]
  selectorFocus: string = String()
  currentTransform: d3.ZoomTransform = d3.zoomIdentity

  constructor(selectorParent: string, panesName: string[]) {
    this.selectorsPanes = panesName
    this.dispatch = d3.dispatch(selectorParent, 'crosshair')
    this.selectorParent = selectorParent
  }

  zoomCall(
    selector: string,
    transform: d3.ZoomTransform,
    rescaleX: ScaleX | null,
    rescaleY: ScaleY | null,
  ) {
    this.currentTransform = transform
    this.dispatch.call(this.selectorParent, 'sd' as Object, [
      selector,
      transform,
      null,
      rescaleX,
      rescaleY,
    ])
  }

  brushXCall(selection: (number | Date)[]) {
    this.dispatch.call(this.selectorParent, 'brush' as Object, [
      'focus',
      null,
      selection,
      null,
      null,
    ])
  }

  brushYCall(selector: string, selection: [number, number]) {
    this.dispatch.call(this.selectorParent, 'scroll' as Object, [
      selector,
      null,
      selection,
      null,
      null,
    ])
  }

  crosshairCall(selector: string, value: MouseEvent | null) {
    this.dispatch.call('crosshair', {}, [selector, value])
  }

  zoomListening(
    sender: string,
    args: {
      diagram: Diagram
      behavior: d3.ZoomBehavior<Element, unknown>
    },
  ) {
    this.dispatch.on(this.selectorParent + `.${sender}`, ([selector, transform, selection]) => {
      if (selector === sender) return
      if (!transform && !selection) return
      if (selector === 'focus') {
        Zoom.ZoomBrushX(selection, args.diagram, args.behavior, this.currentTransform)
      } else if (selection !== null) {
        Zoom.ZoomBrushY(selection, args.diagram, args.behavior, this.currentTransform)
      } else {
        Zoom.dispatchZoom(transform, args.diagram, args.behavior)
      }
    })
  }

  zoomListeningScroll(
    sender: string,
    func: (
      rescaleY: ScaleY,
      scaleY: ScaleY,
      el: d3.Selection<SVGGElement, unknown, HTMLElement, never>,
      behavior: d3.BrushBehavior<unknown>,
    ) => void,
    args: {
      scaleY: ScaleY
      el: d3.Selection<SVGGElement, unknown, HTMLElement, never>
      behavior: d3.BrushBehavior<unknown>
    },
  ) {
    this.dispatch.on(
      this.selectorParent + `.${sender}`,
      ([selector, transform, selection, , rescaleY]) => {
        if (selector === sender) return
        if (selector === 'focus') return
        if (rescaleY === null) {
          if (selection === null) {
            return
          } else {
            BrushY.dispatchBrushYScroll(selection, args.el, args.behavior)
          }
        } else {
          const newRescaleY = (transform as d3.ZoomTransform).rescaleY(args.scaleY)
          BrushY.dispatchBrushY(newRescaleY, args.scaleY, args.el, args.behavior)
        }
      },
    )
  }

  zoomListeningFocus(
    func: (
      rescaleX: ScaleX,
      scaleX: ScaleX,
      el: d3.Selection<SVGGElement, unknown, HTMLElement, never>,
      behavior: d3.BrushBehavior<unknown>,
    ) => void,
    args: {
      scaleX: ScaleX
      el: d3.Selection<SVGGElement, unknown, HTMLElement, never>
      behavior: d3.BrushBehavior<unknown>
    },
  ) {
    this.dispatch.on(this.selectorParent + '.focus', ([selector, , , rescaleX]) => {
      if (selector === 'focus') return
      if (rescaleX === null) return
      func(rescaleX, args.scaleX, args.el, args.behavior)
    })
  }

  crosshairListening(sender: string, crosshair: ListeningArea) {
    this.dispatch.on(`crosshair.${sender}`, ([selector, value]) => {
      if (selector === sender) return
      if (value === null) {
        crosshair.leave();
      } else {
        crosshair.move(value);
      }
    })
  }
}
