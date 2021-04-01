(function ($) {
  'use strict';

  function autocomplete({ element, initEvents, dataGetter, fieldName, selectedCallback, onSelectItem, onChange }) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    let currentFocus;

    function showAutocomplete(e) {
      let val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();

      if (!val) {
        return false;
      }

      currentFocus = -1;

      const containElm = document.createElement('div');
      containElm.setAttribute('id', this.id + 'autocomplete-list');
      containElm.setAttribute('class', 'hmvi_explorer_autocomplete-items');

      this.parentNode.parentNode.appendChild(containElm);

      dataGetter().forEach(function (item, index) {
        const fieldValue = item[fieldName];

        if (typeof fieldValue !== 'string' && fieldValue === '') {
          return undefined;
        }

        const isThisSelected = selectedCallback(item, fieldName);

        const indexMaped = fieldValue.toLowerCase().indexOf(val.toLowerCase());
        /*check if the item starts with the same letters as the text field value:*/
        if (indexMaped >= 0) {
          /*create a DIV element for each matching element:*/
          const itemElm = document.createElement('div');
          if (isThisSelected) {
            setActiveSelected(itemElm);
          }

          const first = fieldValue.substring(0, indexMaped);
          const matched = fieldValue.substring(indexMaped, indexMaped + val.length);
          const rest = fieldValue.slice(indexMaped + val.length);

          /*make the matching letters bold:*/
          itemElm.innerHTML = first;
          itemElm.innerHTML += '<strong>' + matched + '</strong>';
          itemElm.innerHTML += rest;
          /*insert a input field that will hold the current array item's value:*/
          itemElm.innerHTML += '<input type="hidden" value="' + fieldValue + '">';
          /*execute a function when someone clicks on the item value (DIV element):*/
          itemElm.addEventListener('click', function (e) {
            element.value = item[fieldName];

            if (typeof onSelectItem === 'function') {
              onSelectItem(item, index);
            }

            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
          });
          containElm.appendChild(itemElm);
        }
      });

      if (typeof onChange === 'function') {
        onChange(val);
      }
    }

    initEvents.forEach(function (eventName) {
      element.removeEventListener(eventName, showAutocomplete);
      element.addEventListener(eventName, showAutocomplete);
    });

    function setActiveSelected(element) {
      if (!element) return false;
      element.classList.add('hmvi_explorer_autocomplete-active');
    }

    function closeAllLists(elmnt) {
      $('.hmvi_explorer_autocomplete-items').remove();
    }
  }

  window.ChartSearchView = function (chartViewModel) {
    function registerEventListener() {
      $('#input_refresh_addon').off('click').click(function () {
        reset();
      });
    }

    function reset() {
      chartViewModel.resetSelectedItems();
      $('#hmvi_explorer_selected_metros').empty();
      $('#hmvi_explorer_metro_names_input_text').val('');
      $('.hmvi_explorer_autocomplete-items').remove();
      chartViewModel.filterData({
        filter: function (data) {
          return true;
        }
      });
      tryToFitIntoBarChart();
    }

    function tryToFitIntoBarChart() {
      const hasSelectedItems = $('#hmvi_explorer_selected_metros').children().length > 0;
      const theExtremes = {
        from: 0, to: 20
      };
      let index = -1;
      chartViewModel.getData().filter(function (item, i) {
        const selected = item.place_name === chartViewModel.getLastSelectedItemName();

        if (selected) {
          index = i;
        }

        return selected;
      });

      if (index >= 0 && hasSelectedItems) {
        const total = chartViewModel.getData().length;
        const current = index;
        let from = current - 10;
        let to = current + 10;

        if (from < 0) {
          from = 0;
          to = 20;
        }

        if (to > total) {
          from = total - 20;
          to = total;
        }

        theExtremes.from = from;
        theExtremes.to = to - (chartViewModel.getData().length === to ? 1 : 0);
        chartViewModel.setExtremes(0, theExtremes.from, theExtremes.to);
      } else {
        theExtremes.from = 0;
        theExtremes.to = 20;
        chartViewModel.setExtremes(0, theExtremes.from, theExtremes.to);
      }
    }

    function init() {
      autocomplete({
        element: document.getElementById('hmvi_explorer_metro_names_input_text'),
        initEvents: ['input', 'click'],
        dataGetter: chartViewModel.getData,
        fieldName: 'place_name',
        selectedCallback: function (item, fieldName) {
          return chartViewModel.isSelectedPlace(item[fieldName]);
        },
        onSelectItem: function (item, index) {
          chartViewModel.toggleItem(item);
          const total = chartViewModel.getData().length;
          const current = index;
          let from = current - 10;
          let to = current + 10;

          if (from < 0) {
            from = 0;
            to = 20;
          }

          if (to > total) {
            from = total - 20;
            to = total;
          }

          chartViewModel.setExtremes(0, from, to);

          chartViewModel.filterData({
            filter: function (data) {
              return item.place_name.toLowerCase() === data.place_name.toLowerCase();
            }
          });
        },
        onChange: function (val) {
          chartViewModel.filterData({
            filter: function (item) {
              if (typeof item.place_name !== 'string') {
                return false;
              }

              if (typeof val === 'string' && val !== '') {
                return item.place_name.toLowerCase().includes(val.toLowerCase());
              }

              return true;
            }
          });
        },
      });

      registerEventListener();
    }

    return {
      init,
      reset,
    };
  };
}(jQuery));