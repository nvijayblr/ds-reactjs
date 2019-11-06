import React, { Component } from 'react';
import axios from 'axios';
import { message } from 'antd';

import { Context } from '../../context';
import { getDevicesRequest } from '../../services/api';

import DeviceSearchResults from '../../components/DeviceSearchResults/DeviceSearchResults';

class DevicesPage extends Component {
  static contextType = Context;

  signal = axios.CancelToken.source();

  componentDidMount() {
    const { dispatch } = this.context;

    this.getDevices(dispatch);
  }

  componentWillUnmount() {
    this.signal.cancel('Canceled');
  }

  getDevices = async dispatch => {
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: true });
    dispatch({ type: 'SHOW_RESULTS_TABLE', payload: true });

    try {
      const res = await getDevicesRequest('', { cancelToken: this.signal.token });

      this.onGetDevicesSuccess(dispatch, res);
    } catch (error) {
      if (error && error.message === 'Canceled') return;
      this.onGetDevicesError(dispatch);
    }
  };

  onGetDevicesSuccess = (dispatch, res) => {
    dispatch({ type: 'SET_DEVICES', payload: res.data });
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
    dispatch({ type: 'SHOW_RESULTS_TABLE', payload: true });
  };

  onGetDevicesError = dispatch => {
    message.error('Unfortunately there was an error getting the devices');
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
    dispatch({ type: 'SHOW_RESULTS_TABLE', payload: true });
  };

  render() {
    const hiddenColumns = ['match_type', 'match_value'];

    return <DeviceSearchResults hiddenColumns={hiddenColumns} />;
  }
}

export default DevicesPage;
