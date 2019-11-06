import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import MetaCellRenderer from './MetaCellRenderer';

import './MetaDataTableVertical.scss';

class MetaDataTableVertical extends Component {
  state = {
    gridApi: null
  };

  componentWillUnmount() {
    const { gridApi } = this.state;

    if (gridApi && gridApi.destroy) {
      gridApi.destroy();
    }
  }

  onGridReady = params => {
    this.setState(
      {
        gridApi: params.api
      },
      this.resetRowHeights
    );

    params.api.resetRowHeights();
    params.api.sizeColumnsToFit();
  };

  createTableData = () => {
    const { data, showOnlyMetaData } = this.props;
    const tableData = {
      data: [],
      columnDefs: []
    };

    tableData.columnDefs = [
      {
        headerName: 'key',
        field: 'key',
        suppressMenu: true,
        autoHeight: !showOnlyMetaData,
        cellRenderer: 'metaCellRenderer'
      },
      {
        headerName: 'value',
        field: 'value',
        suppressMenu: true,
        autoHeight: !showOnlyMetaData,
        cellRenderer: 'metaCellRenderer'
      }
    ];

    Object.keys(data).forEach(key => {
      if (data[key] === null) {
        return;
      }

      tableData.data.push({
        key,
        value: data[key]
      });
    });

    return tableData;
  };

  render() {
    const tableData = this.createTableData();
    const { tableHeight } = this.props;

    return (
      <div
        className="ag-theme-balham metadata-table-vertical"
        style={{
          height: `${tableHeight}px`
        }}
      >
        <AgGridReact
          enableColResize
          columnDefs={tableData.columnDefs}
          rowData={tableData.data}
          headerHeight={0}
          rowHeight={38}
          pagination={false}
          suppressRowHoverHighlight
          suppressRowClickSelection
          suppressCellSelection
          rowSelection="single"
          onGridReady={this.onGridReady}
          frameworkComponents={{
            metaCellRenderer: MetaCellRenderer
          }}
        />
      </div>
    );
  }
}

MetaDataTableVertical.defaultProps = {
  showOnlyMetaData: false
};

MetaDataTableVertical.propTypes = {
  data: PropTypes.object.isRequired,
  tableHeight: PropTypes.number.isRequired,
  showOnlyMetaData: PropTypes.bool
};

export default MetaDataTableVertical;
