/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Form, Icon, Input, Button, message } from 'antd';

import './LoginForm.scss';
import { loginRequest, getRolesRequest } from '../../services/api';

const FormItem = Form.Item;

class LoginForm extends React.Component {
  state = {
    isLoggingIn: false,
    isShowPassword: false
  };

  usernameInput = React.createRef();

  passwordInput = React.createRef();

  handleSubmit = e => {
    const { form } = this.props;

    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        this.login(values);
        this.setState({
          isLoggingIn: true
        });
      }
    });
  };

  login = values => {
    loginRequest(values)
      .then(response => this.handleLoginSuccess(response))
      .catch(error => this.handleLoginError(error.response));
  };

  handleLoginSuccess = response => {
    localStorage.setItem('auth', JSON.stringify(response.data));
    this.getRoles();
  };

  handleLoginError = error => {
    const { form } = this.props;

    if (error && error.data && error.data.error) {
      message.error(error.data.error);
      this.usernameInput.current.focus();
    } else {
      message.error('Unfortunately there was an error, please try again');
      form.resetFields();
    }
    this.setState({
      isLoggingIn: false
    });
  };

  getRoles = () => {
    getRolesRequest()
      .then(response => this.handleGetRolesSuccess(response))
      .catch(error => this.handleGetRolesError());
  };

  handleGetRolesSuccess = response => {
    const { history } = this.props;

    localStorage.setItem('roles', JSON.stringify(response.data));

    this.setState({
      isLoggingIn: false
    });

    history.push('/search');
  };

  handleGetRolesError = () => {
    message.error('Unfortunately there was an error, please try again');

    this.setState({
      isLoggingIn: false
    });
  };

  showHidePassword = () => {
    const { isShowPassword } = this.state;
    this.setState({ isShowPassword: !isShowPassword });
    this.passwordInput.current.focus();
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { isLoggingIn, isShowPassword } = this.state;

    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please enter your username!' }]
          })(
            <Input
              ref={this.usernameInput}
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
              autoFocus
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please enter your password!' }]
          })(
            <Input
              ref={this.passwordInput}
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              suffix={
                <Icon
                  type={isShowPassword ? 'eye' : 'eye-invisible'}
                  title={isShowPassword ? 'Hide Password' : 'Show Password'}
                  className="sh-password"
                  onClick={this.showHidePassword}
                />
              }
              type={isShowPassword ? 'text' : 'password'}
              placeholder="Password"
            />
          )}
        </FormItem>
        <FormItem>
          {isLoggingIn && (
            <Button type="primary" htmlType="submit" className="login-form-button" disabled>
              <Icon type="sync" className="login-spinner-icon" spin />
            </Button>
          )}
          {!isLoggingIn && (
            <Button type="primary" htmlType="submit" className="login-form-button">
              Login
            </Button>
          )}
        </FormItem>
      </Form>
    );
  }
}

LoginForm.propTypes = {
  form: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withRouter(Form.create()(LoginForm));
