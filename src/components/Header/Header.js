import React from 'react';
import { Layout } from 'antd';

import Nav from './Nav';
import UserMenu from '../UserMenu/UserMenu';
import './Header.scss';

const { Header } = Layout;

function GlobalHeader() {
  return (
    <Header className="global-header">
      <a className="brand" href="/">
        <div className="logo" />
        <span className="name">DDS</span>
      </a>
      <Nav />
      <UserMenu />
    </Header>
  );
}

export default GlobalHeader;
