import React, { Component } from 'react';
import { withRouter, matchPath, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu } from 'antd';

class Nav extends Component {
  state = { selectedMenuItem: '' };

  componentDidMount() {
    const { history } = this.props;

    this.setActiveMenuItem();

    this.historyUnlisten = history.listen((location, action) => {
      this.setActiveMenuItem();
    });
  }

  componentWillUnmount() {
    this.historyUnlisten();
  }

  setActiveMenuItem() {
    const match = matchPath(window.location.pathname, {
      path: '/:section',
      strict: false
    });

    if (match) {
      this.setState({ selectedMenuItem: match.params.section });
    }
  }

  render() {
    const { selectedMenuItem } = this.state;
    let roles = [];

    if (localStorage.getItem('roles')) {
      roles = JSON.parse(localStorage.getItem('roles'));
    }

    return (
      <Menu
        selectedKeys={[selectedMenuItem]}
        mode="horizontal"
        theme="dark"
        style={{ lineHeight: '50px', minWidth: '450px' }}
      >
        {roles.includes('search') && (
          <Menu.Item key="search">
            <Link to="/search">Search</Link>
          </Menu.Item>
        )}
        {roles.includes('devices') && (
          <Menu.Item key="devices">
            <Link to="/devices">Devices</Link>
          </Menu.Item>
        )}
        {roles.includes('policies') && (
          <Menu.Item key="policies">
            <Link to="/policies">Policies</Link>
          </Menu.Item>
        )}
        {roles.includes('reports') && (
          <Menu.Item key="reports">
            <Link to="/reports">Reports</Link>
          </Menu.Item>
        )}
        {roles.includes('admin') && (
          <Menu.Item key="admin">
            <Link to="/admin/inventory">Admin</Link>
          </Menu.Item>
        )}
        {roles.includes('auditlogs') && (
          <Menu.Item key="logs">
            <Link to="/logs">Logs</Link>
          </Menu.Item>
        )}
      </Menu>
    );
  }
}

Nav.propTypes = {
  history: PropTypes.object.isRequired
};

export default withRouter(Nav);
