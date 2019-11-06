/* eslint-disable no-param-reassign */
import React, { Component, Fragment } from 'react';
import { Button, Select, message, Spin } from 'antd';
import moment from 'moment';

import ReportsDataTable from './ReportsDataTable';

import { Context } from '../../context';

import {
  getBatchesReq,
  getReportTypesVendorsReq,
  getReportOptionsReq,
  previewReportReq,
  downloadReportReq
} from '../../services/api';
import './Reports.scss';

const { Option } = Select;

class Reports extends Component {
  static contextType = Context;

  state = {
    levels: [],
    typesVendors: [],
    selectedTypeVendor: '',
    selectedLevels: '',
    category: [],
    reportsLoading: false,
    reportsLoaded: false,
    typeVendorLoading: true,
    deviceNames: [],
    selectedDevie: undefined,
    batches: [],
    selectedBatchId: undefined,
    filterData: {}
  };

  componentDidMount() {
    this.getBatches();
    this.getTypesVendors();
  }

  getDefaultIngestionValue = ingestionItems => {
    const successfulIngestionItems = ingestionItems.filter(item => item.status);

    if (successfulIngestionItems.length) {
      return successfulIngestionItems[0].result_uuid;
    }
    message.info('Unfortunately there is an empty ingestion history for the selected device.');
    return null;
  };

  getBatches = async () => {
    try {
      const res = await getBatchesReq();
      this.setState({
        batches: res.data && res.data.results ? res.data.results : [],
        selectedBatchId:
          res.data && res.data.results && res.data.results.length
            ? res.data.results[0].uuid
            : undefined
      });
    } catch (error) {
      message.error('Unfortunately there was an error getting the batches.');
    }
  };

  onBatchChange = selectedBatchId => {
    this.setState({ selectedBatchId }, this.clickGenerateRerport);
  };

  getTypesVendors = async () => {
    const { dispatch } = this.context;
    this.setState({ reportsLoading: true });
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
    try {
      const res = await getReportTypesVendorsReq();
      this.onGetTypesVendorsSuccess(res);
    } catch (error) {
      this.setState({ reportsLoading: false });
      message.error('Unfortunately there was an error getting types and vendors.');
    }
  };

  onGetTypesVendorsSuccess = res => {
    this.setState({
      typesVendors: res.data.options ? res.data.options : [],
      typeVendorLoading: false,
      reportsLoading: false
    });
  };

  onTypesVendorChange = value => {
    this.setState(
      {
        selectedTypeVendor: value,
        levels: [],
        selectedLevels: '',
        reportsLoading: true,
        category: [],
        deviceNames: [],
        selectedDevie: undefined,
        filterData: {},
        reportsLoaded: false
      },
      this.getLevels
    );
  };

  getLevels = async () => {
    const { selectedTypeVendor, selectedLevels, levels } = this.state;
    try {
      const res = await getReportOptionsReq(selectedTypeVendor, selectedLevels);

      if (!res.data.last_option) {
        this.setState(
          {
            reportsLoading: false,
            levels: [
              ...levels,
              {
                last_option: res.data.last_option,
                length: res.data.length,
                level: levels.length + 1,
                options: res.data.options,
                selected: ''
              }
            ]
          },
          this.clickGenerateRerport
        );
        return;
      }
      if (levels.length) {
        this.clickGenerateRerport();
      } else {
        this.setState({ reportsLoading: false }, this.generateRerport);
      }
    } catch (error) {
      this.clickGenerateRerport();
      message.error('Unfortunately there was an error getting the reports options.');
    }
  };

  onLevelsChange = (value, level) => {
    this.setState(
      {
        category: [],
        deviceNames: [],
        selectedDevie: undefined,
        filterData: {},
        selectedLevels: value,
        reportsLoading: true,
        reportsLoaded: false
      },
      this.getLevels
    );
  };

  generateSelect = level => {
    if (level.options.length) {
      // eslint-disable-next-line consistent-return
      return (
        <Select
          showSearch
          style={{ width: 220, marginRight: '16px' }}
          key="option-select"
          placeholder="Select Option..."
          optionFilterProp="children"
          onChange={e => {
            this.onLevelsChange(e, level);
          }}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {level.options.map(item => (
            <Option value={item} key={item}>
              {item}
            </Option>
          ))}
        </Select>
      );
    }
    return '';
  };

  clickGenerateRerport = () => {
    const { selectedTypeVendor, selectedLevels } = this.state;
    if (!selectedTypeVendor || !selectedLevels) return;
    this.setState(
      {
        category: [],
        reportsLoading: true,
        reportsLoaded: false
      },
      this.generateRerport
    );
  };

  generateRerport = async () => {
    const {
      selectedTypeVendor,
      selectedLevels,
      selectedBatchId,
      deviceNames,
      selectedDevie
    } = this.state;
    try {
      const res = await previewReportReq(selectedTypeVendor, selectedLevels, selectedBatchId);

      if (!res.data.length) {
        this.setState({
          category: [],
          deviceNames: [],
          selectedDevie: undefined,
          reportsLoading: false,
          reportsLoaded: true
        });
        return;
      }

      const flatData = [];
      res.data.forEach(obj => {
        obj.result.forEach((result, index) => {
          delete result.name;
          flatData.push({ ...obj, ...result });
          delete flatData[flatData.length - 1].result;
        });
      });

      if (!deviceNames.length) {
        deviceNames.push('All');
        res.data.forEach(obj => {
          if (deviceNames.indexOf(obj.name) < 0) {
            deviceNames.push(obj.name);
          }
        });
      }

      this.setState({
        category: flatData,
        deviceNames,
        selectedDevie: selectedDevie || 'All',
        reportsLoading: false,
        reportsLoaded: true
      });
    } catch (error) {
      this.setState({
        category: [],
        reportsLoading: false,
        reportsLoaded: true
      });
      message.error('Unfortunately there was an error getting the reports options.');
    }
  };

  onDeviceNameChange = selectedDevie => {
    this.setState({
      selectedDevie,
      filterData: {
        fieldName: 'name',
        value: selectedDevie === 'All' ? '' : selectedDevie,
        applyFilter: true
      }
    });
  };

  handleDownloadClicked = () => {
    const { selectedTypeVendor, selectedLevels, selectedBatchId } = this.state;
    try {
      downloadReportReq(selectedTypeVendor, selectedLevels, selectedBatchId, 'csv');
    } catch (error) {
      message.error('Unfortunately there was an error downloading the report.');
    }
  };

  render() {
    const {
      batches,
      selectedBatchId,
      typesVendors,
      deviceNames,
      selectedDevie,
      levels,
      category,
      reportsLoading,
      typeVendorLoading,
      reportsLoaded,
      filterData,
      selectedTypeVendor,
      selectedLevels
    } = this.state;

    const batchesOptions = batches.map(item => (
      <Option value={item.uuid} key={item.uuid}>
        {moment(item.created).format('MMM. DD, YYYY, hh:mm A')}
      </Option>
    ));

    const typesVendorOptions = typesVendors.map(item => (
      <Option value={item} key={item}>
        {item}
      </Option>
    ));

    const deviceOptions = deviceNames.map(item => (
      <Option value={item} key={item}>
        {item}
      </Option>
    ));

    return (
      <div className="reports">
        <div className="selects">
          <Select
            loading={typeVendorLoading}
            disabled={typeVendorLoading}
            style={{ width: 220, marginRight: '16px' }}
            placeholder="Select Batch..."
            optionFilterProp="children"
            onChange={this.onBatchChange}
            value={selectedBatchId}
          >
            {batchesOptions}
          </Select>
          <Select
            showSearch
            loading={typeVendorLoading}
            disabled={typeVendorLoading}
            style={{ width: 220, marginRight: '16px' }}
            placeholder="Select Vendor/Type..."
            optionFilterProp="children"
            onChange={this.onTypesVendorChange}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {typesVendorOptions}
          </Select>
          {levels.map((level, index) => !level.last_option && this.generateSelect(level))}

          {deviceNames.length > 0 && (
            <Select
              showSearch
              style={{ width: 220, marginRight: '16px' }}
              placeholder="Select Device..."
              optionFilterProp="children"
              onChange={this.onDeviceNameChange}
              value={selectedDevie}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {deviceOptions}
            </Select>
          )}
          {levels.length > 0 && (
            <Button
              icon="reload"
              type="primary"
              size="default"
              disabled={!selectedTypeVendor || !selectedLevels}
              onClick={this.clickGenerateRerport}
            >
              Reload
            </Button>
          )}
        </div>
        {reportsLoading && (
          <div className="spin-wrapper">
            <Spin size="large" />
          </div>
        )}
        <div className="reports-body">
          {reportsLoaded && (
            <Fragment>
              <ReportsDataTable categoryData={category} filterData={filterData} />
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

export default Reports;
