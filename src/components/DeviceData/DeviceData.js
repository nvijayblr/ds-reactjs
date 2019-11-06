/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Spin, Icon, Select, Tag, message } from 'antd';

import DeviceDataTab from '../DeviceDataTab/DeviceDataTab';
import MetaDataTable from '../MetaDataTable/MetaDataTable';
import { getIngestionHistoryRequest, getDeviceDataRequest } from '../../services/api';

import './DeviceData.scss';

const { TabPane } = Tabs;
const { Option } = Select;

class DeviceData extends Component {
  state = {
    ingestionHistory: [],
    deviceData: {},
    isLoading: false,
    defaultIngestionValue: '',
    selectedIngestionItemId: ''
  };

  componentDidMount() {
    this.getIngestionHistory();
  }

  getDefaultIngestionValue = ingestionItems => {
    const successfulIngestionItems = ingestionItems.filter(item => item.status);

    if (successfulIngestionItems.length) {
      return successfulIngestionItems[0].uuid;
    }

    return null;
  };

  getIngestionHistory = async () => {
    const { selectedDevice } = this.props;

    this.setState({ isLoading: true });

    try {
      const res = await getIngestionHistoryRequest(selectedDevice.uuid);
      const defaultIngestionValue = this.getDefaultIngestionValue(res.data);

      this.setState(
        {
          ingestionHistory: res.data,
          isLoading: false,
          selectedIngestionItemId: defaultIngestionValue,
          defaultIngestionValue
        },

        this.getDeviceData
      );
    } catch {
      message.error('Unfortunately there was an error getting the ingestion history');
      this.setState({ isLoading: false });
    }
  };

  getDeviceData = async () => {
    const { selectedDevice, setActiveTabKey } = this.props;
    const { selectedIngestionItemId } = this.state;

    if (!selectedIngestionItemId) {
      return;
    }

    this.setState({ isLoading: true });

    try {
      const res = await getDeviceDataRequest(selectedDevice.uuid, selectedIngestionItemId);
      if (selectedDevice.match_key) {
        selectedDevice.tab_key = selectedDevice.match_key.split(',')[0];
        selectedDevice.field_key = selectedDevice.match_key.split(',')[1];
        selectedDevice.filterData = {};
        if (selectedDevice.field_key) {
          selectedDevice.filterData = {
            fieldName: selectedDevice.field_key,
            value: selectedDevice.match_value
          };
        }

        let tabIndex = res.data.categories.findIndex(data => data.id === selectedDevice.tab_key);
        tabIndex = tabIndex < 0 ? 1 : tabIndex + 1;
        setActiveTabKey(String(tabIndex));
      }

      this.setState({
        deviceData: res.data,
        isLoading: false
      });
    } catch {
      message.error('Unfortunately there was an error getting the device data');
      this.setState({ isLoading: false });
    }
  };

  tabsOnChange = key => {
    const { selectedDevice, setActiveTabKey } = this.props;
    selectedDevice.filterData = {};
    setActiveTabKey(key);
  };

  handleHistorySelectChange = selectedIngestionItemId => {
    this.setState({ selectedIngestionItemId }, this.getDeviceData);
  };

  render() {
    const {
      deviceData,
      isLoading,
      ingestionHistory,
      defaultIngestionValue,
      selectedIngestionItemId
    } = this.state;
    const { activeTabKey, selectedDevice } = this.props;
    const tabs = [];
    const historyItems = ingestionHistory.map(item => (
      <Option value={item.uuid} key={item.uuid} disabled={!item.status}>
        <span>{item.created}</span>
        {!item.status && (
          <Tag color="red" style={{ marginLeft: '10px' }}>
            Failed
          </Tag>
        )}
      </Option>
    ));

    if (isLoading) {
      return (
        <div className="spin-wrapper">
          <Spin size="large" />
        </div>
      );
    }

    if (!defaultIngestionValue) {
      return (
        <div className="device-data">
          <div className="ingestion-date">
            <Icon type="calendar" className="ingestion-date-icon" />
            <Select
              defaultValue={defaultIngestionValue}
              onChange={this.handleHistorySelectChange}
              className="ingestion-date-select"
              value={selectedIngestionItemId}
            >
              {historyItems}
            </Select>
          </div>
          <div className="no-results-wrapper">
            <div className="message">
              <Icon type="exclamation-circle" />
              <span>No results</span>
            </div>
          </div>
        </div>
      );
    }

    if (!deviceData.categories) {
      return (
        <div className="device-data">
          <div className="ingestion-date">
            <Icon type="calendar" className="ingestion-date-icon" />
            <Select
              defaultValue={defaultIngestionValue}
              onChange={this.handleHistorySelectChange}
              className="ingestion-date-select"
              value={selectedIngestionItemId}
            >
              {historyItems}
            </Select>
          </div>
          {deviceData.metadata && <MetaDataTable data={deviceData.metadata} />}
          <div className="no-results-wrapper">
            <div className="message">
              <Icon type="exclamation-circle" />
              <span>No results</span>
            </div>
          </div>
        </div>
      );
    }

    deviceData.categories.forEach((category, index) => {
      const tabKey = index + 1;

      if (category.data && !category.data.length) {
        return;
      }
      // eslint-disable-next-line no-param-reassign
      category.selectedDevice = selectedDevice;

      tabs.push(
        <TabPane tab={category.title} key={tabKey}>
          {+tabKey === +activeTabKey && (
            <DeviceDataTab
              categoryData={category}
              selectedDeviceId={selectedDevice.uuid}
              selectedIngestionItemId={selectedIngestionItemId}
            />
          )}
        </TabPane>
      );
    });

    return (
      <div className="device-data">
        <div className="ingestion-date">
          <Icon type="calendar" className="ingestion-date-icon" />
          <Select
            defaultValue={defaultIngestionValue}
            onChange={this.handleHistorySelectChange}
            className="ingestion-date-select"
            value={selectedIngestionItemId}
          >
            {historyItems}
          </Select>
        </div>

        {deviceData.metadata && <MetaDataTable data={deviceData.metadata} />}
        <Tabs
          className="category-tabs"
          defaultActiveKey="1"
          onChange={this.tabsOnChange}
          activeKey={activeTabKey}
          animated={false}
          type="card"
        >
          {tabs}
        </Tabs>
      </div>
    );
  }
}

DeviceData.propTypes = {
  selectedDevice: PropTypes.object.isRequired,
  setActiveTabKey: PropTypes.func.isRequired,
  activeTabKey: PropTypes.string.isRequired
};

export default DeviceData;
