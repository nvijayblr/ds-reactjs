import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';

import DeviceDataTabTable from '../DeviceDataTabTable/DeviceDataTabTable';
import MetaDataTableVertical from '../MetaDataTable/MetaDataTableVertical';
import './DeviceDataTab.scss';

const { TabPane } = Tabs;

class DeviceDataTab extends Component {
  state = {
    activeTabKey: '1',
    metaDataVerticalHeight: 0
  };

  deviceDataTabRef = React.createRef();

  componentDidMount() {
    const { categoryData } = this.props;
    window.addEventListener('resize', this.handleWindowResize);

    if (categoryData.metadata) {
      window.requestAnimationFrame(this.setMetaDataVerticalHeight);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  tabsOnChange = key => {
    this.setState({ activeTabKey: key });
  };

  setMetaDataVerticalHeight = () => {
    this.setState({ metaDataVerticalHeight: this.deviceDataTabRef.current.clientHeight });
  };

  handleWindowResize = () => {
    const { categoryData } = this.props;

    if (categoryData.metadata) {
      this.setMetaDataVerticalHeight();
    }
  };

  render() {
    const {
      categoryData,
      selectedDeviceId,
      selectedIngestionItemId,
      showOnlyMetaData
    } = this.props;
    const { activeTabKey, metaDataVerticalHeight } = this.state;
    const deviceDataTabTableHeight = metaDataVerticalHeight - 30;

    if (showOnlyMetaData) {
      return (
        <div className="device-data-tab" ref={this.deviceDataTabRef}>
          <div className="column metadata-column meta-only">
            <MetaDataTableVertical
              data={categoryData.metadata}
              orientation="vertical"
              tableHeight={metaDataVerticalHeight}
              showOnlyMetaData={showOnlyMetaData}
            />
          </div>
        </div>
      );
    }

    if (categoryData.categories) {
      const tabs = categoryData.categories.map((category, index) => {
        const tabKey = index + 1;

        return (
          <TabPane tab={category.title} key={tabKey}>
            {+tabKey === +activeTabKey && (
              <DeviceDataTabTable
                categoryData={category}
                metadata={categoryData.metadata}
                tableHeight={deviceDataTabTableHeight}
                nestedTabsTable
                selectedDeviceId={selectedDeviceId}
                selectedIngestionItemId={selectedIngestionItemId}
              />
            )}
          </TabPane>
        );
      });

      return (
        <div className="device-data-tab" ref={this.deviceDataTabRef}>
          <div className="column metadata-column">
            {categoryData.metadata && !!Object.keys(categoryData.metadata).length && (
              <MetaDataTableVertical
                data={categoryData.metadata}
                orientation="vertical"
                tableHeight={metaDataVerticalHeight}
              />
            )}
          </div>
          <div className="column tabs-column">
            {!!categoryData.categories.length && (
              <Tabs
                defaultActiveKey="1"
                onChange={this.tabsOnChange}
                activeKey={activeTabKey}
                animated={false}
              >
                {tabs}
              </Tabs>
            )}
          </div>
        </div>
      );
    }

    return (
      <DeviceDataTabTable
        categoryData={categoryData}
        selectedDeviceId={selectedDeviceId}
        selectedIngestionItemId={selectedIngestionItemId}
      />
    );
  }
}

DeviceDataTab.defaultProps = {
  selectedDeviceId: '',
  selectedIngestionItemId: '',
  showOnlyMetaData: false
};

DeviceDataTab.propTypes = {
  categoryData: PropTypes.object.isRequired,
  selectedDeviceId: PropTypes.string,
  selectedIngestionItemId: PropTypes.string,
  showOnlyMetaData: PropTypes.bool
};

export default DeviceDataTab;
