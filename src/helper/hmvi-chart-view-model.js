(function () {
  'use strict';

  window.ChartViewModel = function (chartData) {
    const localData = chartData.slice(0);
    const allowedDataFieldsPerspective = ['score_pctl', 'situation_pctl', 'outlook_pctl'];

    let filteredData = chartData.slice(0);
    let localOnChangeFunction = null;
    let localHasFilteredApplied = false;
    let dataRangePercentil = {
      from: 0,
      to: 100
    };
    let selectedMetro = {};
    let extremes = {
      from: 0,
      to: 20
    };
    let lastSelectedItem = '';
    let dataPerspectiveField = 'score_pctl';
    let sortByField = 'score_pctl';
    let lastFilter = {};

    function getSortFunction(order, field) {

      const sortFunctions = {
        asc: function (a, b) {
          return a[field] - b[field];
        },
        desc: function (a, b) {
          return b[field] - a[field];
        }
      };

      return sortFunctions[order];
    }

    function tryInvokeOnChangeListener() {
      if (typeof localOnChangeFunction === 'function') {
        localOnChangeFunction();
      }
    }

    const minValueFromOriginalDataSetCache = {};
    const maxValueFromOriginalDataSetCache = {};

    function getMinValueFromFieldOfOriginalSet(field) {
      if (!(field in minValueFromOriginalDataSetCache)) {

        minValueFromOriginalDataSetCache[field] = localData.reduce(function (minimumValue, currentHmvi) {
          return minimumValue < currentHmvi[field] ? minimumValue : currentHmvi[field];
        }, Number.MAX_SAFE_INTEGER);
      }

      return minValueFromOriginalDataSetCache[field];
    }

    function getMaxValueFromFieldOfOriginalSet(field) {
      if (!(field in maxValueFromOriginalDataSetCache)) {
        return maxValueFromOriginalDataSetCache[field] = localData.reduce(function (maximumValue, currentHmvi) {
          return maximumValue > currentHmvi[field] ? maximumValue : currentHmvi[field];
        }, Number.MIN_SAFE_INTEGER);
      }

      return maxValueFromOriginalDataSetCache[field];
    }

    return {
      fullDataLength: function () {
        return localData.length;
      },
      getData: function () {
        return filteredData;
      },
      hasFilterApplied: function () {
        return filteredData.length !== localData.length || localHasFilteredApplied;
      },
      getMinValueFromFieldOfOriginalSet: function (fieldName) {
        return getMinValueFromFieldOfOriginalSet(fieldName);
      },
      getMaxValueFromFieldOfOriginalSet: function (fieldName) {
        return getMaxValueFromFieldOfOriginalSet(fieldName);
      },
      filterData: function (filter) {
        if (filter) {
          let filtered = localData.slice(0);

          if ('filter' in filter) {
            filtered = filtered.filter(filter.filter);
          }

          if ('sort' in filter) {
            const order = filter.sort.order || 'asc'
            const field = filter.sort.field; // SORT BY THE LASTFIELD TO SORT
            filtered = filtered.sort(getSortFunction(order, field));
          }

          lastFilter = filter;

          // set filtered data
          localHasFilteredApplied = true;
          filteredData = filtered;

          tryInvokeOnChangeListener();
        } else {
          localHasFilteredApplied = false;
          filteredData = localData.slice(0);
          tryInvokeOnChangeListener();
        }

        return this;
      },
      setFromToDataRangePercentil(from, to) {
        dataRangePercentil = {
          from: from,
          to: to
        };
      },
      getFromToDataRangePercentil() {
        return dataRangePercentil;
      },
      setExtremes: function (xAxisIndex, from, to) {
        extremes = {
          from: from,
          to: to
        };

        tryInvokeOnChangeListener();
      },
      getExtremes: function () {
        return extremes;
      },
      toggleItem: function (item) {
        selectedMetro[item.place_name] = !selectedMetro[item.place_name];
        if (selectedMetro[item.place_name]) {
          lastSelectedItem = item.place_name;
        }
        tryInvokeOnChangeListener();
      },
      toggleItemByName: function (place_name) {
        selectedMetro[place_name] = !selectedMetro[place_name];
        if (selectedMetro[place_name]) {
          lastSelectedItem = place_name;
        }
        tryInvokeOnChangeListener();
      },
      getSelectedItems: function () {
        const selectedItems = [];

        for (const key in selectedMetro) {
          if (selectedMetro[key]) {
            selectedItems.push(key);
          }
        }

        return selectedItems;
      },
      getLastSelectedItemName: function () {
        return lastSelectedItem;
      },
      resetSelectedItems: function () {
        selectedMetro = {};
        tryInvokeOnChangeListener();
      },
      isSelectedPlace: function (place_name) {
        const isSelected = place_name in selectedMetro ? selectedMetro[place_name] : false;
        return isSelected;
      },
      setDataPerspectiveField: function (fieldName) {
        if (fieldName && allowedDataFieldsPerspective.includes(fieldName) && dataPerspectiveField !== fieldName) {
          dataPerspectiveField = fieldName;
          sortByField = fieldName;
          tryInvokeOnChangeListener();
        }
      },
      getDataPerspectiveField: function () {
        return dataPerspectiveField;
      },
      onChangeListener: function (onChangeFunction) {
        localOnChangeFunction = onChangeFunction;
      }
    };
  };
}());
