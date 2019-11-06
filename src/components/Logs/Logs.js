import React, { Component, Fragment } from 'react';
import { Button, DatePicker, message } from 'antd';
import moment from 'moment';
import axios from 'axios';

import { Context } from '../../context';
import { getLogsRequest } from '../../services/api';
import DataTable from '../DataTable/DataTable';
import { formatTooltip } from '../../utils/utils';

const { RangePicker } = DatePicker;

class Logs extends Component {
  static contextType = Context;

  signal = axios.CancelToken.source();

  defaultColumnDefs = {
    suppressMenu: true,
    tooltip: args => {
      const { value } = args;
      return this.formatTooltip(value);
    }
  };

  defaultRange = [moment().startOf('week'), moment().endOf('week')];

  state = {
    logs: [],
    tableHeight: 0,
    columnDefs: [
      {
        ...this.defaultColumnDefs,
        headerName: 'Date',
        field: 'datetime',
        sort: 'desc',
        isFormatDate: true
      },
      { ...this.defaultColumnDefs, headerName: 'User', field: 'user' },
      { ...this.defaultColumnDefs, headerName: 'User Groups', field: 'user_groups' },
      { ...this.defaultColumnDefs, headerName: 'Method', field: 'method' },
      { ...this.defaultColumnDefs, headerName: 'Target', field: 'target' },
      { ...this.defaultColumnDefs, headerName: 'Target Entity', field: 'target_entity' },
      { ...this.defaultColumnDefs, headerName: 'Payload', field: 'payload' },
      {
        ...this.defaultColumnDefs,
        headerName: 'Error Message',
        field: 'errormessage',
        isEmptyShow: true
      },
      { ...this.defaultColumnDefs, headerName: 'Query', field: 'query' }
    ]
  };

  tableWrapperRef = React.createRef();

  dataTableRef = React.createRef();

  formatTooltip = formatTooltip;

  componentDidMount() {
    const { dispatch } = this.context;
    const defaultDates = {
      start: moment(this.defaultRange[0]).toISOString(),
      end: moment(this.defaultRange[1]).toISOString()
    };

    window.addEventListener('resize', this.handleWindowResize);
    this.updateLayout();

    this.getLogs(dispatch, defaultDates);
  }

  componentWillUnmount() {
    this.signal.cancel('Canceled');
    window.removeEventListener('resize', this.handleWindowResize);
  }

  onRangePickerChange = dates => {
    const { dispatch } = this.context;

    if (!dates.length) {
      this.getLogs(dispatch);
      return;
    }

    const params = {
      start: moment(dates[0]).toISOString(),
      end: moment(dates[1]).toISOString()
    };

    this.getLogs(dispatch, params);
  };

  handleDownloadClicked = () => {
    const date = moment().format();
    const params = {
      fileName: `DDS_logs_${date}`
    };

    params.processCellCallback = param => {
      if (param.column.colId === 'query' && typeof param.value === 'object') {
        return JSON.stringify(param.value).replace(/"|{|}/g, '');
      }
      return param.value;
    };

    this.dataTableRef.current.downloadCsv(params);
  };

  getLogs = async (dispatch, dates) => {
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: true });

    try {
      const res = await getLogsRequest(dates, { cancelToken: this.signal.token });

      dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });

      this.setState({
        logs: res.data
      });
    } catch (error) {
      if (error && error.message === 'Canceled') return;
      dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
      message.error('Unfortunately there was an error getting the logs');
    }
  };

  updateLayout = () => {
    this.setTableDimensions();
  };

  setTableDimensions = () => {
    const marginBottom = 24;
    const offsetTop = this.tableWrapperRef.current.getBoundingClientRect().top;
    const tableHeight = window.innerHeight - offsetTop - marginBottom;

    this.setState({ tableHeight });
  };

  handleWindowResize = () => {
    this.updateLayout();
  };

  render() {
    const { columnDefs, tableHeight, logs } = this.state;
    const ranges = {
      Today: [moment(), moment()],
      'This Week': [moment().startOf('week'), moment().endOf('week')],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'This Year': [moment().startOf('year'), moment().endOf('year')]
    };

    return (
      <Fragment>
        <div className="table-actions table-actions-logs">
          <RangePicker
            defaultValue={this.defaultRange}
            ranges={ranges}
            onChange={this.onRangePickerChange}
            size="small"
            className="range-picker"
          />
          <Button
            icon="download"
            size="small"
            onClick={this.handleDownloadClicked}
            disabled={!logs.length}
          >
            Download CSV
          </Button>
        </div>
        <div ref={this.tableWrapperRef}>
          <DataTable
            ref={this.dataTableRef}
            columnDefs={columnDefs}
            rowData={logs}
            tableHeight={tableHeight}
            suppressRowHoverHighlight
            suppressRowClickSelection
            useColumnDefOptions={false}
          />
        </div>
      </Fragment>
    );
  }
}

export default Logs;
