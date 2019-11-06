/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { Select } from 'antd';

const { Option } = Select;

class SelectFloatingFilter extends Component {
  state = {
    selectedValue: 'All'
  };

  applyCustomFilter = filterData => {
    const { api, type } = this.props;

    if (api && filterData && filterData.fieldName) {
      const filterColumn = api.getFilterInstance(filterData.fieldName);
      if (filterColumn) {
        filterColumn.setModel({
          type,
          filter: filterData.value === 'All' ? '' : filterData.value
        });
        api.onFilterChanged();
      }
    }
  };

  onSelectChange = value => {
    this.setState(
      {
        selectedValue: value
      },
      () => {
        const { selectedValue } = this.state;
        const { fieldName } = this.props;
        const filterData = {
          fieldName,
          value: selectedValue
        };
        this.applyCustomFilter(filterData);
      }
    );
  };

  render() {
    const { options } = this.props;
    const { selectedValue } = this.state;

    const selectOptions = options.map(item => (
      <Option title={item} value={item} key={item}>
        {item}
      </Option>
    ));

    return (
      <Select
        showSearch
        style={{ width: '100%' }}
        size="small"
        optionFilterProp="children"
        value={selectedValue}
        onChange={this.onSelectChange}
      >
        {selectOptions}
      </Select>
    );
  }
}

export default SelectFloatingFilter;
