import React, { Component } from 'react';
import { Input, Icon, message } from 'antd';
import { debounce } from 'lodash';
import classNames from 'classnames';
import axios from 'axios';

import { Consumer, Context } from '../../context';
import { getDevicesRequest } from '../../services/api';
import './DeviceSearchInput.scss';

class DeviceSearchInput extends Component {
  static contextType = Context;

  signal = axios.CancelToken.source();

  state = {
    searchValue: '',
    initialDeviceSearchDone: false
  };

  debouncedOnChange = debounce(dispatch => {
    const { initialDeviceSearchDone } = this.state;

    if (!initialDeviceSearchDone) {
      this.animateSearch(dispatch);
      return;
    }

    this.getDevices(dispatch);
  }, 1000);

  componentWillMount() {
    const { dispatch } = this.context;
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
    dispatch({ type: 'SHOW_RESULTS_TABLE', payload: false });
  }

  componentWillUnmount() {
    this.signal.cancel('Canceled');
  }

  animateSearch = dispatch => {
    this.setState({ initialDeviceSearchDone: true });
    this.getDevices(dispatch);

    setTimeout(() => {
      dispatch({ type: 'SHOW_RESULTS_TABLE', payload: true });
    }, 500);
  };

  onChange = (dispatch, e) => {
    const { value } = e.target;

    this.setState({ searchValue: value }, () => {
      this.debouncedOnChange(dispatch);
    });
  };

  getDevices = async dispatch => {
    const { searchValue } = this.state;

    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: true });

    if (!searchValue) {
      dispatch({ type: 'SET_DEVICES', payload: [] });
      dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
      return;
    }

    // Avoid potential race conditions, see https://medium.com/@slavik57/async-race-conditions-in-javascript-526f6ed80665
    const currentSession = {};
    this.lastSession = currentSession;

    try {
      const res = await getDevicesRequest(searchValue, { cancelToken: this.signal.token });

      if (this.lastSession !== currentSession) return;

      this.onGetDevicesSuccess(dispatch, res);
    } catch (error) {
      if (this.lastSession !== currentSession) return;

      if (error && error.message === 'Canceled') return;

      this.onGetDevicesError(dispatch);
    }
  };

  onGetDevicesSuccess = (dispatch, res) => {
    dispatch({ type: 'SET_DEVICES', payload: [] });
    dispatch({ type: 'SET_DEVICES', payload: res.data });
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
  };

  onGetDevicesError = dispatch => {
    message.error('Unfortunately there was an error getting the devices');
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
  };

  emitEmpty = dispatch => {
    this.searchInput.focus();
    this.setState({ searchValue: '' });
    dispatch({ type: 'SET_DEVICES', payload: [] });
  };

  render() {
    const { searchValue } = this.state;

    return (
      <Consumer>
        {value => {
          const { dispatch } = value;
          const { initialDeviceSearchDone } = this.state;
          const suffix = searchValue ? (
            <Icon type="close-circle" onClick={() => this.emitEmpty(dispatch)} />
          ) : null;
          const inputWrapperClasses = classNames('search-input-wrapper', {
            'initial-device-search-done': initialDeviceSearchDone
          });

          return (
            <div className={inputWrapperClasses}>
              <Input
                className="search-input"
                placeholder="Search Devices..."
                prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
                suffix={suffix}
                size="large"
                value={searchValue}
                onChange={e => this.onChange(dispatch, e)}
                ref={node => {
                  this.searchInput = node;
                }}
                autoFocus
              />
            </div>
          );
        }}
      </Consumer>
    );
  }
}

export default DeviceSearchInput;
