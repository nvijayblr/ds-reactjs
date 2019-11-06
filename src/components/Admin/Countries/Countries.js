import React, { Component, Fragment } from 'react';

import { Consumer, Context } from '../../../context';
import DataTable from '../../DataTable/DataTable';
import { formatTooltip } from '../../../utils/utils';

class Countries extends Component {
  static contextType = Context;

  defaultColumnDefs = {
    suppressMenu: true,
    tooltip: args => {
      const { value } = args;
      return this.formatTooltip(value);
    }
  };

  state = {
    tableHeight: 0,
    columnDefs: [{ ...this.defaultColumnDefs, headerName: 'Name', field: 'name' }]
  };

  tableWrapperRef = React.createRef();

  formatTooltip = formatTooltip;

  componentDidMount() {
    const { dispatch } = this.context;
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
    window.addEventListener('resize', this.setTableDimensions);
    this.setTableDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setTableDimensions);
  }

  setTableDimensions = () => {
    const marginBottom = 24;
    const offsetTop = this.tableWrapperRef.current.getBoundingClientRect().top;
    const tableHeight = window.innerHeight - offsetTop - marginBottom;

    this.setState({ tableHeight });
  };

  render() {
    const { columnDefs, tableHeight } = this.state;

    return (
      <Consumer>
        {value => {
          const { countryList } = value;
          return (
            <Fragment>
              <h2>Countries</h2>
              <div ref={this.tableWrapperRef}>
                <DataTable
                  ref={this.dataTableRef}
                  columnDefs={columnDefs}
                  rowData={countryList}
                  tableHeight={tableHeight}
                  suppressRowHoverHighlight
                  suppressRowClickSelection
                  useColumnDefOptions={false}
                />
              </div>
            </Fragment>
          );
        }}
      </Consumer>
    );
  }
}

export default Countries;
