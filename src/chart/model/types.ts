import * as d3 from 'd3'

export type PaneInfo = {
  name:string;
  diagramType: "line" | "area";
  limitsAxisX?:Limits;
}

export type DomainPane = {
  pane: PaneInfo;
  serieses: Series[];
  axesY: AxisInfo[];
}

export type ChartOptions = {
  limitsZoom?: Limits;
  format?: string;
  scaleType:ScaleType;
  zoomMode?: "x" | "y" | "xy";
  crosshair?:CrosshairOptions
}

export type ChartProcessedOptions = Required<ChartOptions>
export type Options = {
  chart: ChartOptions;
  panes: PaneInfo[];
  serieses: Series[];
  axesY: AxisInfo[];
}

export class OptionsUserChart {
    limitsZoom?: Limits;
    zoomMode?: ZoomMode = ZoomMode.X;
    axesY!: AxisInfo[];
    isShowFocus: boolean = false;
    isReadonly: boolean = false;
    isShowCrosshair: boolean = false;
    scaleType: ScaleType = ScaleType.time;
    diagramType: DiagramType = DiagramType.line;
    isShowAxis?: AxisDisplay = AxisDisplay.XY;
    crosshairOptions?: CrosshairOptions;
    limitsAxisX?:Limits
}

export type ZoomEvent = {
  transform:d3.ZoomTransform;
  sourceEvent: WheelEvent | MouseEvent | null;
  target: string
}

export type BrushEvent = {
  selection:d3.BrushSelection;
  sourceEvent: WheelEvent | MouseEvent | null;
  target: string
  mode: "drag" | "space" | "handle" | "center"
}

interface CommonPoint {
    value: number;
}

export type TimePoint = CommonPoint & {
    time: Date;
};

export type LinearPoint = CommonPoint & {
    distance: number;
};

export type PointsSeries = TimePoint[] & LinearPoint[];

export type Series = {
    points: PointsSeries;
    displayName: string;
    style: StyleSeries;
    crosshairOprions?: CrosshairOptionsSeries;
    limitsX?: Limits;
    axisName: string;
    paneName:string;
    isVisible?: boolean;
};

type StyleSeries = {
    color: string;
    thickness?: number;
    isGradient?: boolean;
};

export type AxisInfo = {
    name: string;
    paneName:string;
    displayName?: string;
    suffix?: string;
    ticks: Ticks;
    limits?: Limits;

};

export type ValuesSeries = {
    x: Date[] | number[];
    y: number[];
}
/**
 * @summary API describes the style of axis values
 * @property **format** - string that represents a specifier (rule) by which the value is formatted
 *  - Example:   ```d3.format(".1")(4.2) // "4"```
 *  - [learn more about d3.format](https://d3js.org/d3-format#locale_format)
 * @property **countTicks** - number of values ​​displayed on the axis
 * @property **paddingTicks** - current padding [px] from axis
 * [more](https://d3js.org/d3-axis#axis_tickPadding)
 */
export type Ticks = {
    format?: string;
    countTicks: number;
    paddingTicks?: number;
};

export type CanvasContainer = {
  bounds: Bounds;
}

export type AxisContainer = {
    container: Bounds;
    axis: AxisInfo;
};

export type Bounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export interface Container {
  readonly panInfo:PaneInfo;
  readonly bounds: Bounds;
  readonly selector: string;
}

export type Limits = {
    min?: number | Date;
    max?: number | Date;
};

export interface Selectors {
    div: string;
    svg: string;
    focus: string;
    scroll: string;
    canvas: string;
    brushX: string;
    brushY: string;
    axisX: string;
    crosshair: string;
    tooltip: string;
    listening: string;
    axesY: Map<string, string>;
}


export type DataListening = {
    scaleX:
        | d3.ScaleTime<number, number, never>
        | d3.ScaleLinear<number, number, never>;
    scaleY: Map<string, d3.ScaleLinear<number, number, never>>;
    zoomValues: ValuesSeries[];
};

export type TooltipData = {
    position: Point2D;
    value: Map<string, { x: number | Date; y: number }>;
};

export type CrosshairData = {
    position: Map<string, Point2D>;
};

export type CrosshairOptionsSeries = {
    tooltip?: {
        format?: string;
        suffix?: string;
        title?: string;
    };
    verticalMarker?: {
        format?: string;
        color?: string;
        borderWidth?: number;
    };
    horizontalmarker?: {
        format?: string;
        color?: string;
        borderWidth?: number;
    };
};

export type CrosshairOptions = {
    mode?:CrosshairMode;
    tooltip: {
        isShow: boolean;
        isGrouping: boolean;
        formatAxisX?: string;
        axisXTitle?: string;
        groups?: Map<string, Series[]>;
        suffix?: string;
    };
    verticalLine?: {
        isShow: boolean;
        color?: string;
        width?: number;
    };
    horizontalLine?: {
        isShow: boolean;
        color?: string;
        width?: number;
    };
    circle?: {
        isShow: boolean;
        color?: string;
        radius?: number;
    };
};

export enum ScaleType {
    time = "time",
    numeric = "Numeric",
}

export enum DiagramType {
    line = "line",
    area = "area",
}

export enum ZoomMode {
    X = "x",
    Y = "y",
    XY = "xy",
}

export enum AxisDisplay {
    none = "none",
    X = "X",
    Y = "Y",
    XY = "XY",
}

export type CrosshairMode = "x" | "y" | "area" | "none"

export type ControlsOptions = {
    zoomBase:d3.ZoomTransform
}

export class Point2D {
  x: number
  y: number

  constructor()
  constructor(point: Point2D)
  constructor(point?: Point2D) {
    this.x = point?.x ?? 0;
    this.y = point?.y ?? 0;
  }
}

export type ScaleX = d3.ScaleTime<number, number, never> | d3.ScaleLinear<number, number, never>;
export type ScaleY = d3.ScaleLinear<number, number>;
