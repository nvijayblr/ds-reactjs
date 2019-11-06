import React, { Component } from 'react';
import PropTypes from 'prop-types';
import JSONTree from 'react-json-tree';
import { Spin, Alert, message } from 'antd';

import { getCmaDataRequest } from '../../services/api';

import './CmaData.scss';

const theme = {
  scheme: 'railscasts',
  author: 'ryan bates (http://railscasts.com)',
  base00: '#2b2b2b',
  base01: '#272935',
  base02: '#3a4055',
  base03: '#5a647e',
  base04: '#d4cfc9',
  base05: '#e6e1dc',
  base06: '#f4f1ed',
  base07: '#f9f7f3',
  base08: '#da4939',
  base09: '#cc7833',
  base0A: '#ffc66d',
  base0B: '#a5c261',
  base0C: '#519f50',
  base0D: '#6d9cbe',
  base0E: '#b6b3eb',
  base0F: '#bc9458'
};

class CmaData extends Component {
  state = {
    cmaData: {},
    isLoading: false
  };

  componentDidMount() {
    this.getCmaData();
  }

  getCmaData = async () => {
    const { selectedDeviceId, selectedCmaItem, selectedIngestionItemId } = this.props;

    this.setState({ isLoading: true });

    try {
      const res = await getCmaDataRequest(
        selectedDeviceId,
        selectedCmaItem.uid,
        selectedIngestionItemId
      );

      this.setState({
        cmaData: res.data,
        isLoading: false
      });
    } catch {
      message.error('Unfortunately there was an error getting the CMA data');
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { cmaData, isLoading } = this.state;

    if (isLoading) {
      return (
        <div className="spin-wrapper">
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div className="cma-data">
        {!cmaData && <Alert message="No data found" type="warning" showIcon />}
        {cmaData && <JSONTree data={cmaData} theme={theme} invertTheme hideRoot />}
      </div>
    );
  }
}

CmaData.propTypes = {
  selectedCmaItem: PropTypes.object.isRequired,
  selectedDeviceId: PropTypes.string.isRequired,
  selectedIngestionItemId: PropTypes.string.isRequired
};

export default CmaData;
