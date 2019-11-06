import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import './UnauthorizedLayout.scss';

import LoginPage from '../../pages/LoginPage/LoginPage';

const UnauthorizedLayout = () => (
  <div className="unauthorized-layout">
    {/*
    Imagine this could be a general layout for all unauthorized pages like
    the login page, forgot password, email-verified, etc...
    */}
    <Switch>
      <Route path="/public/login" component={LoginPage} />
      <Redirect to="/public/login" />
    </Switch>
  </div>
);

export default UnauthorizedLayout;
