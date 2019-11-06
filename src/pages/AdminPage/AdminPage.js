/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect, Switch, Link } from 'react-router-dom';
import { Layout, Menu, Button, Icon, message } from 'antd';

import { Context } from '../../context';

import Inventory from '../../components/Admin/Inventory/Inventory';
import Countries from '../../components/Admin/Countries/Countries';
import { getCountries, getCredentials, getProfiles, getTransports } from '../../services/api';

import './AdminPage.scss';

const { Content, Sider } = Layout;

class AdminPage extends Component {
  static contextType = Context;

  state = {
    collapsed: false,
    sliderHeight: 0
  };

  sliderWrapperRef = React.createRef();

  componentDidMount() {
    this.loadDropdownData();
    window.addEventListener('resize', this.setSliderHeight);
    this.setSliderHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setSliderHeight);
  }

  setSliderHeight = () => {
    const offsetTop = this.sliderWrapperRef.current.getBoundingClientRect().top;
    const sliderHeight = window.innerHeight - offsetTop;
    this.setState({ sliderHeight });
  };

  onSliderCollapse = () => {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed
    });
  };

  loadDropdownData = () => {
    const { dispatch } = this.context;
    const { location } = this.props;
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: true });

    Promise.all([getCountries(), getCredentials(), getProfiles(), getTransports()])
      .then(response => {
        if (response.length) {
          dispatch({ type: 'SET_COUNTRIES', payload: response[0].data });
          dispatch({ type: 'SET_CREDENTIALS', payload: response[1].data });
          dispatch({ type: 'SET_PROFILES', payload: response[2].data });
          dispatch({ type: 'SET_TRANSPORTS', payload: response[3].data });
        }
        if (location.pathname !== '/admin/inventory') {
          dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
        }
      })
      .catch(error => {
        message.error('Unfortunately there was an error fetching the dropdown data.');
      });
  };

  routes = () => (
    <Switch>
      <Route path="/admin/inventory" component={Inventory} />
      <Route path="/admin/countries" component={Countries} />
      <Redirect to="/admin/inventory" />
    </Switch>
  );

  render() {
    const { match } = this.props;
    const { collapsed, sliderHeight } = this.state;
    const defaultSelectedMenu = [match.params.page];
    return (
      <div className="admin-page" ref={this.sliderWrapperRef}>
        <Layout style={{ height: sliderHeight }}>
          <Sider
            collapsed={collapsed}
            onCollapse={this.onSliderCollapse}
            collapsedWidth={50}
            width={140}
          >
            <Button className="hamburger-button" onClick={this.onSliderCollapse}>
              <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
            </Button>
            <Menu theme="dark" defaultSelectedKeys={defaultSelectedMenu} mode="inline">
              <Menu.Item key="inventory">
                <Icon type="gateway" />
                <span>Inventory</span>
                <Link to="/admin/inventory" />
              </Menu.Item>
              <Menu.Item key="countries">
                <Icon type="global" />
                <span>Countries</span>
                <Link to="/admin/countries" />
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Content style={{ margin: '0 16px' }}>
              <div style={{ padding: 10, background: '#fff' }}>
                <div className="admin-page-container">{this.routes()}</div>
              </div>
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}

AdminPage.defaultProps = {
  location: {}
};

AdminPage.propTypes = {
  location: PropTypes.object
};

export default AdminPage;
