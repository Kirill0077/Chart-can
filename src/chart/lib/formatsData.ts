import * as d3 from 'd3'
import { ScaleType } from '@/chart/model'

export enum Formats {
  NumberTwoDigits = ',.2f',
  NumberOneDigit = ',.1f',
  NumberZeroDigit = ',.0f',
  NumberExponential = '3.2e',
  DefaultTime = '%d %H:%M:%S',
  DateTimeFull = '%d.%m.%Y %H:%M:%S',
  Date = '%d.%m.%Y',
  Time = '%H:%M:%S',
}

/**
 * @summary фунгкция для перевода в нужный формат числа по спецификатору (правилу)
 * @param value значние, которое нужно форматировать
 * @param formatRule спецификатор (правило), по которому происходит форматирование
 * @returns отформатированный результат
 */
export const toFormatNumber = (value: number | string = 0, formatRule: string = ',.2f') => {
  const formatInit = d3
    .formatLocale({
      thousands: ' ',
      grouping: [3],
      currency: ['$', ''],
      decimal: '.',
    })
    .format(formatRule)
  return typeof value === 'number' ? formatInit(value) : formatInit(parseFloat(value))
}

export function writeFormatTitleX(
  value: number | Date | undefined,
  scale: ScaleType,
  format: string | undefined,
): string {
  switch (scale) {
    case ScaleType.numeric:
      return toFormatNumber(value as number, format)
    case ScaleType.time:
      return d3.timeFormat(format ?? '%Y-%m-%d')(value as Date)
    default:
      return String()
  }
}
