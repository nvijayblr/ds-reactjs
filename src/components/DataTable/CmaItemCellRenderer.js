/* eslint jsx-a11y/anchor-is-valid: [0] */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Icon } from 'antd';

import './CmaItemCellRenderer.scss';

class CmaItemCellRenderer extends Component {
  handleCmaItemClicked = (item, e) => {
    e.preventDefault();

    const { context } = this.props;

    context.componentParent.handleCmaItemClicked(item);
  };

  render() {
    const { value } = this.props;
    const cmaItems = [];

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item.uid) {
          cmaItems.push(
            <div key={item.uid}>
              <a href="" onClick={this.handleCmaItemClicked.bind(this, item)} title={item.name}>
                {item.name}
              </a>
            </div>
          );
        } else {
          cmaItems.push(<div key={item.name}>{item.name}</div>);
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

CmaItemCellRenderer.defaultProps = {
  value: '',
  context: {}
};

CmaItemCellRenderer.propTypes = {
  value: PropTypes.any,
  context: PropTypes.object
};

export default CmaItemCellRenderer;
