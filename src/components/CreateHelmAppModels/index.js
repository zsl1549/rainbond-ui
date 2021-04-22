import { Button, Form, Input, Modal, Select } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { PureComponent } from 'react';
import cookie from '../../utils/cookie';
import styles from '../CreateTeam/index.less';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create()
@connect(({ user, global, teamControl }) => ({
  user: user.currentUser,
  rainbondInfo: global.rainbondInfo,
  currentTeam: teamControl.currentTeam
}))
class CreateHelmAppModels extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userTeamList: [],
      regionList: [],
      appName: '',
      helmInstallLoading: false
    };
  }
  componentDidMount() {
    this.fetchCreateAppTeams();
  }

  fetchCreateAppTeams = name => {
    const { dispatch, eid, form } = this.props;
    const { setFieldsValue } = form;
    dispatch({
      type: 'global/fetchCreateAppTeams',
      payload: {
        name,
        enterprise_id: eid
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState(
            {
              userTeamList: res.list || []
            },
            () => {
              if (res.list && res.list.length > 0) {
                const info = res.list[0];

                setFieldsValue({
                  team_name: info.team_name
                });
                if (info.region_list && info.region_list.length > 0) {
                  this.handleCheckAppName(
                    true,
                    info.team_name,
                    info.region_list[0].region_alias
                  );
                }
                this.handleTeamChange(res.list[0].team_name);
              }
            }
          );
        }
      }
    });
  };

  handleCheckAppName = (initial, tenantName, regionNam, name, callbacks) => {
    const { dispatch, appInfo } = this.props;
    const appName = (initial && appInfo && appInfo.name) || name;
    dispatch({
      type: 'application/checkAppName',
      payload: {
        app_name: appName,
        regionNam,
        tenantName
      },
      callback: res => {
        let validatorValue = '';
        if (res && res.status_code === 200) {
          if (initial) {
            this.setState({
              appName: (res.list && res.list.app_name) || ''
            });
          } else if (callbacks) {
            validatorValue =
              name === (res.list && res.list.app_name) ? '' : '应用名称已存在';
            if (validatorValue) {
              callbacks(validatorValue);
            } else {
              callbacks();
            }
          }
        }
      },
      handleError: () => {
        if (callbacks) {
          callbacks();
        }
      }
    });
  };
  handleSubmit = e => {
    e.preventDefault();
    const { form, helmInfo, appInfo } = this.props;
    form.validateFields((err, fieldsValue) => {
      const info = Object.assign({}, fieldsValue, {
        app_template_name: (appInfo && appInfo.name) || '',
        app_store_name: helmInfo && helmInfo.name,
        app_store_url: helmInfo && helmInfo.url
      });
      if (!err) {
        this.setState({ helmInstallLoading: true });
        this.handleCreateHelm(info);
      }
    });
  };
  handleCreateHelm = vals => {
    const { dispatch, onCancel } = this.props;
    dispatch({
      type: 'createApp/installHelmApp',
      payload: {
        ...vals,
        is_deploy: true
      },
      callback: res => {
        if (res.bean.ID && onCancel) {
          onCancel();
          dispatch(
            routerRedux.push(
              `/team/${vals.team_name}/region/${vals.region}/apps/${res.bean.ID}`
            )
          );
        }
        this.setState({ helmInstallLoading: false });
      }
    });
  };
  handleTeamChange = value => {
    const { form } = this.props;
    const { setFieldsValue } = form;
    const { userTeamList } = this.state;
    let regionList = [];
    userTeamList.map(item => {
      if (item.team_name === value) {
        regionList = item.region_list;
      }
    });
    if (regionList && regionList.length > 0) {
      this.setState({ regionList }, () => {
        setFieldsValue({
          region: regionList[0].region_name
        });
        const { getFieldValue } = this.props.form;
        this.handleCheckAppName(
          false,
          value,
          getFieldValue('app_name'),
          regionList[0].region_name
        );
      });
    }
  };
  render() {
    const { onCancel, title, appInfo, form } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const {
      regionList,
      userTeamList,
      appName,
      helmInstallLoading
    } = this.state;
    const userTeams = userTeamList && userTeamList.length > 0 && userTeamList;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 }
      }
    };

    const token = cookie.get('token');
    const myheaders = {};
    if (token) {
      myheaders.Authorization = `GRJWT ${token}`;
    }
    const teaName = getFieldValue('team_name');
    const regionName = getFieldValue('region');
    return (
      <div>
        <Modal
          title={title}
          visible
          width={500}
          className={styles.TelescopicModal}
          onOk={this.handleSubmit}
          onCancel={onCancel}
          footer={[
            <Button onClick={onCancel}> 取消 </Button>,
            <Button
              type="primary"
              onClick={this.handleSubmit}
              loading={helmInstallLoading}
            >
              确定
            </Button>
          ]}
        >
          <Form onSubmit={this.handleSubmit} layout="horizontal">
            <FormItem {...formItemLayout} label="团队名称">
              {getFieldDecorator('team_name', {
                rules: [
                  {
                    required: true,
                    message: '请选择团队'
                  }
                ]
              })(
                <Select
                  style={{ width: '284px' }}
                  onChange={this.handleTeamChange}
                  placeholder="请选择团队"
                >
                  {userTeams &&
                    userTeams.map(item => (
                      <Option key={item.team_name} value={item.team_name}>
                        {item.team_alias}
                      </Option>
                    ))}
                </Select>
              )}
              <div className={styles.conformDesc}>请选择团队</div>
            </FormItem>
            <FormItem {...formItemLayout} label="集群名称">
              {getFieldDecorator('region', {
                rules: [
                  {
                    required: true,
                    message: '请选择集群'
                  }
                ]
              })(
                <Select placeholder="请选择集群" style={{ width: '284px' }}>
                  {regionList.map(item => (
                    <Option key={item.region_name} value={item.region_name}>
                      {item.region_alias}
                    </Option>
                  ))}
                </Select>
              )}
              <div className={styles.conformDesc}>请选择集群</div>
            </FormItem>
            <FormItem {...formItemLayout} label="应用名称">
              {getFieldDecorator('app_name', {
                initialValue: appName,
                validateTrigger: 'onBlur',
                rules: [
                  {
                    required: true,
                    message: '请输入应用名称'
                  },
                  {
                    min: 4,
                    message: '应用名称最小长度4位'
                  },
                  {
                    max: 53,
                    message: '应用名称最大长度53位'
                  },
                  {
                    pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
                    message: '只支持字母和数字开头结尾'
                  },
                  {
                    validator: (_, value, callback) => {
                      this.handleCheckAppName(
                        false,
                        teaName,
                        regionName,
                        value,
                        callback
                      );
                    }
                  }
                ]
              })(<Input style={{ width: '284px' }} placeholder="请输入名称" />)}
              <div className={styles.conformDesc}>
                请输入创建的应用模版名称，最多53字.
              </div>
            </FormItem>
            <FormItem {...formItemLayout} label="应用版本">
              {getFieldDecorator('version', {
                initialValue: appInfo.versions
                  ? appInfo.versions[0].version
                  : '',
                rules: [
                  {
                    required: true,
                    message: '请选择版本'
                  }
                ]
              })(
                <Select style={{ width: '284px' }}>
                  {appInfo.versions &&
                    appInfo.versions.map((item, indexs) => {
                      return (
                        <Option key={indexs} value={item.version}>
                          {item.version}
                        </Option>
                      );
                    })}
                </Select>
              )}
              <div className={styles.conformDesc}>
                请选择创建的应用的应用版本
              </div>
            </FormItem>
            <FormItem {...formItemLayout} label="应用备注">
              {getFieldDecorator('note', {
                initialValue: appInfo.versions
                  ? appInfo.versions[0].description
                  : '',
                rules: [
                  {
                    max: 255,
                    message: '最大长度255位'
                  }
                ]
              })(
                <Input.TextArea
                  placeholder="请填写应用备注信息"
                  style={{ width: '284px' }}
                />
              )}
              <div className={styles.conformDesc}>请输入创建的应用模版描述</div>
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default CreateHelmAppModels;
