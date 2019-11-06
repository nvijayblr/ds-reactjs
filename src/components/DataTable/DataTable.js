/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import classNames from 'classnames';

import { Consumer } from '../../context';
import CellRenderer from './CellRenderer';
import CmaItemCellRenderer from './CmaItemCellRenderer';
import ReportsCellRenderer from './ReportsCellRenderer';
import SelectFloatingFilter from './SelectFloatingFilter';
import { COLUMN_WIDTH } from '../../constants';

import './DataTable.scss';

class DataTable extends Component {
  state = {
    gridApi: null,
    gridParams: null,
    dataTableComponent: this
  };

  gridWrapperRef = React.createRef();

  overlayLoadingTemplate = `<div class="spin-wrapper">
    <div class="ant-spin ant-spin-lg ant-spin-spinning">
    <span class="ant-spin-dot ant-spin-dot-spin"><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i></span>
    </div>
    </div>`;

  overlayNoRowsTemplate = `<div class="no-results-wrapper">
    <div class="message">
    <i class="anticon anticon-exclamation-circle">
    <svg viewBox="64 64 896 896" class="" data-icon="exclamation-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M464 688a48 48 0 1 0 96 0 48 48 0 1 0-96 0zM488 576h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z"></path></svg>
    </i> 
    <span>No rows to show</span>
    </div>
    </div>`;

  componentDidUpdate(prevProps) {
    const { filterData, tableResultsAreLoading } = this.props;

    if (prevProps.tableResultsAreLoading && !tableResultsAreLoading) {
      this.resetCustomFilters();
    }

    if (filterData && filterData.fieldName && filterData.applyFilter) {
      this.applyFilter(filterData);
    }
  }

  componentWillUnmount() {
    const { gridApi } = this.state;

    if (gridApi && gridApi.destroy) {
      gridApi.destroy();
    }
  }

  onGridReady = params => {
    const { autoHeight, filterData } = this.props;

    this.setState(
      {
        gridApi: params.api,
        gridParams: params,
        gridColumnApi: params.columnApi
      },
      () => {
        this.applyFilter(filterData);
      }
    );

    if (autoHeight) {
      params.api.resetRowHeights();
    }
  };

  applyFilter = filterData => {
    const { gridParams } = this.state;

    if (gridParams && gridParams.api && filterData && filterData.fieldName) {
      const filterColumn = gridParams.api.getFilterInstance(filterData.fieldName);
      if (filterColumn) {
        filterColumn.setModel({
          type: 'contains',
          filter: filterData.value
        });
        gridParams.api.onFilterChanged();
        const column = gridParams.columnApi
          .getAllDisplayedColumns()
          .find(col => col.colId === filterData.fieldName);
        gridParams.api.ensureColumnVisible(column);
      }
    }
  };

  downloadCsv = params => {
    const { gridApi } = this.state;

    gridApi.exportDataAsCsv(params);
  };

  showRequiredOverlay = tableResultsAreLoading => {
    const { gridApi } = this.state;
    const { rowData } = this.props;

    if (!gridApi) {
      return;
    }

    if (tableResultsAreLoading) {
      gridApi.showLoadingOverlay();
      return;
    }

    if (!tableResultsAreLoading && !rowData.length) {
      gridApi.showNoRowsOverlay();
      return;
    }

    gridApi.hideOverlay();
  };

  createColumnDefsWithOptions = () => {
    const { columnDefs, rowData, isCmaTable, isReportsCmaTable, hiddenColumns } = this.props;

    if (!rowData.length) return [];

    return columnDefs.map(columnDef => {
      const columnDefObj = columnDef;
      const columnValues = [];

      columnDefObj.cellRenderer = isCmaTable ? 'cmaItemCellRenderer' : 'cellRenderer';
      columnDefObj.cellRenderer = isReportsCmaTable
        ? 'reportsCellRenderer'
        : columnDefObj.cellRenderer;

      rowData.forEach(rowDataItem => {
        if (rowDataItem[columnDefObj.field]) {
          columnValues.push(rowDataItem[columnDefObj.field]);
        }
      });

      if (
        (!columnValues.length || hiddenColumns.indexOf(columnDefObj.field) !== -1) &&
        !columnDefObj.isEmptyShow
      ) {
        columnDefObj.hide = true;
      } else {
        columnDefObj.hide = false;
      }

      return columnDefObj;
    });
  };

  formatArray = arr => {
    let formattedArrayValue = '';

    arr.forEach((item, index) => {
      if (typeof item === 'object') {
        if (!item) {
          formattedArrayValue += '';
          return;
        }
        if (Array.isArray(item)) {
          formattedArrayValue += this.formatArray(item);
        } else {
          formattedArrayValue += this.formatObject(item);
        }
      } else {
        formattedArrayValue += item;
      }

      if (index < arr.length - 1) {
        formattedArrayValue += `, `;
      }
    });

    return formattedArrayValue;
  };

  formatObject = obj => {
    let formattedObjValue = '';

    Object.keys(obj).forEach(key => {
      if (Array.isArray(obj[key])) {
        formattedObjValue += this.formatArray(obj[key]);
      }
      formattedObjValue += `${obj[key]} `;
    });

    return formattedObjValue;
  };

  customFormatObject = (obj, keys) => {
    const formattedObjValue = [];
    Object.keys(obj).forEach(key => {
      if (keys.indexOf(key) >= 0) {
        formattedObjValue.push(obj[key]);
      }
    });
    return formattedObjValue.join(', ');
  };

  customFilterUniqueData = devices => {
    const { columnDefs } = this.props;

    columnDefs.forEach(cols => {
      if (cols.floatingFilterComponent) {
        const unique = [...new Set(devices.map(device => device[cols.field]))];
        unique.unshift('All');
        cols.floatingFilterComponentParams.options = unique;
      }
    });
  };

  resetCustomFilters = () => {
    const { gridApi, gridColumnApi } = this.state;

    if (gridApi) {
      gridColumnApi.resetColumnState();
      gridApi.setFilterModel(null);
      gridApi.onFilterChanged();
    }
  };

  render() {
    const { gridApi, dataTableComponent } = this.state;

    return (
      <Consumer>
        {value => {
          const { tableResultsAreLoading } = value;
          const {
            tableHeight,
            enableColResize,
            rowData,
            enableSorting,
            enableFilter,
            floatingFilter,
            suppressMenu,
            headerHeight,
            floatingFiltersHeight,
            rowHeight,
            pagination,
            context,
            autoHeight
          } = this.props;

          this.showRequiredOverlay(tableResultsAreLoading);

          this.customFilterUniqueData(rowData);

          const columnDefsWithOptions = this.createColumnDefsWithOptions();
          const wrapperClasses = classNames('ag-theme-balham', {
            'auto-height': autoHeight
          });

          // If there are too few columns to fill the table horizontally,
          // use `.sizeColumnsToFit()` to fill the table
          if (this.gridWrapperRef.current && gridApi) {
            const gridWidth = this.gridWrapperRef.current.clientWidth;
            const columnCount = columnDefsWithOptions.length;

            if (columnCount * COLUMN_WIDTH <= gridWidth) {
              gridApi.sizeColumnsToFit();
            }
          }

          return (
            <div
              ref={this.gridWrapperRef}
              className={wrapperClasses}
              style={{
                height: `${tableHeight}px`,
                visibility: gridApi ? 'visible' : 'hidden'
              }}
            >
              <AgGridReact
                enableColResize={enableColResize}
                columnDefs={columnDefsWithOptions}
                rowData={rowData}
                enableSorting={enableSorting}
                enableFilter={enableFilter}
                floatingFilter={floatingFilter}
                suppressMenu={suppressMenu}
                headerHeight={headerHeight}
                floatingFiltersHeight={floatingFiltersHeight}
                rowHeight={rowHeight}
                pagination={pagination}
                suppressRowClickSelection
                suppressCellSelection
                rowSelection="single"
                overlayLoadingTemplate={this.overlayLoadingTemplate}
                overlayNoRowsTemplate={this.overlayNoRowsTemplate}
                getRowHeight={this.getRowHeight}
                onGridReady={this.onGridReady}
                frameworkComponents={{
                  cellRenderer: CellRenderer,
                  cmaItemCellRenderer: CmaItemCellRenderer,
                  reportsCellRenderer: ReportsCellRenderer,
                  selectFloatingFilter: SelectFloatingFilter
                }}
                context={context}
                suppressColumnMoveAnimation
                animateRows
                defaultColDef={{
                  filter: 'agTextColumnFilter',
                  filterParams: {
                    valueGetter: function getter(params) {
                      const val = params.data[this.column.colId];
                      const { isFormatFilter, formatFilterKeys } = this.column.colDef;
                      let formattedValue = '';

                      if (val === null) {
                        return '';
                      }

                      if (isFormatFilter && formatFilterKeys.length && typeof val === 'object') {
                        formattedValue = dataTableComponent.customFormatObject(
                          val,
                          formatFilterKeys
                        );
                        return formattedValue;
                      }

                      if (typeof val === 'object') {
                        if (Array.isArray(val)) {
                          formattedValue = dataTableComponent.formatArray(val);
                        } else {
                          formattedValue = dataTableComponent.formatObject(val);
                        }

                        return formattedValue;
                      }

                      return val;
                    }
                  },
                  width: COLUMN_WIDTH
                }}
              />
            </div>
          );
        }}
      </Consumer>
    );
  }
}

DataTable.defaultProps = {
  pagination: true,
  enableFilter: true,
  enableSorting: true,
  enableColResize: true,
  floatingFilter: true,
  suppressMenu: true,
  autoHeight: false,
  isCmaTable: false,
  isReportsCmaTable: false,
  tableResultsAreLoading: false,
  headerHeight: 40,
  floatingFiltersHeight: 40,
  rowHeight: 38,
  context: {},
  hiddenColumns: [],
  filterData: {}
};

DataTable.propTypes = {
  columnDefs: PropTypes.array.isRequired,
  rowData: PropTypes.array.isRequired,
  tableHeight: PropTypes.number.isRequired,
  pagination: PropTypes.bool,
  enableFilter: PropTypes.bool,
  enableSorting: PropTypes.bool,
  enableColResize: PropTypes.bool,
  floatingFilter: PropTypes.bool,
  suppressMenu: PropTypes.bool,
  autoHeight: PropTypes.bool,
  isCmaTable: PropTypes.bool,
  isReportsCmaTable: PropTypes.bool,
  tableResultsAreLoading: PropTypes.bool,
  headerHeight: PropTypes.number,
  floatingFiltersHeight: PropTypes.number,
  rowHeight: PropTypes.number,
  context: PropTypes.object,
  hiddenColumns: PropTypes.array,
  filterData: PropTypes.object
};

export default DataTable;
