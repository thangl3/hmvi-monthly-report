(function ($) {
  'use strict';

  const COLOR_POINT_GOOD = '#7cc576';
  const COLOR_POINT_BAD = '#f26c4f';
  const COLOR_POINT_NEUTRAL = '#6dcff6';

  function clickOnDataItem(event) {
    if (event && event.point && event.point.place_id) {
      const metro_report_prefix = 'https://housingiq.wainstreet.com/state-reports/';
      report_url = metro_report_prefix + event.point.place_id;

      window.open(report_url, '_blank');
    }
  }

  function buildTooltipFormatter(dataItem) {
    return (
      '<b>' +
      dataItem.place_name +
      '</b><br>' +
      '<br>Market Performance Rank: <b>' +
      dataItem.market_performance_rank +
      '</b> (' +
      dataItem.market_performance_pctl +
      'pctl)' +
      '<br>Situation: <b>' +
      dataItem.situation +
      '</b> (' +
      dataItem.situation_pctl +
      'pctl)' +
      '<br>Outlook: <b>' +
      dataItem.outlook +
      ' </b>(' +
      dataItem.outlook_pctl +
      'pctl)' +
      '<br>Forecasted appreciation: <b>' +
      dataItem.forecasted_appreciation +
      '% </b>'
    );
  }


  window.StateChartView = function (containerElmId, data) {
    const highChartsIdFormat = containerElmId.replace(/[\#\.]/g, '');
    const chartViewModel = new ChartViewModel(data);

    const chartOptions = {
      chart: {
        marginTop: 0,
        margin: [0, 0, 0, 0],
        spacing: [0, 0, 0, 0],
        animation: false,
        map: 'countries/us/us-all',
        height: '60%',
      },
      series: [
        {
          name: 'market_performance',
          data: data,
          joinBy: ['postal-code', 'place_id'],
          colorKey: 'market_performance_pctl',
          dataLabels: {
            enabled: true,
            color: '#FFFFFF',
            format: '{point.place_id}'
          },
          states: {
            hover: {
              enabled: true
            }
          },
          animation: false,
          events: {
            click: function (event) {
              clickOnDataItem(event);
            }
          },
        },
      ],
      colorAxis: {
        min: 0,
        max: 100,
        type: 'linear',
        minColor: COLOR_POINT_BAD,
        maxColor: COLOR_POINT_GOOD,
        stops: [
          [0, COLOR_POINT_BAD],
          [0.5, COLOR_POINT_NEUTRAL],
          [1, COLOR_POINT_GOOD]
        ],
        labels: {
          enabled: false
        }
      },
      tooltip: {
        formatter: function () {
          return buildTooltipFormatter(this.point);
        },
        backgroundColor: '#ffffff',
        borderColor: '#3c3c3c',
        shared: false,
        useHTML: true,
        followPointer: false,
        followTouchMove: false,
        outside: true,
      },
      title: {
        text: '',
        floating: true
      },
      legend: {
        title: {
          text: 'State Rank',
          style: ''
        },
        align: 'right',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        padding: 5,
        margin: 0,
        floating: true,
        x: -20,
        y: -10
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
    };

    function init() {
      Highcharts.mapChart(highChartsIdFormat, chartOptions);
    }

    return {
      init,
    };
  };
}(jQuery));