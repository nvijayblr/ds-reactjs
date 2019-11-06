/* eslint jsx-a11y/anchor-is-valid: [0] */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Badge, message } from 'antd';
import moment from 'moment';
import { getDevicesPassword } from '../../services/api';

class CellRenderer extends Component {
  state = {
    isLoading: false,
    passwordString: '********',
    password: ''
  };

  formatArray = arr => {
    let html = '';

    arr.forEach((item, index) => {
      if (typeof item === 'object') {
        if (!item) {
          html += '';
          return;
        }

        if (Array.isArray(item)) {
          html = this.formatArray(item);
        } else {
          html = this.formatObject(item);
        }
      } else {
        html += `<span>${item}</span>`;
      }

      if (index < arr.length - 1) {
        html += `, `;
      }
    });

    return html;
  };

  formatObject = obj => {
    let html = '';

    Object.keys(obj).forEach(key => {
      html += `<span><strong>${key}</strong>: ${obj[key] || 'null'}</span> `;
    });

    return html;
  };

  onHostnameClick = (data, e) => {
    e.preventDefault();

    const { context } = this.props;

    context.componentParent.handleHostnameClicked(data);
  };

  onHostnameEditClick = (e, data) => {
    e.preventDefault();
    const { context } = this.props;

    context.componentParent.showAddEditModal('EDIT', data);
  };

  showHidePassword = async (rowData, hidePassword) => {
    const { passwordString } = this.state;

    if (hidePassword) {
      this.setState({ password: passwordString });
      return;
    }

    this.setState({ isLoading: true });

    try {
      const { context } = this.props;
      const deviceName = context.componentParent.props.metadata.name;
      const res = await getDevicesPassword(deviceName);
      this.setState({ isLoading: false, password: res.data.password });
    } catch {
      message.error('Unfortunately there was an error getting the password');
      this.setState({ isLoading: false });
    }
  };

  formatValue = value => {
    let html = '';

    if (!value) {
      return html;
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        html = this.formatArray(value);
      } else {
        html = this.formatObject(value);
      }

      return html;
    }

    return value;
  };

  componentDidMount = () => {
    const { colDef, data } = this.props;
    if (colDef.field === 'Password_TS') {
      this.setState({ password: data.Password_TS });
    }
  };

  render() {
    const { value, colDef, data } = this.props;
    const { isLoading } = this.state;

    if (isLoading) {
      return (
        <div className="spin-wrapper">
          <Icon type="loading" />
        </div>
      );
    }

    if (colDef.field === 'hostname') {
      if (colDef.isEditable) {
        return <div className="edit-wrapper">{value}</div>;
      }
      return (
        <a href="#" onClick={this.onHostnameClick.bind(this, data)}>
          {value}
        </a>
      );
    }

    if (colDef.field === 'actions' && colDef.isInventory) {
      return (
        <div className="edit-wrapper center">
          <Button
            key="back"
            title="Edit"
            size="small"
            onClick={e => this.onHostnameEditClick(e, data)}
          >
            <Icon type="edit" />
          </Button>
        </div>
      );
    }

    if (colDef.field === 'Password_TS') {
      const { passwordString, password } = this.state;

      return (
        <div className="sh-password">
          {password === passwordString && (
            <Icon type="eye-invisible" onClick={() => this.showHidePassword(data, false)} />
          )}
          {password !== passwordString && (
            <Icon type="eye" onClick={() => this.showHidePassword(data, true)} />
          )}
          <span>{password}</span>
        </div>
      );
    }

    if (colDef.field === 'status' && colDef.displayIcon) {
      return (
        <div>
          {value && typeof value === 'object' && (
            <Badge
              className="device-status-badge"
              status={value.status ? 'success' : 'error'}
              text={value.message}
            />
          )}
          {typeof value !== 'object' && <span>{value}</span>}
        </div>
      );
    }

    if (colDef.field === 'cron_active' && colDef.isInventory) {
      if (value) {
        return <Icon type="check-circle" theme="filled" style={{ color: '#52c41a' }} />;
      }
      return <Icon type="close-circle" theme="filled" style={{ color: '#f5222d' }} />;
    }

    if (colDef.field === 'profile' && colDef.isInventory) {
      if (value) {
        return `${value.type}, ${value.vendor}, ${value.version}`;
      }
      return '';
    }

    if (colDef.field === 'country' && colDef.isInventory) {
      if (value) {
        return `${value.name}`;
      }
      return '';
    }

    if (colDef.isFormatDate) {
      if (value) {
        return moment(value)
          .utc()
          .format('MMM. DD, YYYY, hh:mm A');
      }
      return '';
    }

    const cellHtml = { __html: this.formatValue(value) };

    // eslint-disable-next-line react/no-danger
    return <div dangerouslySetInnerHTML={cellHtml} />;
  }
}

CellRenderer.defaultProps = {
  value: '',
  context: {}
};

CellRenderer.propTypes = {
  value: PropTypes.any,
  colDef: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  context: PropTypes.object
};

export default CellRenderer;
