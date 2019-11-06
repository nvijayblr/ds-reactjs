import React, { Component } from 'react';
import { Select, Tabs, Spin, Tag, Icon, message } from 'antd';
import moment from 'moment';
import {
  getPoliciesCmasRequest,
  getCmaPolicyPackagesRequest,
  getCmaPolicyPackageDataRequest,
  getIngestionHistoryRequest
} from '../../services/api';
import { Context } from '../../context';

import DeviceDataTabTable from '../../components/DeviceDataTabTable/DeviceDataTabTable';
import './PoliciesPage.scss';

const { Option } = Select;
const { TabPane } = Tabs;

class PoliciesPage extends Component {
  static contextType = Context;

  state = {
    cmas: [],
    policyPackages: [],
    policyPackageData: null,
    activeTabKey: '1',
    selectedPolicyPackage: undefined,
    ingestionHistory: [],
    defaultIngestionValue: '',
    selectedIngestionItemId: undefined,
    selectedDeviceId: undefined,
    cmaPolicyPackageDataLoading: true,
    policyPackageSelectLoading: true,
    cmaDeviceLoading: true,
    cmaIngestionHistoryLoading: true,
    tableHeight: 0
  };

  deviceDataTabTableWrapperRef = React.createRef();

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);

    this.getCmas();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    if (this.deviceDataTabTableWrapperRef.current) {
      this.setTableHeight();
    }
  };

  displayMessage = (type, content) => {
    message[type](content);
  };

  hideLoaders = () => {
    this.setState({
      cmaPolicyPackageDataLoading: false,
      policyPackageSelectLoading: false,
      cmaIngestionHistoryLoading: false,
      cmaDeviceLoading: false
    });
  };

  getCmas = async () => {
    const { dispatch } = this.context;
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
    try {
      const res = await getPoliciesCmasRequest();

      this.onGetPoliciesCmasSuccess(res);
    } catch (error) {
      this.hideLoaders();
      this.displayMessage('error', 'Unfortunately there was an error getting the cmas');
    }
  };

  onGetPoliciesCmasSuccess = res => {
    this.setState(
      { cmas: res.data, cmaDeviceLoading: false, selectedIngestionItemId: undefined },
      () => {
        const { cmas } = this.state;
        if (cmas.length) {
          this.onCmaSelectChange(cmas[0].uuid);
        }
      }
    );
  };

  onCmaSelectChange = deviceId => {
    this.setState(
      {
        cmaPolicyPackageDataLoading: true,
        policyPackageSelectLoading: true,
        cmaIngestionHistoryLoading: true,
        selectedPolicyPackage: undefined,
        policyPackages: [],
        policyPackageData: null,
        activeTabKey: '1',
        ingestionHistory: [],
        defaultIngestionValue: '',
        selectedIngestionItemId: undefined,
        selectedDeviceId: deviceId,
        tableHeight: 0
      },
      () => this.getIngestionHistory(deviceId)
    );
  };

  getDefaultIngestionValue = ingestionItems => {
    const successfulIngestionItems = ingestionItems.filter(item => item.status);

    if (successfulIngestionItems.length) {
      return successfulIngestionItems[0].uuid;
    }
    message.info('Unfortunately there is an empty ingestion history for the selected device.');
    this.hideLoaders();
    return null;
  };

  getIngestionHistory = async deviceId => {
    try {
      const res = await getIngestionHistoryRequest(deviceId);
      const defaultIngestionValue = this.getDefaultIngestionValue(res.data);
      this.setState(
        {
          ingestionHistory: res.data,
          selectedIngestionItemId: defaultIngestionValue,
          cmaIngestionHistoryLoading: false,
          defaultIngestionValue
        },
        () => this.getCmaPolicyPackages(deviceId, defaultIngestionValue)
      );
    } catch {
      message.error('Unfortunately there was an error getting the ingestion history');
      this.hideLoaders();
    }
  };

  handleHistorySelectChange = selectedIngestionItemId => {
    const { selectedDeviceId } = this.state;

    this.setState(
      {
        selectedIngestionItemId,
        policyPackageData: null,
        cmaPolicyPackageDataLoading: true,
        policyPackageSelectLoading: true,
        selectedPolicyPackage: undefined,
        policyPackages: [],
        activeTabKey: '1',
        tableHeight: 0
      },
      () => this.getCmaPolicyPackages(selectedDeviceId, selectedIngestionItemId)
    );
  };

  getCmaPolicyPackages = async (deviceId, ingestionId) => {
    if (!deviceId || !ingestionId) return;
    try {
      const res = await getCmaPolicyPackagesRequest(deviceId, ingestionId);

      this.onGetCmaPolicyPackagesSuccess(res);
    } catch (error) {
      this.displayMessage('error', 'Unfortunately there was an error getting the policy packages');
      this.hideLoaders();
    }
  };

  onGetCmaPolicyPackagesSuccess = res => {
    this.setState(
      {
        policyPackages: res.data,
        policyPackageSelectLoading: false,
        selectedPolicyPackage: res.data.length ? res.data[0] : undefined
      },
      this.getCmaPolicyPackageData
    );
  };

  onPolicyPackageSelectChange = value => {
    this.setState(
      {
        selectedPolicyPackage: value,
        policyPackageData: null,
        activeTabKey: '1',
        tableHeight: 0
      },
      this.getCmaPolicyPackageData
    );
  };

  getCmaPolicyPackageData = async () => {
    const { selectedDeviceId, selectedIngestionItemId, selectedPolicyPackage } = this.state;

    if (!selectedDeviceId || !selectedIngestionItemId) {
      return;
    }

    this.setState({ cmaPolicyPackageDataLoading: true });

    try {
      const res = await getCmaPolicyPackageDataRequest(
        selectedDeviceId,
        selectedIngestionItemId,
        selectedPolicyPackage
      );

      this.onGetCmaPolicyPackageDataSuccess(res);
    } catch (error) {
      this.displayMessage(
        'error',
        'Unfortunately there was an error getting the policy package data'
      );
      this.setState({ cmaPolicyPackageDataLoading: false });
    }
  };

  onGetCmaPolicyPackageDataSuccess = res => {
    if (res.data && res.data.categories.length && res.data.categories[0].id === 'inventory') {
      res.data.categories.splice(0, 1);
    }
    this.setState(
      { policyPackageData: res.data, cmaPolicyPackageDataLoading: false },
      this.setTableHeight
    );
  };

  tabsOnChange = key => {
    this.setState({ activeTabKey: key });
  };

  setTableHeight = () => {
    if (this.deviceDataTabTableWrapperRef.current) {
      this.setState({ tableHeight: this.deviceDataTabTableWrapperRef.current.clientHeight - 24 });
    }
  };

  render() {
    const {
      cmas,
      policyPackages,
      activeTabKey,
      selectedDeviceId,
      selectedPolicyPackage,
      policyPackageData,
      ingestionHistory,
      defaultIngestionValue,
      selectedIngestionItemId,
      cmaPolicyPackageDataLoading,
      policyPackageSelectLoading,
      cmaDeviceLoading,
      cmaIngestionHistoryLoading,
      tableHeight
    } = this.state;

    const cmaOptions = cmas.map(item => (
      <Option value={item.uuid} key={item.uuid}>
        {item.name}
      </Option>
    ));
    const policyPackagesOptions = policyPackages.map(item => (
      <Option value={item} key={item}>
        {item}
      </Option>
    ));
    const historyItems = ingestionHistory.map(item => (
      <Option value={item.uuid} key={item.uuid} disabled={!item.status}>
        <span>
          {moment(item.created)
            .utc()
            .format('MMM. DD, YYYY, hh:mm A')}
        </span>
        {!item.status && (
          <Tag color="red" style={{ marginLeft: '10px' }}>
            Failed
          </Tag>
        )}
      </Option>
    ));
    let tabs = null;

    if (defaultIngestionValue && policyPackageData) {
      tabs = policyPackageData.categories.map((category, index) => {
        const tabKey = index + 1;
        return (
          <TabPane tab={category.title} key={tabKey}>
            {+tabKey === +activeTabKey && (
              <div
                className="device-data-tab-table-wrapper"
                ref={this.deviceDataTabTableWrapperRef}
              >
                {category.data && (
                  <DeviceDataTabTable
                    categoryData={category}
                    metadata={policyPackageData.metadata}
                    tableHeight={tableHeight}
                    nestedTabsTable
                    selectedDeviceId={selectedDeviceId}
                    selectedIngestionItemId={selectedIngestionItemId}
                    isPolicyDownload
                  />
                )}
              </div>
            )}
          </TabPane>
        );
      });
    }

    return (
      <div className="policies">
        <div className="selects">
          <Select
            showSearch
            style={{ width: 220, marginRight: '16px' }}
            placeholder="Select CMA..."
            value={selectedDeviceId}
            loading={cmaDeviceLoading}
            disabled={cmaDeviceLoading}
            optionFilterProp="children"
            onChange={this.onCmaSelectChange}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {cmaOptions}
          </Select>
          <Icon type="calendar" className="ingestion-date-icon" />
          <Select
            style={{ width: 320, marginRight: '16px' }}
            loading={cmaIngestionHistoryLoading}
            disabled={cmaIngestionHistoryLoading}
            placeholder="Select Ingestion Date..."
            onChange={this.handleHistorySelectChange}
            className="ingestion-date-select"
            value={selectedIngestionItemId}
          >
            {historyItems}
          </Select>
          <Select
            disabled={policyPackageSelectLoading || !policyPackagesOptions.length}
            loading={policyPackageSelectLoading}
            showSearch
            style={{ width: 220 }}
            placeholder="Select policy package..."
            optionFilterProp="children"
            onChange={this.onPolicyPackageSelectChange}
            value={selectedPolicyPackage}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {policyPackagesOptions}
          </Select>
        </div>
        {cmaPolicyPackageDataLoading && (
          <div className="spin-wrapper">
            <Spin size="large" />
          </div>
        )}
        <div>
          {policyPackageData && (
            <div className="policy-data-table-wrapper">
              <Tabs
                defaultActiveKey="1"
                onChange={this.tabsOnChange}
                activeKey={activeTabKey}
                animated={false}
                type="card"
              >
                {tabs}
              </Tabs>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default PoliciesPage;
