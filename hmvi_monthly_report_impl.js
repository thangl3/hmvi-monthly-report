let colorGood = "#7cc576",
  colorBad = "#f26c4f",
  colorNeutral = "#6dcff6",
  colorGrey = "#3c3c3c";
let forecast_horizon = 12;

function createUSExplorer(
  container_name,
  hmvi_time,
  hmvi_us,
  hmvi_us_chg,
  hmvi_num_states_trend_up,
  hmvi_num_states_outperforming,
  hmvi_pct_metro_trend_up,
  hmvi_pct_metro_outperforming
) {
  var forecast_start_index = hmvi_time.length - forecast_horizon;
  var forecast_end_index = hmvi_time.length - 1;
  Highcharts.chart("us_chart", {
    navigator: {
      /*
  We are using Highcharts Navigator without using HighStock
  The navigator appears to get the index into the xaxis, so we explicity
  return  the formatted date.
  */
      enabled: true,
      margin: 5,
      xAxis: {
        type: "datetime",
        labels: {
          formatter: function () {
            return Highcharts.dateFormat("%b %Y", hmvi_time[this.value]);
          }
        }
      }
    },
    xAxis: {
      type: "datetime",
      categories: hmvi_time,
      plotBands: [
        {
          color: "#FCFFC5",
          from: forecast_start_index,
          to: forecast_end_index
        }
      ],
      labels: {
        format: "{value: %b %Y}",
        step: 6,
        rotation: 270
      },
      crosshair: {
        width: 1,
        color: "gray",
        dashStyle: "shortdot"
      },
      offset: 5,
      endOnTick: false,
      startOnTick: false
    },
    yAxis: [
      {
        offset: 5,
        title: {
          text: "Monthly level",
          offset: 40
        },
        height: "25%",
        lineWidth: 1,
        startOnTick: false,
        endOnTick: false,
        maxPadding: 0.05
      },
      {
        offset: 5,
        title: {
          text: "12-month change",
          offset: 40
        },
        top: "27%",
        height: "25%",
        lineWidth: 1,
        startOnTick: false,
        endOnTick: false,
        maxPadding: 0.05
      },
      {
        offset: 5,
        title: {
          text: "# States",
          offset: 40
        },
        min: 0,
        max: 51,
        top: "54%",
        height: "20%",
        lineWidth: 1,
        startOnTick: false,
        endOnTick: false,
        maxPadding: 0.05
      },
      {
        offset: 5,
        title: {
          text: "% Metros",
          offset: 40
        },
        min: 0,
        max: 100,
        top: "76%",
        height: "20%",
        lineWidth: 1,
        startOnTick: false,
        endOnTick: false,
        maxPadding: 0.05
      }
    ],
    series: [
      {
        type: "spline",
        name: "Monthly level",
        label: "",
        marker: {
          enabled: false
        },
        states: {
          hover: {
            enabled: false
          }
        },

        data: hmvi_us,
        zones: [
          {
            value: 100,
            color: colorBad
          },
          {
            value: 1000,
            color: colorGood
          }
        ],
        showInNavigator: true
      },
      {
        type: "spline",
        name: "12-month change",
        label: "",
        marker: {
          enabled: false
        },
        states: {
          hover: {
            enabled: false
          }
        },

        data: hmvi_us_chg,
        zones: [
          {
            value: 0,
            color: colorBad
          },
          {
            value: 1000,
            color: colorGood
          }
        ],
        yAxis: 1
      },
      {
        type: "line",
        name: "# States Trending Up",
        marker: {
          enabled: false
        },
        states: {
          hover: {
            enabled: false
          }
        },
        data: hmvi_num_states_trend_up,
        color: colorNeutral,
        yAxis: 2
      },
      {
        type: "line",
        name: "# States Outperforming",
        marker: {
          enabled: false
        },
        states: {
          hover: {
            enabled: false
          }
        },
        data: hmvi_num_states_outperforming,
        color: colorGood,
        yAxis: 2
      },
      {
        type: "line",
        name: "% Metros Trending Up",
        marker: {
          enabled: false
        },
        states: {
          hover: {
            enabled: false
          }
        },
        data: hmvi_pct_metro_trend_up,
        color: colorNeutral,
        yAxis: 3
      },
      {
        type: "line",
        name: "% Metros Outperforming",
        marker: {
          enabled: false
        },
        states: {
          hover: {
            enabled: false
          }
        },
        data: hmvi_pct_metro_outperforming,
        color: colorGood,
        yAxis: 3
      }
    ],
    tooltip: {
      shared: true,
      crosshair: true,
      followPointer: true,
      xDateFormat: "%B %Y"
    },
    title: {
      text: null
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    chart: {
      animation: false
    }
  });
}
