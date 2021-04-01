(function () {
  'use strict';

  const COLOR_GRADIENT = [
    '#f26c4f', '#f16e52', '#f07155', '#ef7359', '#ee765c', '#ed785f', '#eb7a62', '#ea7c65', '#e97f69', '#e8816c',
    '#e6836f', '#e58572', '#e48775', '#e28979', '#e18b7c', '#df8d7f', '#de8f82', '#dc9186', '#da9389', '#d9958c',
    '#d7978f', '#d59993', '#d39b96', '#d19d99', '#cf9f9c', '#cda1a0', '#cba3a3', '#c9a5a6', '#c7a7aa', '#c4a9ad',
    '#c2aab0', '#bfacb4', '#bdaeb7', '#bab0ba', '#b7b2be', '#b4b4c1', '#b1b5c4', '#aeb7c8', '#aab9cb', '#a7bbce',
    '#a3bdd2', '#9fbed5', '#9bc0d9', '#97c2dc', '#93c4e0', '#8ec5e3', '#89c7e6', '#83c9ea', '#7ecbed', '#77ccf1',
    '#71cef4', '#6ecff5', '#6fcff2', '#70cef0', '#71ceed', '#72ceeb', '#72cee8', '#73cee5', '#74cde3', '#75cde0',
    '#76cdde', '#76cddb', '#77cdd9', '#78ccd6', '#78ccd4', '#79ccd1', '#79cccf', '#7acccc', '#7acbca', '#7bcbc7',
    '#7bcbc5', '#7ccbc2', '#7ccbc0', '#7ccabd', '#7dcabb', '#7dcab8', '#7dcab6', '#7dcab3', '#7dc9b0', '#7ec9ae',
    '#7ec9ab', '#7ec9a9', '#7ec9a6', '#7ec8a4', '#7ec8a1', '#7ec89f', '#7ec89c', '#7ec89a', '#7ec797', '#7ec795',
    '#7ec792', '#7ec790', '#7ec78d', '#7ec68b', '#7ec688', '#7dc685', '#7dc683', '#7dc680', '#7dc67e', '#7dc57b',
    '#7cc579', '#7cc576'
  ];
  const COLOR_POINT_GOOD = "#7cc576";
  const COLOR_POINT_BAD = "#f26c4f";
  const COLOR_POINT_NEUTRAL = "#6dcff6";

  function clickOnDataItem(event) {
    if (event && event.point && event.point.place_id) {
      const metro_report_prefix = 'https://housingiq.wainstreet.com/market-reports/place_id-';
      report_url = metro_report_prefix + event.point.place_id;

      window.open(report_url, "_blank");
    }
  }

  function buildTooltipFormatter(dataItem) {
    return (
      "<b>" +
      dataItem.place_name +
      "</b><br>" +
      "<br>Market Performance Rank: <b>" +
      dataItem.market_performance_rank +
      "</b> (" +
      dataItem.market_performance_pctl +
      "pctl)" +
      "<br>Situation: <b>" +
      dataItem.situation +
      "</b> (" +
      dataItem.situation_pctl +
      "pctl)" +
      "<br>Outlook: <b>" +
      dataItem.outlook +
      " </b>(" +
      dataItem.outlook_pctl +
      "pctl)" +
      "<br>Forecasted appreciation: <b>" +
      dataItem.forecasted_appreciation +
      "% </b>"
    );
  }

  function determineColor(value) {
    let perc = value * 100;
    perc = perc.toFixed(0);

    return (COLOR_GRADIENT[perc]);
  }

  function transformDataForMap(chartViewModel) {
    const dataPerspectiveViewFieldName = chartViewModel.getDataPerspectiveField();

    const chartData = chartViewModel.getData().map(function (item) {
      const isSelected = chartViewModel.isSelectedPlace(item.place_name);
      const data_pctl = item[dataPerspectiveViewFieldName];
      const finalColor = determineColor(data_pctl);

      const pointData = {
        ...item,
        item_data: item,
        lat: item.latitude,
        lon: item.longitude,
        marker: {
          fillColor: finalColor,
          lineColor: isSelected ? '#ffff00' : finalColor,
          lineWidth: isSelected ? 3 : 1,
          radius: determiniSize(item)
        }
      };

      return pointData;
    });

    return chartData;
  }

  function formatMapLegend(chartViewModel) {
    const dataPerspectiveRangeFilterTitle = {
      'score_pctl': 'Market Rank',
      'situation_pctl': 'Situation',
      'outlook_pctl': 'Outlook'
    };
    const dataPerspectiveViewFieldName = chartViewModel.getDataPerspectiveField();
    const legendPercentilTextUsage = dataPerspectiveRangeFilterTitle[dataPerspectiveViewFieldName];

    let finalText = '';
    finalText += '<span class="hmvi_explorer_legend_text">Size shows relative population <br></span>'
    finalText += '<span class="hmvi_explorer_legend_text">' + legendPercentilTextUsage + ' (percentile score)</span></br>';

    return finalText;
  }

  function determiniSize(entry) {
    const multiplier = 10;
    const finalSize = Math.max(0.01, entry.pct_population * multiplier);
    const sizeInPopulation = Math.sqrt(finalSize * window.innerWidth);
    const MAX_LIMIT = 10;
    const MIN_LIMIT = 1;

    return Math.min(Math.max(sizeInPopulation, MIN_LIMIT), MAX_LIMIT);
  }

  window.MetroChartView = function (containerElmId, data) {
    const highChartsIdFormat = containerElmId.replace(/[\#\.]/g, '');
    const chartViewModel = new ChartViewModel(data);

    const H = Highcharts;
    const map = Highcharts.maps['countries/us/us-all'];

    const chartOptions = {
      chart: {
        marginTop: 0,
        margin: [0, 0, 0, 0],
        spacing: [0, 0, 0, 0],
        animation: false,
        map: 'countries/us/us-all',
        height: '60%',
      },
      exporting: { enabled: false },
      title: {
        text: '',
        floating: true,
      },
      tooltip: {
        formatter: function () {
          return buildTooltipFormatter(this.point);
        },
        backgroundColor: '#ffffff',
        borderColor: '#3c3c3c',
        shared: false,
        useHTML: false,
        followPointer: false,
        followTouchMove: false,
        outside: true,
        style: {
          whiteSpace: 'nowrap'
        }
      },
      colorAxis: {
        min: 0,
        max: 100,
        type: 'linear',
        minColor: COLOR_POINT_BAD,
        maxColor: COLOR_POINT_GOOD,
        labels: {
          marker: null,
          overflow: '',
          enabled: true
        },
        stops: [
          [0, COLOR_POINT_BAD],
          [0.5, COLOR_POINT_NEUTRAL],
          [1, COLOR_POINT_GOOD]
        ]
      },
      plotOptions: {
        map: {
          animation: false,
          colorByPoint: true
        },
        bubble: {
          animation: false,
          minSize: '10%',
          maxSize: '75%'
        },
        series: {
          animation: false,
          cursor: 'pointer',
          stickyTracking: false,
          events: {
            click: function (event) {
              clickOnDataItem(event);
            }
          }
        }
      },
      legend: {
        title: {
          text: formatMapLegend(chartViewModel),
          style: ''
        },
        align: 'right',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        padding: 5,
        margin: 0,
        floating: true,
        x: -20,
        y: 0
      },
      credits: { enabled: false },
      mapNavigation: {
        enabled: false
      },
      series: [
        {
          name: 'basemap',
          mapData: map,
          borderColor: '#AAAAAA',
          borderWidth: 0.5,
          nullColor: 'rgba(200, 200, 200, 0.2)',
          showInLegend: false
        },
        {
          name: 'separators',
          type: 'mapline',
          data: H.geojson(map, 'mapline'),
          color: '#ffffff',
          enableMouseTracking: true,
          showInLegend: false
        },
        {
          name: "market_performance",
          type: "mappoint",
          colorKey: "market_performance_pctl",
          data: transformDataForMap(chartViewModel),
          marker: {
            enabled: true
          }
        },
      ],
    };

    let chart;
    let sortingView;
    let filteringView;
    let searchView;

    function registerChartChangedEventListener() {
      chartViewModel.onChangeListener(function () {
        const mapData = transformDataForMap(chartViewModel);

        chart.update({
          legend: {
            title: {
              text: formatMapLegend(chartViewModel)
            }
          }
        });

        if (chart.series && chart.series.length >= 3) {
          chart.series[2].update({ data: mapData });
        }
      });
    }

    function init(options) {
      chart = Highcharts.mapChart(highChartsIdFormat, chartOptions);
      const defaultOptions = {
        actionsContainerId: null,
      };
      Object.assign(defaultOptions, options);

      if (defaultOptions.actionsContainerId && typeof defaultOptions.actionsContainerId === 'string') {
        registerChartChangedEventListener();

        sortingView = new ChartSortingView(chartViewModel);
        filteringView = new ChartFilterView(chartViewModel);
        searchView = new ChartSearchView(chartViewModel);

        sortingView.init();
        filteringView.init();
        searchView.init();

        $(defaultOptions.actionsContainerId).show();
      }
    }

    function reset() {
      if (sortingView) {
        sortingView.reset();
      }
      if (filteringView) {
        filteringView.reset();
      }
      if (searchView) {
        searchView.reset();
      }
    }

    return {
      init,
      reset,
    };
  };
}());
