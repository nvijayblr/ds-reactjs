import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter, Redirect, Switch } from 'react-router-dom';
import { Layout, message } from 'antd';
import classNames from 'classnames';

import GlobalHeader from '../../components/Header/Header';
import DeviceSearchPage from '../../pages/DeviceSearchPage/DeviceSearchPage';
import LogsPage from '../../pages/LogsPage/LogsPage';
import DevicesPage from '../../pages/DevicesPage/DevicesPage';
import ReportsPage from '../../pages/ReportsPage/ReportsPage';
import PoliciesPage from '../../pages/PoliciesPage/PoliciesPage';
import AdminPage from '../../pages/AdminPage/AdminPage';

import './PrimaryLayout.scss';

const { Content } = Layout;

class App extends Component {
  routes = () => {
    let roles = [];

    if (localStorage.getItem('roles')) {
      roles = JSON.parse(localStorage.getItem('roles'));
    }

    if (!roles.length) {
      message.warning('You have no user roles assigned.');
    }

    return (
      <Switch>
        {roles.includes('search') && <Route path="/search" component={DeviceSearchPage} />}
        {roles.includes('devices') && <Route path="/devices" component={DevicesPage} />}
        {roles.includes('policies') && <Route path="/policies" component={PoliciesPage} />}
        {roles.includes('auditlogs') && <Route path="/logs" component={LogsPage} />}
        {roles.includes('reports') && <Route path="/reports" component={ReportsPage} />}
        {roles.includes('admin') && <Route path="/admin/:page" component={AdminPage} />}
        {roles.includes('search') && <Redirect to="/search" />}
        {roles.includes('devices') && !roles.includes('search') && <Redirect to="/devices" />}
        {roles.includes('auditlogs') && !roles.includes('search') && !roles.includes('devices') && (
          <Redirect to="/logs" />
        )}
      </Switch>
    );
  };

  render() {
    const { location } = this.props;
    const globalContentClasses = classNames('global-content', {
      'global-content-search': location.pathname === '/search',
      'global-content-devices': location.pathname === '/devices',
      'global-content-policies': location.pathname === '/policies',
      'global-content-admin': location.pathname.indexOf('/admin/') === 0
    });

    return (
      <Layout className="global-layout">
        <GlobalHeader />
        <Content className={globalContentClasses}>
          <Switch>
            {this.routes()}
            <Redirect to="/search" />
          </Switch>
        </Content>
      </Layout>
    );
  }
}

App.propTypes = {
  location: PropTypes.object.isRequired
};

export default withRouter(App);
