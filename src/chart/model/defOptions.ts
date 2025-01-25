export const defaultOptionsChart = ()=>({
  axis: {
    x: {
      height: 30,
      marker: {
        width: 90,
        height: 30,
      },
      format: {
        time: {
          def: "%d %H:%M",
          zoom: "%H:%M%:%S",
        },
        numeric: {
          def: "0.2f",
          zoom: "0.4f",
        },
      },
      limitsDef: {
        min: 0,
        max: 1,
      },
    },
    y: {
      width: 80,
      marker: {
        width: 60,
        height: 30,
      },
      format: {
        time: {
          def: "%d %H:%M",
          zoom: "%H:%M%:%S",
        },
        numeric: {
          def: "0.2f",
          zoom: "0.4f",
        },
      },
      limitsDef: {
        min: 0,
        max: 1,
      },
    },
  },
  focus: {
    height: 100,
  },
  scroll: {
    width: 20,
  },
  tooltip: {
    format: {
      time: "%d.%m %H:%M:%S",
      numeric: ",.2f",
    },
  },
  zoom: {
    divider: 20 * 60 * 1000,
    limits:{
      min: 1,
      max: 500, // 1 minute to 1000000 milliseconds
    }// milliseconds,
  },
  duration: 50,
});
