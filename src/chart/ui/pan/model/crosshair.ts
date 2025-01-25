import * as d3 from 'd3'
import {
  type CrosshairData,
  type Series,
  type Bounds,
  defaultOptionsChart,
  type ChartProcessedOptions,
} from '@/chart/model'

interface ICrosshair {
  moveCrosshair(dataCrosshair: CrosshairData): void
  leaveCrosshair(): void
}

export class Crosshair implements ICrosshair {
  container: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>
  pointers: d3.Selection<SVGCircleElement, unknown, HTMLElement, unknown>[] = []
  verticalLine: d3.Selection<SVGLineElement, unknown, HTMLElement, unknown>
  horizontalLines: d3.Selection<SVGLineElement, unknown, HTMLElement, unknown>[] = []
  selectorParent: string
  selector: string
  bounds: Bounds
  serieses: Series[]
  options: ChartProcessedOptions
  private defOpt = defaultOptionsChart()
  private viewBox: string

  constructor(
    selectorParent: string,
    boundsListening: Bounds,
    serieses: Series[],
    options: ChartProcessedOptions,
  ) {
    this.options = options
    this.selectorParent = selectorParent
    this.serieses = serieses
    this.selector = selectorParent + 'crosshair'
    this.bounds = boundsListening
    this.viewBox = `0 0 ${this.bounds.width} ${this.bounds.height}`
    this.container = this.createContainer()
    this.verticalLine = this.createVerticalLine()
    this.createHorizontalLine()
    this.createPointers()
  }

  private createContainer() {
    return d3
      .select(`#${this.selectorParent}`)
      .append('svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('id', this.selector)
      .attr('viewBox', this.viewBox)
      .style('left', `${this.bounds.x}px`)
      .style('top', `${this.bounds.y}px`)
      .attr('width', `${this.bounds.width}px`)
      .attr('height', `${this.bounds.height}px`)
      .attr('class', 'crosshair-container')
      .style('z-index', 3)
      .style('position', 'absolute')
  }

  private createVerticalLine() {
    return this.container
      .append('line')
      .attr('class', 'crosshair-line')
      .style('pointer-events', 'none')
  }

  private createHorizontalLine() {
    this.serieses.forEach(() => {
      this.horizontalLines.push(
        this.container
          .append('line')
          .attr('class', 'crosshair-line')
          .style('pointer-events', 'none'),
      )
    })
  }

  private createPointers() {
    this.serieses.forEach((s) => {
      this.pointers.push(
        this.container
          .append('circle')
          .attr('r', (s.style.thickness ?? 2) / 2 + 3)
          .attr('class', 'crosshair-point')
          .style('fill', s.style.color)
          .style('stroke', 'white')
          .style('display', 'none')
          .style('pointer-events', 'none'),
      )
    })
  }

  moveCrosshair(dataCrosshair: CrosshairData) {
    //находим координаты
    dataCrosshair.position.forEach((v, name) => {
      const index = this.serieses.findIndex((s) => s.displayName == name)!
      const xPos = dataCrosshair.position.get(name)!.x
      const yPos = dataCrosshair.position.get(name)!.y

      if (
        xPos < this.bounds.x ||
        yPos < this.bounds.y ||
        xPos > this.bounds.width ||
        yPos > this.bounds.height
      )
        return

      if (this.options.crosshair.mode === 'area') {
        this.pointers.forEach((p, i) => {
          p.style('display', 'none')
          this.horizontalLines[i].style('display', 'none')
        })
      }
      this.pointers[index]
        .transition()
        .duration(this.defOpt.duration)
        .style('display', 'block')
        .attr('cx', xPos)
        .attr('cy', yPos)

      this.horizontalLines[index]
        .transition()
        .duration(this.defOpt.duration)
        .style('display', 'block')
        .attr('x2', this.bounds.width)
        .attr('y1', yPos)
        .attr('y2', yPos)

      this.verticalLine
        .transition()
        .duration(this.defOpt.duration)
        .style('display', 'block')
        .attr('x1', xPos)
        .attr('x2', xPos)
        .attr('y1', 0)
        .attr('y2', this.bounds.height)
    })
  }

  leaveCrosshair() {
    this.pointers.forEach((_, i, arr) => {
      arr[i].style('display', 'none')
    })
    this.horizontalLines.forEach((v, i, arr) => {
      arr[i].style('display', 'none')
    })
    this.verticalLine.style('display', 'none')
  }

  visibleCrosshair() {
    this.pointers.forEach((_, i, arr) => {
      arr[i].style('display', 'block')
    })
    this.horizontalLines.forEach((v, i, arr) => {
      arr[i].style('display', 'block')
    })
    this.verticalLine.style('display', 'block')
  }
}
