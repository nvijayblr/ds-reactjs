/* eslint no-underscore-dangle: [1, { "allow": ["__env"] }] */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Spin, message } from 'antd';
import Moment from 'moment';

import { Consumer, Context } from '../../context';
import DataTable from '../DataTable/DataTable';
import DeviceData from '../DeviceData/DeviceData';
import DeviceDataTab from '../DeviceDataTab/DeviceDataTab';
import { formatTooltip } from '../../utils/utils';

import { getEasyIPRequest } from '../../services/api';

import './DeviceSearchResults.scss';

const { observerDomain } = window.__env;

class DeviceSearchResults extends Component {
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
    modalBodyHeight: 0,
    columnDefs: [
      {
        ...this.defaultColumnDefs,
        headerName: 'Hostname',
        field: 'hostname',
        pinned: 'left',
        floatingFilterComponent: 'selectFloatingFilter',
        floatingFilterComponentParams: {
          options: [],
          fieldName: 'hostname',
          type: 'equals',
          suppressFilterButton: false
        },
        filter: 'agTextColumnFilter',
        suppressMenu: true
      },
      {
        ...this.defaultColumnDefs,
        headerName: 'IP',
        field: 'ip'
      },
      {
        ...this.defaultColumnDefs,
        headerName: 'Type',
        field: 'type',
        floatingFilterComponent: 'selectFloatingFilter',
        floatingFilterComponentParams: {
          options: [],
          fieldName: 'type',
          type: 'equals',
          suppressFilterButton: false
        },
        filter: 'agTextColumnFilter',
        suppressMenu: true
      },
      {
        ...this.defaultColumnDefs,
        headerName: 'Vendor',
        field: 'vendor',
        floatingFilterComponent: 'selectFloatingFilter',
        floatingFilterComponentParams: {
          options: [],
          fieldName: 'vendor',
          type: 'equals',
          suppressFilterButton: false
        },
        filter: 'agTextColumnFilter',
        suppressMenu: true
      },
      {
        ...this.defaultColumnDefs,
        headerName: 'Version',
        field: 'version'
      },
      {
        ...this.defaultColumnDefs,
        headerName: 'Updated',
        field: 'updated',
        isFormatDate: true
      },
      {
        ...this.defaultColumnDefs,
        headerName: 'Match Type',
        field: 'match_type',
        floatingFilterComponent: 'selectFloatingFilter',
        floatingFilterComponentParams: {
          options: [],
          fieldName: 'match_type',
          type: 'equals',
          suppressFilterButton: false
        },
        filter: 'agTextColumnFilter',
        suppressMenu: true
      },
      {
        ...this.defaultColumnDefs,
        headerName: 'Match Value',
        field: 'match_value'
      },
      {
        ...this.defaultColumnDefs,
        headerName: 'Status',
        field: 'status',
        displayIcon: true,
        comparator: (valueA, valueB) => (valueB && valueA ? valueB.status - valueA.status : '')
      }
    ],
    modalVisible: false,
    selectedDevice: {},
    deviceMetaData: {},
    isMetaDataLoading: false,
    showOnlyMetaData: false,
    activeTabKey: '1',
    context: { componentParent: this }
  };

  tableWrapperRef = React.createRef();

  dataTableRef = React.createRef();

  formatTooltip = formatTooltip;

  componentDidMount() {
    const { dispatch } = this.context;

    window.addEventListener('resize', this.handleWindowResize);
    this.clearResults(dispatch);
    this.updateLayout();
  }

  componentWillUnmount() {
    const { dispatch } = this.context;

    dispatch({ type: 'SHOW_RESULTS_TABLE', payload: false });
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleDownloadClicked = () => {
    const date = Moment().format();
    const params = {
      fileName: `DDS_devices_search_${date}`
    };

    params.processCellCallback = param => {
      if (param.column.colId === 'status' && typeof param.value === 'object') {
        return `${param.value.message}`;
      }
      return param.value;
    };

    this.dataTableRef.current.downloadCsv(params);
  };

  clearResults = dispatch => {
    dispatch({ type: 'SET_DEVICES', payload: [] });
  };

  setActiveTabKey = key => {
    this.setState({
      activeTabKey: key
    });
  };

  updateLayout = () => {
    this.setTableDimensions();
    this.setModalBodyHeight();
  };

  getEasyIPDetails = device => {
    this.setState(
      {
        isMetaDataLoading: true,
        selectedDevice: device,
        showOnlyMetaData: true,
        deviceMetaData: {
          categories: [],
          title: 'EasyIP Information',
          metadata: {}
        }
      },
      this.showModal
    );

    getEasyIPRequest(device.ip)
      .then(response => {
        const { data } = response;
        this.setState(prevState => ({
          isMetaDataLoading: false,
          deviceMetaData: {
            ...prevState.deviceMetaData,
            metadata: data.length ? data[0] : {}
          }
        }));
      })
      .catch(error => {
        message.error('Unfortunately there was an error getting the EasyIP details.');
        this.setState({ isMetaDataLoading: false });
      });
  };

  handleHostnameClicked = selectedRowItem => {
    if (selectedRowItem.type === 'EasyIP') {
      this.getEasyIPDetails(selectedRowItem);
      return;
    }

    if (selectedRowItem.uuid) {
      this.setState({ selectedDevice: selectedRowItem, showOnlyMetaData: false }, this.showModal);
      return;
    }

    if (selectedRowItem.type === 'cloudmap') {
      window.open(
        `${observerDomain}/cloudmaps/nodes/${selectedRowItem.match_type}/${selectedRowItem.match_value}`,
        '_blank'
      );
    }
  };

  showModal = () => {
    this.setState({
      modalVisible: true
    });
  };

  handleCancel = e => {
    this.setState({
      modalVisible: false,
      activeTabKey: '1',
      selectedDevice: null
    });
  };

  setTableDimensions = () => {
    const marginBottom = 24;
    const offsetTop = this.tableWrapperRef.current.getBoundingClientRect().top;
    const tableHeight = window.innerHeight - offsetTop - marginBottom;

    this.setState({ tableHeight });
  };

  setModalBodyHeight = () => {
    const marginTop = 40;
    const marginBottom = 40;
    const modalHeaderheight = 55;
    const modalBodyHeight = window.innerHeight - marginTop - marginBottom - modalHeaderheight;

    this.setState({ modalBodyHeight });
  };

  handleWindowResize = () => {
    this.updateLayout();
  };

  render() {
    const {
      columnDefs,
      tableHeight,
      selectedDevice,
      modalBodyHeight,
      activeTabKey,
      modalVisible,
      context,
      showOnlyMetaData,
      deviceMetaData,
      isMetaDataLoading
    } = this.state;

    const { hiddenColumns } = this.props;

    return (
      <Consumer>
        {value => {
          const { devices, showResultsTable, tableResultsAreLoading } = value;

          return (
            <Fragment>
              <div className="table-actions table-actions-search-results">
                {showResultsTable && (
                  <Button
                    icon="download"
                    size="small"
                    onClick={this.handleDownloadClicked}
                    disabled={!devices.length}
                  >
                    Download CSV
                  </Button>
                )}
              </div>

              <div ref={this.tableWrapperRef} className="search-results">
                {showResultsTable && (
                  <DataTable
                    ref={this.dataTableRef}
                    columnDefs={columnDefs}
                    rowData={devices}
                    tableHeight={tableHeight}
                    onRowClicked={this.handleRowClicked}
                    context={context}
                    hiddenColumns={hiddenColumns}
                    tableResultsAreLoading={tableResultsAreLoading}
                  />
                )}
                {selectedDevice && !showOnlyMetaData && (
                  <Modal
                    title={selectedDevice.hostname}
                    visible={modalVisible}
                    onCancel={this.handleCancel}
                    width="95%"
                    footer={null}
                    style={{ top: '40px' }}
                    bodyStyle={{ height: modalBodyHeight }}
                    destroyOnClose
                  >
                    <DeviceData
                      selectedDevice={selectedDevice}
                      activeTabKey={activeTabKey}
                      setActiveTabKey={this.setActiveTabKey}
                    />
                  </Modal>
                )}
                {selectedDevice && showOnlyMetaData && (
                  <Modal
                    title={`${deviceMetaData.title} - ${selectedDevice.hostname}`}
                    visible={modalVisible}
                    onCancel={this.handleCancel}
                    width="700px"
                    footer={null}
                    style={{ top: '40px' }}
                    bodyStyle={{ height: modalBodyHeight }}
                    destroyOnClose
                  >
                    {isMetaDataLoading && (
                      <div className="spin-wrapper">
                        <Spin size="default" />
                      </div>
                    )}
                    {!isMetaDataLoading && (
                      <DeviceDataTab
                        categoryData={deviceMetaData}
                        showOnlyMetaData={showOnlyMetaData}
                      />
                    )}
                  </Modal>
                )}
              </div>
            </Fragment>
          );
        }}
      </Consumer>
    );
  }
}

DeviceSearchResults.defaultProps = {
  hiddenColumns: []
};

DeviceSearchResults.propTypes = {
  hiddenColumns: PropTypes.array
};

export default DeviceSearchResults;
