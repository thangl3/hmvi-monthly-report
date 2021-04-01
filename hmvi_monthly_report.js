$(function () {
  //  let data_url = '/wp-content/uploads/monthly-report/data/monthly_report_data.json"
  let data_url = "./monthly_report_data.json";
  let state_report_prefix = 'https://housingiq.wainstreet.com/state-reports/';
  let metro_report_prefix = 'https://housingiq.wainstreet.com/market-reports/place_id-';


  $.getJSON('http://ravel.hopto.org:8080/monthly-report//data/monthly_report_data.json', function (monthly_data) {
    //Extract data series to make sure JSON is well-structured
    let hmvi_time = monthly_data["hmvi_time.ts"];
    hmvi_time = hmvi_time.map((x) => Date.parse(x));
    //Get rid of time format and use Highcharts.dateFormat
    let hmvi_time_fmt = monthly_data["hmvi_time.fmt"];
    let hmvi_us = monthly_data["hmvi_us.ts"];
    hmvi_us = hmvi_us.map((x) => parseFloat(x));
    let hmvi_us_chg = monthly_data["hmvi_us_chg.12.ts"];
    hmvi_us_chg = hmvi_us_chg.map((x) => parseFloat(x));
    let hmvi_num_states_trend_up = monthly_data["hmvi_us_num_states_trend_up.ts"];
    hmvi_num_states_trend_up = hmvi_num_states_trend_up.map((x) => parseFloat(x));
    let hmvi_num_states_outperforming = monthly_data["hmvi_us_num_states_outperforming.ts"];
    hmvi_num_states_outperforming = hmvi_num_states_outperforming.map((x) => parseFloat(x));
    let hmvi_pct_metro_trend_up = monthly_data["hmvi_us_pct_metro_trend_up.ts"];
    hmvi_pct_metro_trend_up = hmvi_pct_metro_trend_up.map((x) => parseFloat(x));
    let hmvi_pct_metro_outperforming = monthly_data["hmvi_us_pct_metro_outperforming.ts"];
    hmvi_pct_metro_outperforming = hmvi_pct_metro_outperforming.map((x) => parseFloat(x));


    let top_states = JSON.parse(monthly_data.top_states[0]),
      bottom_states = JSON.parse(monthly_data.bottom_states[0]),
      state_performance_data_rows = JSON.parse(
        monthly_data.state_performance.data_rows
      ),
      map_data_state = JSON.parse(monthly_data.map_data_state[0]),
      top_metros = JSON.parse(monthly_data.top_metros[0]),
      bottom_metros = JSON.parse(monthly_data.bottom_metros[0]),
      metro_performance_data_rows = JSON.parse(
        monthly_data.metro_performance.data_rows
      ),
      map_data_metro = JSON.parse(monthly_data.map_data_metro[0]);
    $("#report_date").html(monthly_data.report_date);
    $("#us_overview").html(monthly_data.us_overview);
    $("#us_overview_2").html(monthly_data.us_overview_2);
    $("#state_overview").html(monthly_data.state_overview);
    $("#state_performance_overview").html(monthly_data.state_performance.overview);
    $("#metro_overview").html(monthly_data.metro_overview);
    $("#metro_performance_overview").html(monthly_data.metro_performance.overview);
    $("#methodology_text_1").html(monthly_data.methodology_text_1);
    $("#methodology_text_2").html(monthly_data.methodology_text_2);
    $("#about_text_1").html(monthly_data.about_text_1);
    $("#about_text_2").html(monthly_data.about_text_2);
    for (let i = 1; i < 5; i++) {
      for (let j = 1; j < 5; j++) {
        $("#state_cross_tabs_tr_" + i + "_" + j)[0].innerHTML =
          state_performance_data_rows[i - 1][j - 1];
        $("#metro_cross_tabs_tr_" + i + "_" + j)[0].innerHTML =
          metro_performance_data_rows[i - 1][j - 1];
      }
    }
    for (let i = 1; i < 4; i++) {
      $("#state_performance_top_table_tr_" + i + "_1")[0].innerHTML =
        top_states[i - 1].place_id;
      $("#state_performance_top_table_tr_" + i + "_2")[0].innerHTML =
        top_states[i - 1].forecasted_appreciation;
      $("#state_performance_bottom_table_tr_" + i + "_1")[0].innerHTML =
        bottom_states[i - 1].place_id;
      $("#state_performance_bottom_table_tr_" + i + "_2")[0].innerHTML =
        bottom_states[i - 1].forecasted_appreciation;
    }
    for (let i = 1; i < 6; i++) {
      $("#metro_performance_top_table_tr_" + i + "_1")[0].innerHTML =
        top_metros[i - 1].place_name;
      $("#metro_performance_top_table_tr_" + i + "_2")[0].innerHTML =
        top_metros[i - 1].forecasted_appreciation;
      $("#metro_performance_bottom_table_tr_" + i + "_1")[0].innerHTML =
        bottom_metros[i - 1].place_name;
      $("#metro_performance_bottom_table_tr_" + i + "_2")[0].innerHTML =
        bottom_metros[i - 1].forecasted_appreciation;
    }

    // Highcharts
    // trend
    let chart_marker_radius = 6;
    let chart_text_font_size = 12;
    let history_length = 36;
    let trend_value_good_cutoff = 100,
      trend_change_value_good_cutoff = 0;

    //We only display "history_length" number of months
    startPointIndex =
      hmvi_us.length - (history_length + forecast_horizon) - 1;
    hmvi_data = hmvi_us.slice(startPointIndex);
    hmvi_data = hmvi_data.map((x) => parseFloat(x));
    hmvi_chg_data = monthly_data["hmvi_us_chg.12.ts"].slice(startPointIndex);
    hmvi_chg_data = hmvi_chg_data.map((x) => parseFloat(x));
    hmvi_data_time = hmvi_time_fmt.slice(startPointIndex);

    //We pass the data to the line chart in "segments" so it can be styled, labeled, etc.
    let twelveMonthForecastPointIndex = hmvi_data_time.length - 1; //48
    let currentPointIndex = twelveMonthForecastPointIndex - forecast_horizon; //36
    let threeMonthForecastPointIndex =
      twelveMonthForecastPointIndex - (forecast_horizon - 3); //39

    let trend_actual = [],
      trend_forecast_3m = [],
      trend_forecast_12m = [];
    for (let i = 1; i < currentPointIndex; i++)
      trend_actual[i - 1] = hmvi_data[i];
    for (let i = currentPointIndex + 1; i < threeMonthForecastPointIndex; i++)
      trend_forecast_3m[i - currentPointIndex - 1] = hmvi_data[i];
    for (
      let i = threeMonthForecastPointIndex + 1;
      i < twelveMonthForecastPointIndex;
      i++
    )
      trend_forecast_12m[i - threeMonthForecastPointIndex - 1] = hmvi_data[i];

    let change_trend_actual = [],
      change_trend_forecast_3m = [],
      change_trend_forecast_12m = [];
    for (let i = 1; i < currentPointIndex; i++)
      change_trend_actual[i - 1] = hmvi_chg_data[i];
    for (let i = currentPointIndex + 1; i < threeMonthForecastPointIndex; i++)
      change_trend_forecast_3m[i - currentPointIndex - 1] = hmvi_chg_data[i];
    for (
      let i = threeMonthForecastPointIndex + 1;
      i < twelveMonthForecastPointIndex;
      i++
    )
      change_trend_forecast_12m[i - threeMonthForecastPointIndex - 1] =
        hmvi_chg_data[i];

    //We want to stack the two line charts (independent y-axis) and have a common time axis (x-axis)
    //So we play with the y-axis for both charts to create space below the top chart and above the bottom chart
    let trend_y_axis_max,
      trend_y_axis_min,
      change_trend_y_axis_max,
      change_trend_y_axis_min;
    trend_y_axis_max = Math.max(...hmvi_data);
    trend_y_axis_min = Math.min(...hmvi_data);

    change_trend_y_axis_max = Math.max(...hmvi_chg_data);
    change_trend_y_axis_min = Math.min(...hmvi_chg_data);

    trend_y_axis_min =
      trend_y_axis_max - (trend_y_axis_max - trend_y_axis_min) * 2.5;
    change_trend_y_axis_max =
      change_trend_y_axis_min +
      (change_trend_y_axis_max - change_trend_y_axis_min) * 2.5;

    let time_axis = hmvi_data_time;
    Highcharts.chart(
      "us_summary_chart",
      {
        chart: {
          type: "spline"
        },
        title: {
          text: "HOUSING MARKET VITALITY INDICATOR"
        },
        subtitle: {
          text:
            history_length +
            "-month trend and " +
            forecast_horizon +
            "-month forecast"
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: time_axis,
          lineWidth: 0,
          labels: {
            enabled: false
          },
          endOnTick: true,
          startOnTick: true,
          plotLines: [
            {
              value: currentPointIndex,
              zIndex: 0,
              width: 1,
              color: "grey",
              dashStyle: "Dot",
              label: {
                text: hmvi_data_time[currentPointIndex],
                align: "center",
                rotation: 90,
                style: {
                  color: "grey",
                  fontSize: chart_text_font_size,
                  fontWeight: "bold"
                }
              }
            },
            {
              value: threeMonthForecastPointIndex,
              zIndex: 0,
              width: 1,
              color: "grey",
              dashStyle: "Dot",
              label: {
                text: hmvi_data_time[threeMonthForecastPointIndex],
                align: "center",
                rotation: 90,
                style: {
                  color: "grey",
                  fontSize: chart_text_font_size,
                  fontWeight: "bold"
                }
              }
            },
            {
              value: twelveMonthForecastPointIndex,
              zIndex: 0,
              width: 1,
              color: "grey",
              dashStyle: "Dot",
              label: {
                text: hmvi_data_time[twelveMonthForecastPointIndex],
                align: "center",
                rotation: 90,
                style: {
                  color: "grey",
                  fontSize: chart_text_font_size,
                  fontWeight: "bold"
                }
              }
            }
          ],
          crosshair: {
            width: 1,
            color: "gray",
            dashStyle: "shortdot"
          }
        },
        yAxis: [
          {
            // Primary yAxis -- monthly levels
            title: null,
            labels: {
              enabled: false
            },
            gridLineWidth: 0,
            startOnTick: false,
            endOnTick: false,
            maxPadding: 0.05,
            min: trend_y_axis_min
          },
          {
            // Secondary yAxis-- change
            title: null,
            labels: {
              enabled: false
            },
            gridLineWidth: 0,
            startOnTick: false,
            endOnTick: false,
            maxPadding: 0.05,
            max: change_trend_y_axis_max
          }
        ],
        legend: {
          enabled: false
        },
        plotOptions: {
          spline: {
            dataLabels: {
              enabled: false
            }
          },
          series: {
            marker: {
              enabled: false
            },
            lineWidth: 3,
            lineColor: colorGrey,
            states: {
              hover: {
                enabled: false
              }
            }
          }
        },
        series: [
          {
            name: "",
            yAxis: 0,
            data: [
              {
                y: parseFloat(hmvi_data[0]),
                dataLabels: {
                  enabled: true,
                  align: "center",
                  shape: null
                },
                marker: {
                  enabled: true,
                  symbol: "circle",
                  fillColor:
                    parseFloat(hmvi_data[0]) >= trend_value_good_cutoff
                      ? colorGood
                      : colorBad,
                  radius: chart_marker_radius
                }
              },
              ...trend_actual,
              {
                y: parseFloat(hmvi_data[currentPointIndex]),
                dataLabels: {
                  enabled: true,
                  align: "center",
                  shape: null
                },
                marker: {
                  enabled: true,
                  symbol: "circle",
                  fillColor:
                    parseFloat(hmvi_data[currentPointIndex]) >=
                      trend_value_good_cutoff
                      ? colorGood
                      : colorBad,
                  radius: chart_marker_radius
                }
              },
              ...trend_forecast_3m,
              {
                y: parseFloat(hmvi_data[threeMonthForecastPointIndex]),
                dataLabels: {
                  enabled: true,
                  align: "center",
                  shape: null
                },
                marker: {
                  enabled: true,
                  symbol: "circle",
                  fillColor:
                    parseFloat(hmvi_data[threeMonthForecastPointIndex]) >=
                      trend_value_good_cutoff
                      ? colorGood
                      : colorBad,
                  radius: chart_marker_radius
                }
              },
              ...trend_forecast_12m,
              {
                y: parseFloat(hmvi_data[twelveMonthForecastPointIndex]),
                dataLabels: {
                  enabled: true,
                  align: "center",
                  shape: null
                },
                marker: {
                  enabled: true,
                  symbol: "circle",
                  fillColor:
                    parseFloat(hmvi_data[twelveMonthForecastPointIndex]) >=
                      trend_value_good_cutoff
                      ? colorGood
                      : colorBad,
                  radius: chart_marker_radius
                }
              },
              false
            ],
            color: colorGrey,
            zoneAxis: "x",
            zones: [
              {
                value: currentPointIndex
              },
              {
                dashStyle: "shortdot"
              }
            ]
          },
          {
            name: "",
            yAxis: 1,
            data: [
              {
                y: parseFloat(hmvi_chg_data[0]),
                dataLabels: {
                  enabled: true,
                  align: "center",
                  shape: null
                },
                marker: {
                  enabled: true,
                  symbol: "circle",
                  fillColor:
                    parseFloat(hmvi_chg_data[0]) >=
                      trend_change_value_good_cutoff
                      ? colorGood
                      : colorBad,
                  radius: chart_marker_radius
                }
              },
              ...change_trend_actual,
              {
                y: parseFloat(hmvi_chg_data[currentPointIndex]),
                dataLabels: {
                  enabled: true,
                  align: "center",
                  shape: null
                },
                marker: {
                  enabled: true,
                  symbol: "circle",
                  fillColor:
                    parseFloat(hmvi_chg_data[currentPointIndex]) >=
                      trend_change_value_good_cutoff
                      ? colorGood
                      : colorBad,
                  radius: chart_marker_radius
                }
              },
              ...change_trend_forecast_3m,
              {
                y: parseFloat(hmvi_chg_data[threeMonthForecastPointIndex]),
                dataLabels: {
                  enabled: true,
                  align: "center",
                  shape: null
                },
                marker: {
                  enabled: true,
                  symbol: "circle",
                  fillColor:
                    parseFloat(hmvi_chg_data[threeMonthForecastPointIndex]) >=
                      trend_change_value_good_cutoff
                      ? colorGood
                      : colorBad,
                  radius: chart_marker_radius
                }
              },
              ...change_trend_forecast_12m,
              {
                y: parseFloat(hmvi_chg_data[twelveMonthForecastPointIndex]),
                dataLabels: {
                  enabled: true,
                  align: "center",
                  shape: null
                },
                marker: {
                  enabled: true,
                  symbol: "circle",
                  fillColor:
                    parseFloat(hmvi_chg_data[twelveMonthForecastPointIndex]) >=
                      trend_change_value_good_cutoff
                      ? colorGood
                      : colorBad,
                  radius: chart_marker_radius
                }
              },
              false
            ],
            color: colorGrey,
            zoneAxis: "x",
            zones: [
              {
                value: currentPointIndex
              },
              {
                dashStyle: "shortdot"
              }
            ]
          }
        ],
        exporting: {
          enabled: false
        },
        tooltip: {
          shared: true,
          followPointer: true,
          followTouchMove: true,
          formatter: function () {
            let use_change_chart = false;
            return ["<b>" + this.x + "</b><br/>"].concat(
              this.points
                ? this.points.map(function (point) {
                  let startTag,
                    endTag = "</span></b><br/>";
                  if (!use_change_chart) {
                    if (point.y >= trend_value_good_cutoff) {
                      startTag =
                        '<b><span style="color: ' + colorGood + ';">';
                    } else {
                      startTag = '<b><span style="color: ' + colorBad + ';">';
                    }
                    use_change_chart = true;
                    return "HMVI: " + startTag + point.y + endTag;
                  } else {
                    if (point.y >= trend_change_value_good_cutoff) {
                      startTag =
                        '<b><span style="color: ' + colorGood + ';">';
                    } else {
                      startTag = '<b><span style="color: ' + colorBad + ';">';
                    }
                    return "12-month change: " + startTag + point.y + endTag;
                  }
                })
                : []
            );
          },
          borderColor: "#ffffff"
        }
      },
      function (chart) {
        const series = chart.series;
        let use_change_chart = false;
        series.forEach((series) => {
          const x =
            series.points[0].plotX + chart.plotLeft + chart_marker_radius;
          const y = series.points[0].plotY + chart.plotTop + 20;
          if (!use_change_chart) renderLabel(chart, "Monthly level", x, y);
          if (use_change_chart) renderLabel(chart, "12-month change", x, y);
          use_change_chart = true;
        });
      }
    );
    function renderLabel(chart, name, x, y) {
      chart.renderer
        .text(name, x, y)
        .css({
          color: colorGrey,
          fontSize: chart_text_font_size
        })
        .add()
        .toFront();
    }

    // State summary Highmap
    Highcharts.mapChart("state_summary_map", {
      plotOptions: {
        map: {
          allAreas: false,
          mapData: Highcharts.maps["countries/us/us-all"]
        },
        series: {
          point: {
            events: {
              click: function (event) {
                report_url = state_report_prefix + event.point.place_id;
                window.open(report_url);
              }
            }
          }
        }
      },
      series: [
        {
          name: "background",
          allAreas: true, // show all areas for this series (as a "background")
          showInLegend: false,
          nullColor: '#FFFFFF',
        },
        {
          name: "top_states",
          data: top_states,
          joinBy: ["postal-code", "place_id"],
          color: colorGood,
          states: {
            hover: {
              enabled: true
            }
          }
        },
        {
          name: "bottom_states",
          data: bottom_states,
          joinBy: ["postal-code", "place_id"],
          color: colorBad,
          states: {
            hover: {
              enabled: true
            }
          }
        }
      ],
      tooltip: {
        formatter: function () {
          return (
            "<b>" +
            this.point.place_id +
            "</b><br>Forecasted appreciation: " +
            this.point.forecasted_appreciation +
            "%"
          );
        }
      },
      title: {
        text: ""
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

    createUSExplorer("us_chart",
      hmvi_time,
      hmvi_us, hmvi_us_chg,
      hmvi_num_states_trend_up, hmvi_num_states_outperforming,
      hmvi_pct_metro_trend_up, hmvi_pct_metro_outperforming);

    const metroChart = new MetroChartView('#metro_map', map_data_metro);
    metroChart.init({
      actionsContainerId: '#metro_map_actions',
    });

    $('#btn_reset').click(function () {
      metroChart.reset();
    });

    const stateChart = new StateChartView('#state_map', map_data_state);
    stateChart.init();
  });
});
