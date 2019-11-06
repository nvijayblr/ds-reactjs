import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'antd';
import Moment from 'moment';

import DataTable from '../DataTable/DataTable';
import CmaData from '../CmaData/CmaData';
import { formatTooltip } from '../../utils/utils';

import './DeviceDataTabTable.scss';

class DeviceDataTabTable extends Component {
  state = {
    tableHeight: 0,
    columnDefs: [],
    isCmaTable: false,
    context: { componentParent: this },
    modalBodyHeight: 0,
    modalVisible: false,
    selectedCmaItem: null,
    filterData: {},
    showDownload: false
  };

  tableWrapperRef = React.createRef();

  dataTableRef = React.createRef();

  formatTooltip = formatTooltip;

  componentDidMount() {
    const { nestedTabsTable, categoryData } = this.props;
    const isCmaTable = categoryData.id === 'nat_rules' || categoryData.id === 'access_rules';

    this.setState({ isCmaTable }, this.setColumnDefs);

    if (categoryData.id === 'config') {
      this.setState({ showDownload: true });
    }
    if (!nestedTabsTable) {
      window.addEventListener('resize', this.handleWindowResize);
      window.requestAnimationFrame(this.setTableDimensions);
    }
  }

  componentWillUnmount() {
    const { nestedTabsTable } = this.props;

    if (!nestedTabsTable) {
      window.removeEventListener('resize', this.handleWindowResize);
    }
  }

  handleDownloadClicked = () => {
    const { metadata } = this.props;
    const date = Moment().format();
    const params = {
      fileName: `DDS_device_config_${metadata.name}_${date}.txt`,
      skipHeader: true,
      suppressQuotes: true
    };
    this.dataTableRef.current.downloadCsv(params);
  };

  handlePolicyDownloadClicked = () => {
    const { metadata } = this.props;
    const date = Moment().format();
    const params = {
      fileName: `DDS_device_policy_${metadata.name}_${date}.csv`,
      processCellCallback(_params) {
        const { value } = _params;
        const items = [];

        if (Array.isArray(value)) {
          value.forEach(item => {
            items.push(item.name);
          });
          return items.join('\n');
        }
        return `${value}`;
      }
    };
    this.dataTableRef.current.downloadCsv(params);
  };

  setColumnDefs = () => {
    const { categoryData } = this.props;
    const columns = [];

    categoryData.data.forEach(dataItem => {
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
      cellClass: categoryData.id === 'config' ? 'config-commands' : '',
      tooltip: args => {
        const { value, data } = args;
        const isCmaItemList =
          (data.type === 'nat-rule' || data.type === 'access-rule') && Array.isArray(value);

        if (isCmaItemList) {
          return null;
        }

        return this.formatTooltip(value);
      }
    }));
    categoryData.selectedDevice = categoryData.selectedDevice ? categoryData.selectedDevice : {};
    this.setState({ columnDefs, filterData: categoryData.selectedDevice.filterData });
  };

  setTableDimensions = () => {
    const { metadata } = this.props;
    // This is a bit flaky fix - the `offsetTop` should be calculated dynamically using `this.tableWrapperRef.current.getBoundingClientRect().top`,
    // but there is an issue getting the correct value when it relies on the timing of other components rendering.
    const marginBottom = metadata ? 84 : 88;
    const offsetTop = metadata ? 516 : 352;
    const tableHeight = window.innerHeight - offsetTop - marginBottom;

    this.setState({ tableHeight });
  };

  handleWindowResize = () => {
    this.updateLayout();
  };

  handleCmaItemClicked = item => {
    this.setState({ selectedCmaItem: item }, this.showCmaModal);
  };

  updateLayout = () => {
    this.setTableDimensions();
    this.setModalBodyHeight();
  };

  showCmaModal = () => {
    this.setState(
      {
        modalVisible: true
      },
      this.setModalBodyHeight
    );
  };

  handleCancel = e => {
    this.setState({
      modalVisible: false,
      selectedCmaItem: null
    });
  };

  setModalBodyHeight = () => {
    const marginTop = 40;
    const marginBottom = 40;
    const modalHeaderheight = 55;
    const modalBodyHeight = window.innerHeight - marginTop - marginBottom - modalHeaderheight;

    this.setState({ modalBodyHeight });
  };

  render() {
    const {
      columnDefs,
      isCmaTable,
      context,
      tableHeight: stateTableHeight,
      modalBodyHeight,
      modalVisible,
      selectedCmaItem,
      filterData,
      showDownload
    } = this.state;
    const {
      categoryData,
      nestedTabsTable,
      tableHeight: propsTableHeight,
      selectedDeviceId,
      selectedIngestionItemId,
      isPolicyDownload
    } = this.props;
    const tableHeight = nestedTabsTable ? propsTableHeight : stateTableHeight;

    return (
      <Fragment>
        {isPolicyDownload && (
          <Button
            className="policy-btn-download"
            icon="download"
            onClick={this.handlePolicyDownloadClicked}
          >
            Download CSV
          </Button>
        )}
        <div ref={this.tableWrapperRef} className="device-data-tab-table">
          {showDownload && (
            <div className="button-wrapper">
              <Button icon="download" size="small" onClick={this.handleDownloadClicked}>
                Download Config
              </Button>
            </div>
          )}
          <DataTable
            ref={this.dataTableRef}
            columnDefs={columnDefs}
            rowData={categoryData.data}
            tableHeight={tableHeight}
            suppressRowHoverHighlight
            suppressRowClickSelection
            isCmaTable={isCmaTable}
            context={context}
            filterData={filterData}
          />
        </div>
        {selectedCmaItem && (
          <Modal
            title={selectedCmaItem.name}
            visible={modalVisible}
            onCancel={this.handleCancel}
            width="95%"
            footer={null}
            style={{ top: '40px' }}
            bodyStyle={{ height: modalBodyHeight }}
            destroyOnClose
            zIndex={1031}
          >
            <CmaData
              selectedCmaItem={selectedCmaItem}
              selectedDeviceId={selectedDeviceId}
              selectedIngestionItemId={selectedIngestionItemId}
            />
          </Modal>
        )}
      </Fragment>
    );
  }
}

DeviceDataTabTable.defaultProps = {
  metadata: null,
  nestedTabsTable: false,
  tableHeight: null,
  isPolicyDownload: false
};

DeviceDataTabTable.propTypes = {
  categoryData: PropTypes.object.isRequired,
  metadata: PropTypes.any,
  nestedTabsTable: PropTypes.bool,
  tableHeight: PropTypes.number,
  selectedDeviceId: PropTypes.any.isRequired,
  selectedIngestionItemId: PropTypes.string.isRequired,
  isPolicyDownload: PropTypes.bool
};

export default DeviceDataTabTable;
