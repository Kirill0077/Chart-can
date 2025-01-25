import { Point2D } from '@/chart/model'
import type { TooltipValue } from '@/chart/ui/tooltip'

export class Tooltip {
  tooltipComponent: any
  tooltipElement: HTMLElement
  dataTooltip: Map<string, { x: number | Date; y: number }>

  constructor(tooltip: any) {
    this.tooltipComponent = tooltip
    this.tooltipElement = tooltip.$el
    this.dataTooltip = new Map()
  }

  /**
   * @summary Вычисление итоговой позиции тултипа в зависимости от положения курсора мыши.
   *  Данная функция работает таким образом, что тултип находится снизу справа от курсора с определёнными отступами.
   *  Кроме тех случаев, когда тултип выходит за правую и нижнюю границу графика.
   * @param position позция курсора (мировые координаты)
   * @param tooltipGlobalBounds размеры тултипа
   * @param containerGlobalBounds глобальные координаты и размеры контейнера
   * @returns итоговая позиция тултипа
   */
  private placementTooltip(
    position: Point2D,
    tooltipGlobalBounds: DOMRect,
    containerGlobalBounds: DOMRect,
  ): Point2D {
    //отступы от указателя
    const margin = {
      left: 30,
      top: 20,
    }
    //ограничения по горизонтали и вертикали (глобальные координаты правого и нижнего края тултипа)
    const defaultXLimit = position.x + margin.left + tooltipGlobalBounds.width
    const defaultYLimit = position.y + margin.top + tooltipGlobalBounds.height
    /**
     * @summary Далее примитивная логика. Есть два условия внутренне и внешнее:
     *  - Внешнее: если тултип выходит за правую границу
     *  - Внутрение: если тултип выходит за нижню границу
     *
     *  Сначала обробатывается внешнее два случая если выходит и не выходит за парвую грницу.
     *  И каждый случай рассматривает внутринее условие (выходит/не выходит за нижню границу)
     */
    if (defaultXLimit >= containerGlobalBounds.right) {
      if (defaultYLimit > containerGlobalBounds.bottom) {
        const x = position.x - tooltipGlobalBounds.width - margin.left
        const y = containerGlobalBounds.bottom - tooltipGlobalBounds.height
        return {
          x,
          y,
        }
      } else {
        const x = position.x - tooltipGlobalBounds.width - margin.left
        const y = position.y + margin.top
        return {
          x,
          y,
        }
      }
    } else {
      if (defaultYLimit > containerGlobalBounds.bottom) {
        const x = position.x + margin.left
        const y = containerGlobalBounds.bottom - tooltipGlobalBounds.height
        return {
          x,
          y,
        }
      } else {
        const x = position.x + margin.left
        const y = position.y + margin.top
        return {
          x,
          y,
        }
      }
    }
  }

  moveTooltip(position: { x: number; y: number }) {
    const pageBounds = document.body.getBoundingClientRect()
    console.log(pageBounds)
    const tooltipBounds = this.tooltipElement.getBoundingClientRect()
    const processedPos = this.placementTooltip(position, tooltipBounds, pageBounds)
    this.tooltipElement.style.left = `${processedPos.x}px`
    this.tooltipElement.style.top = `${processedPos.y}px`
    this.tooltipElement.style.visibility = 'visible'
    this.tooltipComponent.updateValue(this.dataTooltip)
  }

  updateDataTooltip(data: TooltipValue) {
    data?.forEach((v, k) => {
      this.dataTooltip.set(k, v)
    })
  }

  leaveTooltip(): void {
    this.tooltipElement.style.visibility = 'hidden'
  }

  visibleTooltip(): void {
    this.tooltipElement.style.visibility = 'visible'
  }
}
