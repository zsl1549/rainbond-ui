/* eslint-disable no-nested-ternary */
/* eslint-disable prettier/prettier */
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Icon,
  Menu,
  notification,
  Popconfirm,
  Table,
  Tooltip
} from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import React, { Component, Fragment } from 'react';
import MoveGroup from '../../components/AppMoveGroup';
import BatchDelete from '../../components/BatchDelete';
import ScrollerX from '../../components/ScrollerX';
import { batchOperation } from '../../services/app';
import appUtil from '../../utils/app';
import globalUtil from '../../utils/global';
import styles from './ComponentList.less';

@connect(
  ({ global, loading }) => ({
    groups: global.groups,
    batchMoveLoading: loading.effects['appControl/putBatchMove'],
    reStartLoading: loading.effects['appControl/putReStart'],
    startLoading: loading.effects['appControl/putStart'],
    stopLoading: loading.effects['appControl/putStop']
  }),
  null,
  null,
  {
    pure: false
  }
)
export default class ComponentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      apps: [],
      current: 1,
      total: 0,
      pageSize: 10,
      moveGroupShow: false,
      batchDeleteApps: [],
      batchDeleteShow: false,
      operationState: false
    };
  }
  componentDidMount() {
    this.updateApp();
    document
      .querySelector('.ant-table-footer')
      .setAttribute('style', 'position:absolute;background:#fff');
  }
  shouldComponentUpdate() {
    return true;
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    this.props.dispatch({
      type: 'application/clearApps'
    });
  }
  onSelectChange = selectedRowKeys => {
    this.setState({
      selectedRowKeys
    });
  };
  getSelectedKeys() {
    const selected = this.getSelected();
    return selected.map(item => item.service_id);
  }

  getSelected() {
    const key = this.state.selectedRowKeys;
    const res = key.map(item => this.state.apps[item]);
    return res;
  }
  updateApp = () => {
    this.loadComponents();
    const { clearTime } = this.props;
    this.timer = setInterval(() => {
      if (!clearTime) {
        this.loadComponents();
      }
    }, 5000);
  };
  loadComponents = () => {
    const { dispatch, groupId } = this.props;
    const { current, pageSize } = this.state;
    dispatch({
      type: 'application/fetchApps',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        region_name: globalUtil.getCurrRegionName(),
        group_id: groupId,
        page: current,
        page_size: pageSize
      },
      callback: data => {
        if (data && data.status_code === 200) {
          this.setState({
            apps: data.list || [],
            total: data.total || 0
          });
        }
      }
    });
  };

  deleteData = () => {
    const { dispatch, groupId } = this.props;
    const { current, pageSize } = this.state;
    dispatch({
      type: 'application/fetchApps',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        region_name: globalUtil.getCurrRegionName(),
        group_id: groupId,
        page: current,
        page_size: pageSize
      },
      callback: data => {
        if (data && data.status_code === 200) {
          this.setState(
            {
              apps: data.list || [],
              total: data.total || 0
            },
            () => {
              this.handleBatchDeletes();
              this.hideMoveGroup();
            }
          );
        }
      }
    });
  };
  handleOperation = (state, data) => {
    const { dispatch } = this.props;
    const operationMap = {
      putReStart: '操作成功，重启中',
      putStart: '操作成功，启动中',
      putStop: '操作成功，关闭中'
    };
    dispatch({
      type: `appControl/${state}`,
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        app_alias: data.service_alias
      },
      callback: res => {
        if (res) {
          notification.success({
            message: operationMap[state]
          });
        }
      }
    });
  };

  handleOperationState = operationState => {
    this.setState({ operationState });
  };
  handleBatchOperation = action => {
    const ids = this.getSelectedKeys();
    const map = {
      stop: '批量关闭中',
      start: '批量启动中',
      restart: '批量重启中',
      upgrade: '批量更新中',
      deploy: '批量构建中'
    };
    batchOperation({
      action,
      team_name: globalUtil.getCurrTeamName(),
      serviceIds: ids && ids.join(',')
    }).then(data => {
      this.handleOperationState(false);
      if (data && map[action]) {
        notification.success({
          message: map[action]
        });
      }
    });
  };

  handleBatchDelete = () => {
    const apps = this.getSelected();
    this.setState({ batchDeleteApps: apps, batchDeleteShow: true });
  };
  hideBatchDelete = () => {
    // update menus data
    this.deleteData();
    this.updateGroupMenu();
  };
  handleBatchDeletes = () => {
    this.setState({
      batchDeleteApps: [],
      batchDeleteShow: false,
      selectedRowKeys: []
    });
  };
  updateGroupMenu = () => {
    this.props.dispatch({
      type: 'global/fetchGroups',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        region_name: globalUtil.getCurrRegionName()
      }
    });
  };
  handleBatchMove = groupID => {
    const ids = this.getSelectedKeys();
    const { dispatch } = this.props;
    dispatch({
      type: 'appControl/putBatchMove',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        serviceIds: ids.join(','),
        move_group_id: groupID
      },
      callback: data => {
        if (data) {
          notification.success({
            message: '批量移动中'
          });
          this.hideBatchDelete();
        }
      }
    });
  };
  hideMoveGroup = () => {
    this.setState({ moveGroupShow: false });
  };
  showBatchMove = () => {
    this.setState({ moveGroupShow: true });
  };
  // 是否可以批量操作
  CanBatchOperation = () => {
    const arr = this.getSelected();
    return arr && arr.length > 0;
  };

  render() {
    const {
      componentPermissions: {
        isStart,
        isRestart,
        isStop,
        isDelete,
        isEdit,
        isUpdate,
        isConstruct
      },
      batchMoveLoading,
      reStartLoading,
      startLoading,
      stopLoading,
      groupId,
      groups
    } = this.props;
    const {
      selectedRowKeys,
      current,
      total,
      apps,
      pageSize,
      batchDeleteShow,
      batchDeleteApps,
      moveGroupShow,
      operationState
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };
    const pagination = {
      pageSize,
      current,
      total,
      showSizeChanger: true,
      onChange: page => {
        this.setState(
          {
            current: page,
            selectedRowKeys: []
          },
          () => {
            this.loadComponents();
          }
        );
      },
      // eslint-disable-next-line no-shadow
      onShowSizeChange: (page, pageSize) => {
        this.setState(
          {
            current: page,
            pageSize
          },
          () => {
            this.loadComponents();
          }
        );
      }
    };
    const columns = [
      {
        title: '组件名称',
        dataIndex: 'service_cname',
        render: (val, data) => (
          <Link
            to={`/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/components/${
              data.service_alias
            }/overview`}
          >
            {' '}
            {data.service_source && data.service_source === 'third_party' ? (
              <span>
                <Tooltip title="第三方组件">
                  <span
                    style={{
                      borderRadius: '50%',
                      height: '20px',
                      width: '20px',
                      display: 'inline-block',
                      background: '#1890ff',
                      verticalAlign: 'top',
                      marginRight: '3px'
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        color: '#FFFFFF',
                        height: '20px',
                        lineHeight: '20px',
                        textAlign: 'center'
                      }}
                    >
                      3
                    </span>
                  </span>
                  {val}
                </Tooltip>
              </span>
            ) : (
              <span>{val}</span>
            )}{' '}
          </Link>
        )
      },
      {
        title: '内存',
        dataIndex: 'min_memory',
        render: (val, data) => (
          <span>
            {data.service_source && data.service_source === 'third_party'
              ? '-'
              : `${val}MB`}
          </span>
        )
      },
      {
        title: '状态',
        dataIndex: 'status_cn',
        render: (val, data) =>
          data.service_source && data.service_source === 'third_party' ? (
            <Badge
              status={appUtil.appStatusToBadgeStatus(data.status)}
              text={
                val === '运行中'
                  ? '健康'
                  : val === '运行异常'
                  ? '不健康'
                  : val === '已关闭'
                  ? '下线'
                  : val
              }
            />
          ) : (
            <Badge
              status={appUtil.appStatusToBadgeStatus(data.status)}
              text={val}
            />
          )
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        render: val =>
          moment(val)
            .locale('zh-cn')
            .format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (val, data) => (
          <Fragment>
            {data.service_source && data.service_source !== 'third_party' && (
              <Fragment>
                {isRestart && (
                  <Popconfirm
                    title="确认要重启该组件吗？"
                    onConfirm={() => {
                      this.handleOperation('putReStart', data);
                    }}
                  >
                    <Button type="link">重启</Button>
                  </Popconfirm>
                )}
                {isStart && (
                  <Popconfirm
                    title="确认要启动该组件吗？"
                    onConfirm={() => {
                      this.handleOperation('putStart', data);
                    }}
                  >
                    <Button type="link">启动</Button>
                  </Popconfirm>
                )}
                {isStop && (
                  <Popconfirm
                    title="确认要关闭该组件吗？"
                    onConfirm={() => {
                      this.handleOperation('putStop', data);
                    }}
                  >
                    <Button type="link">关闭</Button>
                  </Popconfirm>
                )}
              </Fragment>
            )}
          </Fragment>
        )
      }
    ];
    const customBox = [
      {
        permissions: isConstruct,
        name: '构建',
        action: 'deploy'
      },
      {
        permissions: isUpdate,
        name: '更新',
        action: 'upgrade'
      },
      {
        permissions: isRestart,
        name: '重启',
        action: 'restart'
      },
      {
        permissions: isStop,
        name: '关闭',
        action: 'stop'
      },
      {
        permissions: isStart,
        name: '启动',
        action: 'start'
      },
      {
        permissions: isEdit,
        name: '移动',
        action: false,
        customMethods: this.showBatchMove
      },
      {
        permissions: isDelete,
        name: '删除',
        action: false,
        customMethods: this.handleBatchDelete
      }
    ];
    const menu = (
      <Menu>
        {customBox.map(item => {
          const { permissions, name, action, customMethods } = item;
          return (
            permissions && (
              <Menu.Item style={{ textAlign: 'center' }}>
                <a
                  loading={operationState === action ? operationState : false}
                  onClick={() => {
                    if (action) {
                      this.handleOperationState(action);
                      this.handleBatchOperation(action);
                    } else {
                      customMethods();
                    }
                  }}
                >
                  {name}
                </a>
              </Menu.Item>
            )
          );
        })}
      </Menu>
    );
    const footer = (
      <div className={styles.tableList}>
        <div className={styles.tableListOperator}>
          <Dropdown
            overlay={menu}
            trigger={['click']}
            placement="topCenter"
            disabled={!this.CanBatchOperation()}
          >
            <Button>
              批量操作 <Icon type="down" />
            </Button>
          </Dropdown>
        </div>
      </div>
    );
    return (
      <div>
        <Card
          style={{
            minHeight: 400
          }}
          bordered={false}
          bodyStyle={{ padding: '10px 10px' }}
        >
          <ScrollerX sm={750}>
            <Table
              style={{ position: 'relative' }}
              pagination={pagination}
              rowSelection={rowSelection}
              columns={columns}
              loading={reStartLoading || startLoading || stopLoading}
              dataSource={apps || []}
              footer={() => footer}
            />
          </ScrollerX>
          {batchDeleteShow && (
            <BatchDelete
              batchDeleteApps={batchDeleteApps}
              onCancel={this.hideBatchDelete}
              onOk={this.hideBatchDelete}
            />
          )}
          {moveGroupShow && (
            <MoveGroup
              loading={batchMoveLoading}
              currGroupID={groupId}
              groups={groups}
              onOk={this.handleBatchMove}
              onCancel={this.hideMoveGroup}
            />
          )}
        </Card>
      </div>
    );
  }
}
