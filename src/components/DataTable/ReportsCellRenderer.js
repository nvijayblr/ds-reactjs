/* eslint-disable react/no-danger */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Icon } from 'antd';

import './CmaItemCellRenderer.scss';

class ReportsCellRenderer extends Component {
  render() {
    const { value } = this.props;
    const cmaItems = [];

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item.name) {
          cmaItems.push(<div key={item.uuid || item.name}>{item.name}</div>);
        } else {
          cmaItems.push(<div key={item}>{item || ''}</div>);
        }
      });
    }

    if (cmaItems.length === 1) {
      return <div>{cmaItems}</div>;
    }

    if (cmaItems.length > 1) {
      return (
        <Popover content={cmaItems}>
          <span className="cma-items-multiple-items">
            <Icon type="bars" />
            <span> Multiple Items</span>
          </span>
        </Popover>
      );
    }

    return `${value}`;
  }
}

ReportsCellRenderer.defaultProps = {
  value: ''
};

ReportsCellRenderer.propTypes = {
  value: PropTypes.any
};

export default ReportsCellRenderer;
