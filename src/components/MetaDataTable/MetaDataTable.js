import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import { formatTooltip } from '../../utils/utils';
import { COLUMN_WIDTH } from '../../constants';

import './MetaDataTable.scss';

class MetaDataTable extends Component {
  state = {
    gridApi: null
  };

  gridWrapperRef = React.createRef();

  formatTooltip = formatTooltip;

  componentWillUnmount() {
    const { gridApi } = this.state;

    if (gridApi && gridApi.destroy) {
      gridApi.destroy();
    }
  }

  onGridReady = params => {
    this.setState({
      gridApi: params.api
    });
  };

  render() {
    const columns = [];
    const { data } = this.props;
    const { gridApi } = this.state;

    Object.keys(data).forEach(key => {
      columns.push(key);
    });

    const columnDefs = columns.map(column => ({
      headerName: column,
      field: column,
      suppressMenu: true,
      tooltip: args => {
        const { value } = args;
        return this.formatTooltip(value);
      }
    }));

    // If there are too few columns to fill the table horizontally,
    // use `.sizeColumnsToFit()` to fill the table
    if (this.gridWrapperRef.current && gridApi) {
      const gridWidth = this.gridWrapperRef.current.clientWidth;
      const columnCount = columnDefs.length;

      if (columnCount * COLUMN_WIDTH <= gridWidth) {
        gridApi.sizeColumnsToFit();
      }
    }

    return (
      <div className="ag-theme-balham metadata-table" ref={this.gridWrapperRef}>
        <AgGridReact
          domLayout="autoHeight"
          enableColResize
          columnDefs={columnDefs}
          rowData={[data]}
          headerHeight={40}
          rowHeight={38}
          pagination={false}
          suppressRowHoverHighlight
          suppressRowClickSelection
          suppressCellSelection
          rowSelection="single"
          onGridReady={this.onGridReady}
          defaultColDef={{
            width: COLUMN_WIDTH
          }}
        />
      </div>
    );
  }
}

MetaDataTable.propTypes = {
  data: PropTypes.object.isRequired
};

export default MetaDataTable;
