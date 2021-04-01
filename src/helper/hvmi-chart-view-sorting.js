(function ($) {
  function changeCheckBoxColorBasedOnItsState(checked, element) {
    if (checked) {
      $(element).parent().removeClass('btn-default');
      $(element).parent().addClass('btn-info');
    } else {
      $(element).parent().removeClass('btn-info');
      $(element).parent().addClass('btn-default');
    }
  }

  window.ChartSortingView = function (chartViewModel) {
    // const dataExtremes = chartViewModel.getExtremes();
    // const theExtremes = {
    //   from: dataExtremes.from,
    //   to: dataExtremes.to,
    // };

    function init() {
      $('.sortby-radio').change(function () {
        chartViewModel.setDataPerspectiveField(this.value);
        chartViewModel.filterData({
          sort: {
            field: chartViewModel.getDataPerspectiveField(),
            order: 'desc'
          }
        });

        // const hasSelectedItems = $('#hmvi_explorer_selected_metros').children().length > 0;

        // let index = -1;
        // chartViewModel.getData().filter(function (item, i) {
        //   const selected = item.place_name === chartViewModel.getLastSelectedItemName();

        //   if (selected) {
        //     index = i;
        //   }

        //   return selected;
        // });

        // if (index >= 0 && hasSelectedItems) {
        //   const total = chartViewModel.getData().length;
        //   const current = index;
        //   let from = current - 10;
        //   let to = current + 10;

        //   if (from < 0) {
        //     from = 0;
        //     to = 20;
        //   }

        //   if (to > total) {
        //     from = total - 20;
        //     to = total;
        //   }

        //   theExtremes.from = from;
        //   theExtremes.to = to;
        //   chartViewModel.setExtremes(0, theExtremes.from, theExtremes.to);
        // } else {
        //   theExtremes.from = 0;
        //   theExtremes.to = 20;
        //   chartViewModel.setExtremes(0, theExtremes.from, theExtremes.to);
        // }

        const clickedElement = this;
        $('.sortby-radio').each(function () {
          const isChecked = this == clickedElement;
          changeCheckBoxColorBasedOnItsState(isChecked, this);
        });
      });

      $('#myTab li:first-child a').tab('show');
    }

    function reset() {
      chartViewModel.setDataPerspectiveField('score_pctl');
      chartViewModel.filterData({
        sort: {
          field: chartViewModel.getDataPerspectiveField(),
          order: 'desc'
        }
      });

      $('.sortby-radio').each(function () {
        $(this).prop('checked', false);
        changeCheckBoxColorBasedOnItsState(false, this);
      });

      $('#sort_core_pctl').prop('checked', true);
      changeCheckBoxColorBasedOnItsState(true, '#sort_core_pctl');
    }

    return {
      init,
      reset,
    };
  }
}(jQuery));