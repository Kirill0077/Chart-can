import type {
  Bounds,
  ChartProcessedOptions,
  LinearPoint,
  PaneInfo,
  ScaleX,
  ScaleY,
  Series,
  TimePoint
} from '@/chart/model'
import * as d3 from 'd3'
import { hexToRgba } from '@/chart/lib'

export class Canvas {
  context: CanvasRenderingContext2D;
  bounds: Bounds;
  options:ChartProcessedOptions;
  private panInfo: PaneInfo;
  private selector: string;

  constructor(selector: string, panInfo: PaneInfo, bounds: Bounds, options: ChartProcessedOptions) {
    this.bounds = bounds
    this.options = options
    this.panInfo = panInfo
    this.selector = selector + 'canvas'
    this.context = this.getContext(selector)
  }

  draw(series: Series[], rescaleX: ScaleX, rescaleY: Map<string, ScaleY>) {
    this.drawCanvas(series, rescaleX, rescaleY)
  }

  private getContext(selector: string): CanvasRenderingContext2D {
    const canvas = d3
      .select(`#${selector}`)
      .append('canvas')
      .attr('id', this.selector)
      .style('position', 'absolute')
      .style('left', `${this.bounds.x}px`)
      .style('top', `${this.bounds.y}px`)
      .attr('width', `${this.bounds.width}px`)
      .attr('height', `${this.bounds.height}px`)

    return canvas.node()!.getContext('2d')!
  }

  private drawCanvas(_series: Series[], _scaleX: ScaleX, _scaleY: Map<string, ScaleY>) {
    this.context.save()
    this.context.clearRect(0, 0, this.bounds.width, this.bounds.height)
    _series.forEach((s) => {
      this.context.beginPath()
      this.context.lineWidth = s.style.thickness ?? 2
      this.context.strokeStyle = s.style.color
      switch (this.panInfo.diagramType) {
        case 'line':
          this.line(s, _scaleX, _scaleY)
          this.context.stroke()
          break
        case 'area':
          this.line(s, _scaleX, _scaleY)

          if (s.style.isGradient != undefined && s.style.isGradient) {
            const gradient = this.context.createLinearGradient(
              0,
              15,
              0,
              _scaleY.get(s.axisName)!.range()[0],
            )
            gradient.addColorStop(0, s.style.color)
            gradient.addColorStop(1, 'rgba(255,255,255,0.04)')
            this.context.fillStyle = gradient
          } else {
            this.context.fillStyle = hexToRgba(s.style.color, 0.3)
          }
          this.context.stroke()
          this.context.fill()
          break
      }
      this.context.restore()
    })
  }

  private line(series: Series, _scaleX: ScaleX, _scaleY: Map<string, ScaleY>) {
    const yScale = _scaleY.get(series.axisName)!
    if (this.options.scaleType == 'time') {
      const xScale = _scaleX as d3.ScaleTime<number, number>
      d3
        .line<TimePoint>()
        .x((d) => xScale(new Date(d.time)))
        .y((d) => yScale(d.value))
        .context(this.context)(series.points as TimePoint[])
    } else {
      const xScale = _scaleX as d3.ScaleLinear<number, number>
      d3
        .line<LinearPoint>()
        .x((d) => xScale(d.distance))
        .y((d) => yScale(d.value))
        .context(this.context)(series.points as LinearPoint[])
    }
  }

  // area(
  //   options: OptionsChart,
  //   rescaleX:
  //     | d3.ScaleTime<number, number, never>
  //     | d3.ScaleLinear<number, number, never>,
  //   rescaleY: Map<string, d3.ScaleLinear<number, number, never>>,
  //   series: Series,
  //   ctx: CanvasRenderingContext2D
  // ) {
  //   const yScale = rescaleY.get(series.axisName)!;
  //   if (options.scaleType == ScaleType.time) {
  //     const xScale = rescaleX as d3.ScaleTime<number, number, never>;
  //     d3
  //       .area<TimePoint>()
  //       .x((d) => xScale(new Date(d.time)))
  //       .y1((d) => yScale(d.value))
  //       .y0(() => yScale.range()[0])
  //       .context(ctx)(series.points as TimePoint[]);
  //   } else {
  //     const xScale = rescaleX as d3.ScaleLinear<number, number, never>;
  //     d3
  //       .area<LinearPoint>()
  //       .x((d) => xScale(d.distance))
  //       .y1((d) => yScale(d.value))
  //       .y0(() => yScale.range()[0])
  //       .context(ctx)(series.points as LinearPoint[]);
  //   }
  // }
}
