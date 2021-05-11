/*
  挂载共享目录组件
*/

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Input, Table, Modal, notification, Tooltip } from 'antd';
import { getMnt } from '../../services/app';
import globalUtil from '../../utils/global';
import pluginUtil from '../../utils/plugin';
import { getVolumeTypeShowName } from '../../utils/utils';

const { Search } = Input;
@connect(null, null, null, { withRef: true })
export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      list: [],
      total: 0,
      current: 1,
      pageSize: 6,
      query: '',
      localpaths: {},
    };
  }
  componentDidMount() {
    this.loadUnMntList();
  }

  handleSearchTeamList = query => {
    this.setState(
      {
        current: 1,
        query,
      },
      () => {
        this.loadUnMntList();
      }
    );
  };

  handleSubmit = () => {
    const { onSubmit } = this.props;
    const { selectedRowKeys } = this.state;
    if (!selectedRowKeys.length) {
      notification.warning({ message: '请选择要挂载的目录' });
      return;
    }

    let res = [];
    res = selectedRowKeys.map(index => {
      const data = this.state.list[index];
      return {
        id: data.dep_vol_id,
        path: this.state.localpaths[data.dep_vol_id],
      };
    });
    res = res.filter(item => !!item.path);

    if (!res.length) {
      notification.warning({ message: '请检查本地存储目录是否填写' });
      return;
    }
    let mag = '';
    const isMountList = res.filter(item => {
      const { path } = item;
      if (path === '') {
        mag = '请输入本地挂载路径';
      }
      const isMountPath = pluginUtil.isMountPath(path);
      if (isMountPath) {
        mag = `${path}路径为系统保留路径，请更换其他路径`;
      }
      return path !== '' && !isMountPath;
    });
    if (mag) {
      notification.warning({ message: mag });
    }
    if (onSubmit && isMountList.length > 0 && !mag) {
      onSubmit(res);
    }
  };

  handleTableChange = (page, pageSize) => {
    this.setState(
      {
        current: page,
        pageSize,
      },
      () => {
        this.loadUnMntList();
      }
    );
  };
  loadUnMntList = () => {
    const { current, pageSize, query } = this.state;

    getMnt({
      query,
      team_name: globalUtil.getCurrTeamName(),
      app_alias: this.props.appAlias,
      page: current,
      page_size: pageSize,
      type: 'unmnt',
      volume_type: this.props.volume_type
        ? this.props.volume_type
        : ['share-file', 'memoryfs', 'local'],
    }).then(data => {
      if (data) {
        this.setState({
          list: data.list || [],
          total: data.total,
        });
      }
    });
  };
  handleCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };
  isDisabled = (data, index) =>
    this.state.selectedRowKeys.indexOf(index) === -1;
  handleChange = (value, data, index) => {
    const local = this.state.localpaths;
    local[data.dep_vol_id] = value;
    this.setState({ localpaths: local });
  };
  render() {
    const rowSelection = {
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys,
        });
      },
    };
    const { total, current, pageSize } = this.state;

    const pagination = {
      onChange: this.handleTableChange,
      total,
      pageSize,
      current,
    };

    return (
      <Modal
        title="挂载共享目录"
        width={1150}
        visible
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <Search
          style={{ width: '350px', marginBottom: '20px' }}
          placeholder="请输入组件名称进行搜索"
          onSearch={this.handleSearchTeamList}
        />

        <Table
          pagination={pagination}
          dataSource={this.state.list}
          rowSelection={rowSelection}
          style={{ width: '100%', overflowX: 'auto' }}
          columns={[
            {
              title: '本地挂载路径',
              dataIndex: 'localpath',
              key: '1',
              width: '20%',
              render: (localpath, data, index) => (
                <Input
                  onChange={e => {
                    this.handleChange(e.target.value, data, index);
                  }}
                  disabled={this.isDisabled(data, index)}
                />
              ),
            },
            {
              title: '目标存储名称',
              dataIndex: 'dep_vol_name',
              key: '2',
              width: '15%',
              render: (data, index) => (
                <Tooltip title={data}>
                  <span
                    style={{
                      wordBreak: 'break-all',
                      wordWrap: 'break-word',
                    }}
                  >
                    {data}
                  </span>
                </Tooltip>
              ),
            },
            {
              title: '目标挂载路径',
              dataIndex: 'dep_vol_path',
              key: '3',
              width: '15%',
              render: (data, index) => (
                <Tooltip title={data}>
                  <span
                    style={{
                      wordBreak: 'break-all',
                      wordWrap: 'break-word',
                    }}
                  >
                    {data}
                  </span>
                </Tooltip>
              ),
            },
            {
              title: '目标存储类型',
              dataIndex: 'dep_vol_type',
              key: '4',
              width: '15%',
              render: (text, record) => {
                return (
                  <Tooltip title={text}>
                    <span
                      style={{
                        wordBreak: 'break-all',
                        wordWrap: 'break-word',
                      }}
                    >
                      {getVolumeTypeShowName(null, text)}
                    </span>
                  </Tooltip>
                );
              },
            },
            {
              title: '目标所属组件',
              dataIndex: 'dep_app_name',
              key: '5',
              width: '15%',
              render: (v, data) => {
                return (
                  <Tooltip title={v}>
                    <Link
                      to={`/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/components/${
                        data.dep_app_alias
                      }/overview`}
                    >
                      <span
                        style={{
                          wordBreak: 'break-all',
                          wordWrap: 'break-word',
                        }}
                      >
                        {v}
                      </span>
                    </Link>
                  </Tooltip>
                );
              },
            },
            {
              title: '目标组件所属应用',
              dataIndex: 'dep_app_group',
              key: '6',
              width: '15%',
              render: (v, data) => {
                return (
                  <Tooltip title={v}>
                    <Link
                      to={`/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/apps/${
                        data.dep_group_id
                      }`}
                    >
                      <span
                        style={{
                          wordBreak: 'break-all',
                          wordWrap: 'break-word',
                        }}
                      >
                        {v}
                      </span>
                    </Link>
                  </Tooltip>
                );
              },
            },
          ]}
        />
      </Modal>
    );
  }
}
