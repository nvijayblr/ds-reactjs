/* eslint-disable react/no-array-index-key */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React, { Component, Fragment } from 'react';
import { Row, Col, message, Modal, Form, Input, InputNumber, Select, Checkbox, Button } from 'antd';
import axios from 'axios';

import { Consumer, Context } from '../../../context';
import { getInventories, addEditInventories } from '../../../services/api';
import DataTable from '../../DataTable/DataTable';
import { formatTooltip } from '../../../utils/utils';

const { Option } = Select;
const { TextArea } = Input;

class Inventory extends Component {
  static contextType = Context;

  signal = axios.CancelToken.source();

  defaultColumnDefs = {
    suppressMenu: true,
    tooltip: args => {
      const { value } = args;
      return this.formatTooltip(value);
    }
  };

  state = {
    inventory: {
      country: {},
      profile: {},
      user_credentials: {}
    },
    inventoryList: [],
    nodesList: [
      { uuid: 'CIO', name: 'CIO' },
      { uuid: 'CNO', name: 'CNO' },
      { uuid: 'ECX', name: 'ECX' }
    ],
    tableHeight: 0,
    loading: false,
    showModal: false,
    mode: 'ADD',
    context: { componentParent: this },
    columnDefs: [
      {
        ...this.defaultColumnDefs,
        headerName: 'Hostname',
        field: 'hostname',
        pinned: 'left',
        isEditable: true
      },
      { ...this.defaultColumnDefs, headerName: 'IP', field: 'ip' },
      { ...this.defaultColumnDefs, headerName: 'Node', field: 'node' },
      {
        ...this.defaultColumnDefs,
        headerName: 'Cron Active',
        field: 'cron_active',
        isInventory: true
      },
      {
        ...this.defaultColumnDefs,
        headerName: 'Profile',
        field: 'profile',
        isInventory: true,
        isFormatFilter: true,
        formatFilterKeys: ['type', 'vendor', 'version'],
        comparator: (valueA, valueB) =>
          valueB && valueA ? valueB.type.localeCompare(valueA.type) : ''
      },
      { ...this.defaultColumnDefs, headerName: 'Transport', field: 'transport' },
      { ...this.defaultColumnDefs, headerName: 'Port', field: 'port' },
      { ...this.defaultColumnDefs, headerName: 'Created', field: 'created', isFormatDate: true },
      { ...this.defaultColumnDefs, headerName: 'Updated', field: 'updated', isFormatDate: true },
      {
        ...this.defaultColumnDefs,
        headerName: 'Country',
        field: 'country',
        isInventory: true,
        comparator: (valueA, valueB) =>
          valueB && valueA ? valueB.name.localeCompare(valueA.name) : ''
      },
      { ...this.defaultColumnDefs, headerName: 'UUID', field: 'uuid' },
      {
        ...this.defaultColumnDefs,
        headerName: '',
        field: 'actions',
        suppressFilter: true,
        pinned: 'right',
        width: 55,
        isInventory: true,
        isEmptyShow: true
      }
    ]
  };

  tableWrapperRef = React.createRef();

  formatTooltip = formatTooltip;

  componentDidMount() {
    const { dispatch } = this.context;

    window.addEventListener('resize', this.setTableDimensions);

    // Added the deleay to load the <Sider> in AdminPage.js
    setTimeout(() => {
      this.setTableDimensions();
    }, 200);

    this.loadInventory(dispatch);
  }

  componentWillUnmount() {
    this.signal.cancel('Canceled');
    window.removeEventListener('resize', this.setTableDimensions);
  }

  loadInventory = async dispatch => {
    dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: true });

    try {
      const res = await getInventories({ cancelToken: this.signal.token });

      dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });

      this.setState({
        inventoryList: res.data
      });

      this.setTableDimensions();
    } catch (error) {
      if (error && error.message === 'Canceled') return;
      dispatch({ type: 'SHOW_TABLE_LOADING_OVERLAY', payload: false });
      message.error('Unfortunately there was an error getting the inventory.');
    }
  };

  setTableDimensions = () => {
    const marginBottom = 24;
    const offsetTop = this.tableWrapperRef.current.getBoundingClientRect().top;
    const tableHeight = window.innerHeight - offsetTop - marginBottom;

    this.setState({ tableHeight });
  };

  showAddEditModal = (_mode, _data) => {
    let data = _data;
    this.props.form.resetFields();
    if (_mode === 'ADD') {
      data = {
        country: {},
        profile: {},
        user_credentials: {}
      };
    }
    this.setState({ inventory: data, showModal: true, mode: _mode });
  };

  handleCancelModal = () => {
    this.setState({ showModal: false });
  };

  validateJSON = (rule, value, callback) => {
    try {
      JSON.parse(value);
      callback();
    } catch (e) {
      callback(false);
    }
  };

  addEditInventoryToList = (_inventory, _mode) => {
    const { countryList, profileList, credentialsList } = this.context;
    const country = countryList.filter(_country => _country.uuid === _inventory.country);
    const profile = profileList.filter(_profile => _profile.uuid === _inventory.profile);
    const credential = credentialsList.filter(
      _credential => _credential.uuid === _inventory.user_credentials
    );
    const inventory = {
      ..._inventory,
      country: country[0],
      profile: profile[0],
      user_credentials: credential[0]
    };
    if (_mode === 'ADD') {
      this.setState(prevState => ({
        inventoryList: [inventory, ...prevState.inventoryList]
      }));
      message.info('Inventory created successfully.');
    } else {
      this.setState(prevState => ({
        inventoryList: prevState.inventoryList.map(inv =>
          inv.uuid === _inventory.uuid ? inventory : inv
        )
      }));
      message.info('Inventory updated successfully.');
    }
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true }, () => {
          let inventoryFormData = values;
          const { mode, inventory } = this.state;
          inventoryFormData = {
            ...inventoryFormData,
            user: 1,
            extra: JSON.parse(inventoryFormData.extra),
            uuid: inventory.uuid
          };

          // Save/Update inventory
          addEditInventories(inventoryFormData, mode)
            .then(response => {
              this.addEditInventoryToList(response.data, mode);
              this.setState({ loading: false, showModal: false });
            })
            .catch(error => {
              this.handleHTTPError(error);
            });
        });
      }
    });
  };

  handleHTTPError = error => {
    if (error && error.response && error.response.data && Object.keys(error.response.data).length) {
      message.error(error.response.data[Object.keys(error.response.data)[0]][0]);
    } else {
      message.error('Unfortunately there was an error.');
    }
    this.setState({ loading: false });
  };

  render() {
    const {
      loading,
      showModal,
      mode,
      context,
      columnDefs,
      tableHeight,
      inventoryList,
      inventory,
      nodesList
    } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <Consumer>
        {value => {
          const { countryList, credentialsList, profileList, transportsList } = value;
          return (
            <Fragment>
              <Row gutter={12}>
                <Col span={12}>
                  <h2>Inventory</h2>
                </Col>
                <Col span={12} className="table-actions">
                  <Button
                    type="primary"
                    size="default"
                    icon="plus"
                    onClick={() => {
                      this.showAddEditModal('ADD');
                    }}
                  >
                    Add Inventory
                  </Button>
                </Col>
              </Row>
              <div className="table-actions">
                <Modal
                  visible={showModal}
                  title={mode === 'ADD' ? 'Add Inventory' : 'Edit Inventory'}
                  onCancel={this.handleCancelModal}
                  maskClosable={false}
                  keyboard={false}
                  footer={[
                    <Button key="back" onClick={this.handleCancelModal}>
                      Cancel
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      loading={loading}
                      onClick={this.handleSubmit}
                    >
                      Submit
                    </Button>
                  ]}
                  className="admin-modal"
                >
                  <Form onSubmit={this.handleSubmit}>
                    <Form.Item colon={false} label="Hostname" hasFeedback>
                      {getFieldDecorator('hostname', {
                        validateTrigger: ['onChange', 'onBlur'],
                        initialValue: inventory.hostname,
                        rules: [
                          {
                            required: true,
                            message: 'Please input the Hostname!',
                            whitespace: true
                          }
                        ]
                      })(<Input placeholder="Hostname" maxLength={512} />)}
                    </Form.Item>

                    <Row gutter={12}>
                      <Col span={8}>
                        <Form.Item colon={false} label="IP">
                          {getFieldDecorator('ip', {
                            validateTrigger: ['onChange', 'onBlur'],
                            initialValue: inventory.ip,
                            rules: [{ required: true, message: 'IP is required', whitespace: true }]
                          })(<Input placeholder="0.0.0.0" />)}
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item colon={false} label="Port">
                          {getFieldDecorator('port', {
                            validateTrigger: ['onChange', 'onBlur'],
                            initialValue: inventory.port,
                            rules: [{ required: true, message: 'Port is required' }]
                          })(<InputNumber placeholder="80" min={0} max={65535} />)}
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item colon={false} label="Node">
                          {getFieldDecorator('node', {
                            initialValue: inventory.node,
                            rules: [{ required: true, message: 'Please select the Node!' }]
                          })(
                            <Select placeholder="Select the Node">
                              {nodesList.map(node => (
                                <Option value={node.uuid} key={node.uuid}>
                                  {node.name}
                                </Option>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item colon={false} label="Country">
                          {getFieldDecorator('country', {
                            initialValue: inventory.country ? inventory.country.uuid : '',
                            rules: [{ required: true, message: 'Please select the Country!' }]
                          })(
                            <Select placeholder="Select the Country">
                              {countryList.map(node => (
                                <Option key={node.uuid} value={node.uuid}>
                                  {node.name}
                                </Option>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item colon={false} label="User Credentials">
                          {getFieldDecorator('user_credentials', {
                            initialValue: inventory.user_credentials
                              ? inventory.user_credentials.uuid
                              : '',
                            rules: [
                              { required: true, message: 'Please select the User Credential!' }
                            ]
                          })(
                            <Select placeholder="Select the User Credential">
                              {credentialsList.map(credential => (
                                <Option value={credential.uuid} key={credential.uuid}>
                                  {credential.profile_name}
                                </Option>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item colon={false} label="Profile">
                          {getFieldDecorator('profile', {
                            initialValue: inventory.profile ? inventory.profile.uuid : '',
                            rules: [{ required: true, message: 'Please select the Profile!' }]
                          })(
                            <Select placeholder="Select the Profile">
                              {profileList.map(profile => (
                                <Option value={profile.uuid} key={profile.uuid}>
                                  {`${profile.type}, ${profile.vendor}, ${profile.version}`}
                                </Option>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item colon={false} label="Transport">
                          {getFieldDecorator('transport', {
                            initialValue: inventory.transport,
                            rules: [{ required: true, message: 'Please select the Transport!' }]
                          })(
                            <Select placeholder="Select the Transport">
                              {transportsList.map((transport, index) => (
                                <Option value={transport.value} key={`${transport.value}_${index}`}>
                                  {transport.display_name}
                                </Option>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={5}>
                        <Form.Item colon={false}>
                          {getFieldDecorator('cron_active', {
                            valuePropName: 'checked',
                            initialValue: inventory.cron_active
                          })(<Checkbox>Cron active</Checkbox>)}
                        </Form.Item>
                      </Col>
                      <Col span={19}>
                        <Form.Item colon={false}>
                          {getFieldDecorator('record_session_log', {
                            valuePropName: 'checked',
                            initialValue: inventory.record_session_log
                          })(<Checkbox>Record session log</Checkbox>)}
                        </Form.Item>
                        <span className="ant-control-hint session-log">
                          Record ALL communication to this device. Only works on Netmiko-based
                          transports.
                        </span>
                      </Col>
                    </Row>

                    <Form.Item colon={false} label="Extra">
                      {getFieldDecorator('extra', {
                        validateTrigger: ['onChange', 'onBlur'],
                        initialValue: inventory.extra
                          ? JSON.stringify(inventory.extra)
                          : '{"comments": ""}',
                        rules: [
                          { required: true, message: 'Please input the extra!' },
                          { validator: this.validateJSON }
                        ]
                      })(
                        <TextArea
                          placeholder='{"comments": ""}'
                          autosize={{ minRows: 2, maxRows: 6 }}
                        />
                      )}
                    </Form.Item>
                    <span className="ant-control-hint">
                      Used to store comments, transport settings or miscellanous details for the
                      device.
                    </span>
                  </Form>
                </Modal>
              </div>
              <div ref={this.tableWrapperRef}>
                <DataTable
                  columnDefs={columnDefs}
                  rowData={inventoryList}
                  tableHeight={tableHeight}
                  suppressRowHoverHighlight
                  suppressRowClickSelection
                  useColumnDefOptions={false}
                  context={context}
                />
              </div>
            </Fragment>
          );
        }}
      </Consumer>
    );
  }
}
const WrappedInventory = Form.create({ name: 'inventory' })(Inventory);

export default WrappedInventory;
