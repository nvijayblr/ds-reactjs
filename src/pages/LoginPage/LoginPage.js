import React from 'react';
import LoginForm from '../../components/LoginForm/LoginForm';

import './LoginPage.scss';

function LoginPage() {
  return (
    <div className="login-page">
      <div className="brand" href="/">
        <div className="logo" />
        <span className="name">DDS</span>
      </div>
      <LoginForm />
    </div>
  );
}

export default LoginPage;
