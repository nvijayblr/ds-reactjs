import React, { Component, Fragment } from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import Moment from 'moment';

import DataTable from '../DataTable/DataTable';
import { formatTooltip } from '../../utils/utils';

import '../DeviceDataTabTable/DeviceDataTabTable.scss';

class ReportsDataTable extends Component {
  state = {
    tableHeight: 0,
    columnDefs: [],
    isReportsCmaTable: true,
    context: { componentParent: this }
  };

  tableWrapperRef = React.createRef();

  dataTableRef = React.createRef();

  formatTooltip = formatTooltip;

  componentDidMount() {
    this.setColumnDefs();
    window.addEventListener('resize', this.setTableDimensions);
    window.requestAnimationFrame(this.setTableDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setTableDimensions);
  }

  setColumnDefs = () => {
    const { categoryData } = this.props;
    const columns = [];
    categoryData.forEach(dataItem => {
      Object.keys(dataItem).forEach(column => {
        if (!columns.includes(column)) {
          columns.push(column);
        }
      });
    });
    const columnDefs = columns.map(column => ({
      headerName: column,
      field: column,
      suppressMenu: true,
      isEmptyShow: true,
      cellClass: column === 'raw' ? 'rep-config-commands' : 'cell-wrap-text',
      tooltip: args => {
        const { value } = args;
        return this.formatTooltip(value);
      }
    }));
    this.setState({ columnDefs });
  };

  setTableDimensions = () => {
    const marginBottom = 24;
    if (this.tableWrapperRef.current) {
      const offsetTop = this.tableWrapperRef.current.getBoundingClientRect().top;
      const tableHeight = window.innerHeight - offsetTop - marginBottom;

      this.setState({ tableHeight });
    }
  };

  handleDownloadClicked = () => {
    const date = Moment().format();
    const params = {
      fileName: `DDS_Reports_${date}.csv`,
      processCellCallback(_params) {
        const { value } = _params;
        const items = [];

        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item.name) {
              items.push(item.name);
            } else {
              items.push(item || '');
            }
          });
          return items.join('\n');
        }
        return `${value}`;
      }
    };
    this.dataTableRef.current.downloadCsv(params);
  };

  render() {
    const { columnDefs, isReportsCmaTable, context, tableHeight } = this.state;
    const { categoryData, filterData } = this.props;

    return (
      <Fragment>
        <div className="button-wrapper">
          <Button
            icon="download"
            size="small"
            onClick={this.handleDownloadClicked}
            disabled={!categoryData.length}
          >
            Download CSV
          </Button>
        </div>
        <div ref={this.tableWrapperRef} className="device-data-tab-tables">
          <DataTable
            ref={this.dataTableRef}
            columnDefs={columnDefs}
            rowData={categoryData}
            tableHeight={tableHeight}
            isReportsCmaTable={isReportsCmaTable}
            context={context}
            filterData={filterData}
          />
        </div>
      </Fragment>
    );
  }
}

ReportsDataTable.defaultProps = {
  filterData: {}
};
ReportsDataTable.propTypes = {
  categoryData: PropTypes.array.isRequired,
  filterData: PropTypes.object
};

export default ReportsDataTable;
