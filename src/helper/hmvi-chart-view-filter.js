(function ($) {
  function tryIncludeOrExcludeValueFromArray(shouldInclude, value, array) {
    if (shouldInclude) {
      if (!array.includes(value)) {
        array.push(value);
      }
    } else {
      if (array.includes(value)) {
        const index = array.indexOf(value);
        array.splice(index, 1);
      }
    }
  }

  window.ChartFilterView = function (chartViewModel) {
    const dataPerspectiveRangeFilterTitle = {
      'score_pctl': 'Market Rank',
      'situation_pctl': 'Situation',
      'outlook_pctl': 'Outlook'
    };
    const sliderPercentil = chartViewModel.getFromToDataRangePercentil();
    let dataRangeSliderPercentil = [sliderPercentil.from, sliderPercentil.to];
    const percentilSlider = $("#hmvi_explorer_percentil_slider_id").slider({
      min: sliderPercentil.from,
      max: sliderPercentil.to,
      step: 1,
      value: dataRangeSliderPercentil,
    });

    let situations = ['Outperforming', 'Tracking', 'Underperforming'];
    let outlooks = ['Outperform', 'Track', 'Underperform'];
    let lastDataField = chartViewModel.getDataPerspectiveField();

    const resetValuesFunctions = {
      resetSituation: function () {
        situations = ["Outperforming", "Tracking", "Underperforming"];
        $('.situation-outperforming input[type=checkbox], .situation-tracking input[type=checkbox], .situation-unperforming input[type=checkbox]').each(function (index) {
          $(this).prop('checked', true);
        });
      },
      resetOutlook: function () {
        outlooks = ["Outperform", "Track", "Underperform"];
        $('.outlook-positive input[type=checkbox], .outlook-neutral input[type=checkbox], .outlook-negative input[type=checkbox]').each(function (index) {
          $(this).prop('checked', true);
        });
      },
      resetDataSliderPercentil: function () {
        dataRangeSliderPercentil = [0, 100];
        percentilSlider.slider('refresh');
        $('.hmvi_explorer_pctl_value.hmvi_explorer_pctl_left').text(dataRangeSliderPercentil[0]);
        $('.hmvi_explorer_pctl_value.hmvi_explorer_pctl_right').text(dataRangeSliderPercentil[1]);
      }
    };

    function setFilterInfo() {
      const dataPerspectiveViewFieldName = chartViewModel.getDataPerspectiveField();

      chartViewModel.setFromToDataRangePercentil(dataRangeSliderPercentil[0], dataRangeSliderPercentil[1]);
      chartViewModel.filterData({
        sort: {
          field: dataPerspectiveViewFieldName,
          order: 'desc'
        },
        filter: function (item) {
          const situationsOrOutlooksFilter = situations.includes(item.situation) && outlooks.includes(item.outlook);
          const currentRange = Number(item.market_performance_pctl);
          const itemIsInRange = dataRangeSliderPercentil[0] <= currentRange && currentRange <= dataRangeSliderPercentil[1];

          return situationsOrOutlooksFilter && itemIsInRange;
        }
      });
    }

    function registerEventListener() {
      percentilSlider.on('change', function (e) {
        const currentValues = percentilSlider.slider('getValue');

        if (currentValues.length === 2 && !isNaN(currentValues[0]) && !isNaN(currentValues[1])) {
          dataRangeSliderPercentil = currentValues;

          $('.hmvi_explorer_pctl_value.hmvi_explorer_pctl_left').text(dataRangeSliderPercentil[0]);
          $('.hmvi_explorer_pctl_value.hmvi_explorer_pctl_right').text(dataRangeSliderPercentil[1]);

          setFilterInfo();
        }
      });

      $('.situation-outperforming input[type=checkbox], .situation-tracking input[type=checkbox], .situation-unperforming input[type=checkbox]').change(function () {
        tryIncludeOrExcludeValueFromArray(this.checked, this.value, situations);
        setFilterInfo();
      });

      $('.outlook-positive input[type=checkbox], .outlook-neutral input[type=checkbox], .outlook-negative input[type=checkbox]').change(function () {
        tryIncludeOrExcludeValueFromArray(this.checked, this.value, outlooks);
        setFilterInfo();
      });
    }

    function init() {
      registerEventListener();
    }

    function reset() {
      Object.keys(resetValuesFunctions).forEach(function (k) {
        resetValuesFunctions[k]();
      });
      setFilterInfo();
    }

    return {
      init,
      reset,
    };
  };
}(jQuery));