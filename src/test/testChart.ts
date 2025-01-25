import type { Series, LinearPoint, PointsSeries } from '@/chart/model'

export function getPlotData(): Series[] {
  const series: Series[] = []
  const tMin: LinearPoint[] = []
  const tHDPC: LinearPoint[] = []
  const tWDPC: LinearPoint[] = []
  const elevation: LinearPoint[] = []

  for (let i = 0; i < 10000; i++) {
    elevation.push({
      distance: i,
      value: Math.random() * 2 + 200,
    })
    tMin.push({
      distance: i,
      value: Math.random() * 1.3 + 4,
    })
    tHDPC.push({
      distance: i,
      value: Math.random() * -1.1 - 40,
    })
    tWDPC.push({
      distance: i,
      value: Math.random() * 1.2 - 20,
    })
  }

  const tminSeries: Series = {
    paneName: 'one',
    displayName: 'T min',
    axisName: 'tAxis',
    points: tMin as PointsSeries,
    style: {
      color: '#e35f7f',
      thickness: 2,
    },
    crosshairOprions: {
      tooltip: {
        format: ',.2f',
        suffix: '',
        title: 'T min',
      },
    },
    isVisible: true,
  }

  const hpdSeries: Series = {
    paneName: 'two',
    displayName: 'DP Hydraulic',
    axisName: 'tAxis',
    points: tHDPC as PointsSeries,
    style: {
      color: '#84da2b',
      thickness: 2,
    },
    crosshairOprions: {
      tooltip: {
        format: ',.2f',
        suffix: '',
        title: 'DP Hydraulic',
      },
    },
    isVisible: true,
  }

  const wdpSeries: Series = {
    paneName: 'one',
    displayName: 'DP Water',
    axisName: 'tAxis',
    points: tWDPC as PointsSeries,
    style: {
      color: '#33ccff',
      thickness: 2,
    },
    crosshairOprions: {
      tooltip: {
        format: ',.2f',
        suffix: '',
        title: 'DP Water',
      },
    },
  }

  const elevationSeries: Series = {
    paneName: 'two',
    displayName: 'Elevation',
    axisName: 'lAxis',
    points: elevation as PointsSeries,
    style: {
      color: '#ec57fb',
      thickness: 2,
    },
    crosshairOprions: {
      tooltip: {
        format: ',.2f',
        suffix: '',
        title: 'Elevation',
      },
    },
  }
  const elevationSeriesSecond: Series = {
    paneName: 'three',
    displayName: 'Elevation',
    axisName: 'lAxis',
    points: elevation as PointsSeries,
    style: {
      color: 'white',
      thickness: 2,
    },
    crosshairOprions: {
      tooltip: {
        format: ',.2f',
        suffix: '',
        title: 'Elevation',
      },
    },
  }

  series.push(...[hpdSeries, wdpSeries, tminSeries, elevationSeries, elevationSeriesSecond])

  return series
}
