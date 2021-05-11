/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Steps,
  Typography
} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { PureComponent } from 'react';
import BaseAddCluster from '../../components/Cluster/BaseAddCluster';
import CustomClusterAdd from '../../components/Cluster/CustomClusterAdd';
import ShowInitRainbondDetail from '../../components/Cluster/ShowInitRainbondDetail';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import cloud from '../../utils/cloud';
import rainbondUtil from '../../utils/rainbond';
import userUtil from '../../utils/user';
import styles from './index.less';

const { Step } = Steps;
const { Paragraph } = Typography;

@Form.create()
@connect(({ user, list, loading, global, index }) => ({
  user: user.currentUser,
  list,
  loading: loading.models.list,
  rainbondInfo: global.rainbondInfo,
  enterprise: global.enterprise,
  isRegist: global.isRegist,
  oauthLongin: loading.effects['global/creatOauth'],
  overviewInfo: index.overviewInfo
}))
export default class EnterpriseClusters extends PureComponent {
  constructor(props) {
    super(props);
    const { user } = this.props;
    const adminer = userUtil.isCompanyAdmin(user);
    this.state = {
      adminer,
      addClusterShow: false,
      addCustomClusterShow: false,
      selectProvider: 'ack',
      currentStep: 0,
      providerAccess: {},
      loading: false,
      initTask: {},
      initShow: false,
      israinbondTird: rainbondUtil.OauthEnterpriseEnable(enterprise)
    };
  }
  componentWillMount() {
    const { adminer } = this.state;
    const { dispatch } = this.props;
    const {
      location: {
        query: { init }
      }
    } = this.props;
    if (init) {
      this.setState({ initShow: true });
    }
    if (!adminer) {
      dispatch(routerRedux.push(`/`));
    }
  }
  componentDidMount() {
    this.getAccessKey();
  }

  // getAccessKey get enterprise accesskey
  getAccessKey = () => {
    const { dispatch } = this.props;
    const { selectProvider } = this.state;
    const {
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'cloud/getAccessKey',
      payload: {
        enterprise_id: eid,
        provider_name: selectProvider
      },
      callback: access => {
        this.setState({ providerAccess: access });
      }
    });
  };
  setProvider = value => {
    this.setState({ selectProvider: value });
  };
  setAccessKey = () => {
    const { form, dispatch } = this.props;
    const {
      match: {
        params: { eid }
      }
    } = this.props;
    const { selectProvider } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      this.setState({ loading: true });
      dispatch({
        type: 'cloud/setAccessKey',
        payload: {
          enterprise_id: eid,
          provider_name: selectProvider,
          access_key: fieldsValue.access_key,
          secret_key: fieldsValue.secret_key
        },
        callback: access => {
          if (access) {
            // load clusters
            this.toClusterList(selectProvider);
          }
        }
      });
    });
  };
  cancelAddCluster = () => {
    this.setState({ addClusterShow: false });
  };
  cancelAddCustomCluster = () => {
    this.setState({ addCustomClusterShow: false });
  };
  // add Cluster
  addClusterShow = () => {
    this.setState({
      addClusterShow: true
    });
  };
  toClusterList = provider => {
    const { dispatch } = this.props;
    const {
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch(
      routerRedux.push(`/enterprise/${eid}/provider/${provider}/kclusters`)
    );
  };
  addClusterOK = () => {
    const { dispatch } = this.props;
    const {
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch(routerRedux.push(`/enterprise/${eid}/clusters`));
  };
  preStep = () => {
    const { currentStep } = this.state;
    this.setState({ currentStep: currentStep - 1 });
  };
  loadSteps = () => {
    const steps = [
      {
        title: '选择供应商'
      },
      {
        title: '选择(创建)Kubernetes集群'
      },
      {
        title: '初始化平台集群'
      },
      {
        title: '完成对接'
      }
    ];
    return steps;
  };
  showInitTaskDetail = selectTask => {
    this.setState({ showInitTaskDetail: true, initTask: selectTask });
  };
  completeInit = task => {
    this.setState({
      currentStep: 3,
      selectProvider: task.providerName
    });
  };
  cancelShowInitDetail = () => {
    this.setState({ showInitTaskDetail: false });
  };
  hideInitShow = () => {
    this.setState({ initShow: false });
  };

  renderAliyunAcountSetting = () => {
    const { providerAccess } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 24 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 }
      },
      labelAlign: 'left'
    };
    return (
      <Form {...formItemLayout}>
        <Col span={24}>
          <Paragraph className={styles.describe}>
            <h5>账号说明：</h5>
            <ul>
              <li>
                <span>
                  开始此流程之前你必须确定你的阿里云账户是否支持按需购买资源，比如账户余额大于100元并通过实名认证
                </span>
              </li>
              <li>
                <span>
                  确保以下服务已开通或授权已授予：
                  {cloud.getAliyunCountDescribe().map(item => {
                    return (
                      <a
                        style={{ marginRight: '8px' }}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.title}
                      </a>
                    );
                  })}
                </span>
              </li>
              <li>
                <span>
                  推荐在阿里云控制台企业RAM访问控制页面中创建独立的RAM用户，并创建用户AccessKey
                </span>
              </li>
              <li>
                <span>
                  请为RAM用户赋予:<b>AliyunCSFullAccess</b>、
                  <b>AliyunECSFullAccess</b>、<b>AliyunVPCFullAccess</b>、
                  <b>AliyunRDSFullAccess</b>、<b>AliyunNASFullAccess</b>、
                  <b>AliyunSLBFullAccess</b>权限
                </span>
              </li>
              <li>
                <span>
                  我们将严格保护AccessKey安全，若你有安全顾虑，可以在集群对接完成后删除账号收回权限
                </span>
              </li>
              <li>
                <span>
                  如果对接已存在的Kubernetes集群，对集群已有业务不影响，另外会按需购买RDS(1个)，NAS(1个)，SLB(1个)，预计每小时费用
                  <b>0.5</b>元
                </span>
              </li>
              <li>
                <span>
                  如果新购买Kubernetes集群，我们会按需创建购买Kubernetes托管集群(1个)，RDS(1个)，NAS(1个)，SLB(1个)，预计每小时费用
                  <b>2.5</b>元
                </span>
              </li>
            </ul>
          </Paragraph>
        </Col>
        <Col span={8} style={{ padding: '16px' }}>
          <Form.Item name="access_key" label="Access Key">
            {getFieldDecorator('access_key', {
              initialValue: providerAccess.access_key || '',
              rules: [
                {
                  required: true,
                  message: '请提供具有足够权限的Access Key'
                }
              ]
            })(<Input placeholder="Access Key" />)}
          </Form.Item>
        </Col>
        <Col span={8} style={{ padding: '16px' }}>
          <Form.Item name="secret_key" label="Secret Key">
            {getFieldDecorator('secret_key', {
              initialValue: providerAccess.secret_key || '',
              rules: [
                {
                  required: true,
                  message: '请提供具有足够权限的Secret Key'
                }
              ]
            })(<Input type="password" placeholder="Secret Key" />)}
          </Form.Item>
        </Col>
      </Form>
    );
  };

  render() {
    const {
      addClusterShow,
      addCustomClusterShow,
      selectProvider,
      currentStep,
      loading,
      showInitTaskDetail,
      initTask,
      initShow,
      israinbondTird
    } = this.state;

    const {
      match: {
        params: { eid }
      }
    } = this.props;

    const aliyunAcountSetting = this.renderAliyunAcountSetting();
    const icon = (
      <svg
        t="1610788158830"
        className="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="4505"
      >
        <path
          d="M485.561494 719.136203a36.179 36.179 0 0 0 2.714854 2.457657 35.721761 35.721761 0 0 0 47.810005-2.457657l171.750227-171.764515a35.721761 35.721761 0 0 0-50.524859-50.524859L546.545685 607.641443V0h-71.443522v607.641443l-110.780326-110.780325a35.721761 35.721761 0 1 0-50.524858 50.524858z"
          p-id="4506"
          fill="#4d73b1"
        />
        <path
          d="M920.338191 365.004954H780.880437v71.443522h132.313402V952.485035H110.740201V436.448476h131.24175v-71.443522H103.595849c-35.450276 0-64.29917 29.477597-64.29917 65.72804v527.538966c0 36.221866 28.848894 65.72804 64.29917 65.72804h816.742342c35.450276 0 64.29917-29.463308 64.29917-65.72804V430.690128c0-36.221866-28.848894-65.685174-64.29917-65.685174z"
          p-id="4507"
          fill="#4d73b1"
        />
      </svg>
    );
    const kubernetesIcon = (
      <svg
        t="1610788127045"
        className="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="3690"
      >
        <path
          d="M435.36 612.256l0.288 0.416-42.624 102.944a221.792 221.792 0 0 1-88.032-109.28l-0.48-1.536 109.984-18.656 0.16 0.224a18.784 18.784 0 0 1 20.608 25.984l0.032-0.128z m-35.52-90.816a18.816 18.816 0 0 0 7.424-32.256l-0.032-0.032 0.096-0.48-83.68-74.848a217.088 217.088 0 0 0-32.48 114.848c0 8.448 0.48 16.8 1.408 25.024l-0.096-0.992 107.264-30.944 0.096-0.384z m48.832-84.48a18.784 18.784 0 0 0 29.824-14.336v-0.032l0.416-0.224 6.4-111.776a219.296 219.296 0 0 0-128.448 61.568l0.032-0.032 91.616 64.992 0.16-0.096z m32.448 117.312l30.848 14.88 30.816-14.816 7.68-33.28-21.344-26.592h-34.304l-21.344 26.592 7.648 33.248z m64-132.032a18.784 18.784 0 0 0 29.92 14.304l-0.064 0.032 0.352 0.128 91.04-64.544a220.672 220.672 0 0 0-126.56-61.408l-1.088-0.128 6.304 111.584 0.096 0.032z m464.032 254.72l-246.304 306.4a68.16 68.16 0 0 1-53.088 25.344h-0.16l-395.136 0.128h-0.064a68.096 68.096 0 0 1-53.056-25.312l-0.096-0.128-246.432-306.336a67.104 67.104 0 0 1-12.992-57.632l-0.096 0.448 87.904-382.08A67.52 67.52 0 0 1 126.464 192L482.4 21.888c8.64-4.224 18.816-6.688 29.536-6.688s20.896 2.464 29.952 6.88l-0.416-0.192 356.064 170.016a67.552 67.552 0 0 1 36.832 45.792l87.968 382.08a67.2 67.2 0 0 1-13.152 57.184z m-140.32-87.776c-1.792-0.416-4.384-1.12-6.176-1.44-7.424-1.408-13.44-1.056-20.448-1.632-14.944-1.568-27.232-2.848-38.176-6.304-4.48-1.696-7.68-7.04-9.216-9.216l-8.576-2.528a275.936 275.936 0 0 0-4.832-101.376l0.384 1.856a276.384 276.384 0 0 0-40.544-93.248l0.608 0.96c2.208-2.016 6.4-5.664 7.552-6.784 0.352-3.84 0.032-7.808 4-12.032 8.416-7.904 18.944-14.432 31.712-22.272 6.048-3.584 11.648-5.856 17.696-10.336 1.376-1.024 3.232-2.656 4.704-3.808 10.24-8.16 12.576-22.176 5.248-31.392s-21.6-10.08-31.776-1.92c-1.44 1.152-3.424 2.656-4.736 3.744-5.728 4.96-9.248 9.824-14.08 14.944-10.496 10.656-19.2 19.552-28.704 25.984-4.128 2.4-10.208 1.568-12.928 1.408l-8.096 5.76a278.72 278.72 0 0 0-175.776-85.376l-1.12-0.096-0.512-9.504c-2.784-2.656-6.112-4.896-6.944-10.656-0.928-11.424 0.64-23.776 2.432-38.624 0.992-6.944 2.592-12.704 2.912-20.256 0.032-1.696-0.032-4.224-0.032-6.048 0-13.056-9.568-23.68-21.344-23.68-11.744 0-21.28 10.624-21.28 23.68l0.032 0.608c0 1.76-0.096 3.936 0 5.472 0.256 7.552 1.888 13.312 2.848 20.256 1.792 14.848 3.328 27.168 2.4 38.656a23.36 23.36 0 0 1-6.88 10.976l-0.032 0.032-0.512 8.992a274.08 274.08 0 0 0-177.632 85.312l-0.128 0.128a338.976 338.976 0 0 1-8.672-6.144l0.992 0.704c-3.84 0.512-7.68 1.696-12.672-1.248-9.504-6.4-18.208-15.264-28.704-25.952-4.832-5.12-8.32-9.984-14.048-14.88a97.728 97.728 0 0 0-4.736-3.744 25.184 25.184 0 0 0-14.784-5.632h-0.064l-1.088-0.032a20.48 20.48 0 0 0-15.872 7.488l-0.032 0.032c-7.328 9.216-4.992 23.296 5.248 31.456l0.288 0.224 4.448 3.552c6.048 4.48 11.616 6.784 17.664 10.336 12.768 7.904 23.296 14.432 31.712 22.272 3.232 3.488 3.84 9.632 4.256 12.288l6.816 6.112a273.28 273.28 0 0 0-46.336 152.992c0 13.856 1.024 27.488 3.008 40.8l-0.192-1.504-8.864 2.56c-2.336 3.072-5.664 7.84-9.184 9.248-10.976 3.456-23.296 4.704-38.176 6.272-7.008 0.608-13.024 0.256-20.48 1.664-1.568 0.288-3.84 0.864-5.664 1.28l-0.16 0.096-0.288 0.096c-12.576 3.04-20.64 14.592-18.048 25.952 2.592 11.392 14.88 18.304 27.52 15.584l0.288-0.032 0.416-0.128 5.504-1.248c7.264-1.952 12.544-4.832 19.104-7.328 14.08-5.024 25.76-9.248 37.12-10.912 4.768-0.384 9.824 2.944 12.288 4.32l9.248-1.568a278.912 278.912 0 0 0 121.632 152.736l1.248 0.704-3.84 9.312c1.408 3.584 2.944 8.48 1.888 12.032-4.128 10.752-11.232 22.048-19.296 34.688-3.872 5.792-7.904 10.336-11.424 17.024-0.864 1.568-1.92 4.064-2.72 5.728-5.472 11.744-1.44 25.216 9.088 30.304 10.592 5.12 23.712-0.288 29.44-12.032v-0.096c0.864-1.664 1.952-3.84 2.656-5.408 2.976-6.912 4-12.832 6.144-19.552 5.632-14.176 8.736-29.024 16.512-38.272 2.144-2.56 5.536-3.488 9.184-4.48l4.832-8.736a270.592 270.592 0 0 0 99.008 18.4 274.56 274.56 0 0 0 99.52-18.528l-1.888 0.64 4.512 8.192c3.68 1.184 7.68 1.792 10.912 6.624 5.792 9.888 9.76 21.632 14.592 35.84 2.144 6.656 3.168 12.576 6.176 19.488 0.672 1.568 1.824 3.84 2.656 5.504 5.664 11.776 18.848 17.152 29.44 12.032 10.528-5.024 14.56-18.56 9.088-30.304-0.864-1.664-1.92-4.096-2.784-5.728-3.552-6.656-7.552-11.136-11.424-16.992-8.096-12.64-14.752-23.072-18.912-33.824-1.696-5.536 0.288-8.96 1.632-12.544-0.768-0.928-2.528-6.144-3.552-8.608a278.88 278.88 0 0 0 122.336-152.576l0.544-1.952c2.72 0.416 7.52 1.28 9.088 1.632 3.2-2.144 6.144-4.864 11.936-4.448 11.36 1.664 23.04 5.888 37.12 10.912 6.56 2.56 11.808 5.472 19.104 7.392 1.536 0.416 3.744 0.8 5.536 1.184l0.384 0.128 0.288 0.032c12.672 2.72 24.928-4.192 27.52-15.584 2.56-11.36-5.472-22.912-18.048-25.952z m-169.088-175.264l-83.2 74.496v0.224a18.784 18.784 0 0 0 7.264 32.256l0.128 0.032 0.128 0.416 107.776 31.072a222.4 222.4 0 0 0-4.896-72.96l0.288 1.504a222.336 222.336 0 0 0-28.032-68.064l0.544 0.928z m-171.232 227.2a18.656 18.656 0 0 0-16.48-9.92l-0.8 0.032h0.032a18.72 18.72 0 0 0-15.808 9.856l-0.064 0.096h-0.096l-54.112 97.792a215.712 215.712 0 0 0 71.136 11.808c25.344 0 49.664-4.288 72.32-12.128l-1.536 0.48-54.176-97.952h-0.416z m80.544-55.168a18.784 18.784 0 0 0-11.616 1.568l0.096-0.064a18.816 18.816 0 0 0-9.088 24.512l-0.032-0.128-0.128 0.16 43.104 104.032a220.8 220.8 0 0 0 88.288-110.048l0.48-1.536-110.944-18.784-0.16 0.224z"
          fill="#4d73b1"
          p-id="3691"
        />
      </svg>
    );
    const selectIcon = (
      <svg
        t="1586161102258"
        viewBox="0 0 1293 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="5713"
      >
        <path
          d="M503.376842 1024a79.764211 79.764211 0 0 1-55.080421-22.096842L24.576 595.698526A79.764211 79.764211 0 0 1 22.096842 483.004632c30.342737-31.797895 80.842105-32.929684 112.478316-2.425264l361.849263 346.812632L1152.431158 29.049263a79.494737 79.494737 0 0 1 112.101053-10.832842c33.953684 27.917474 38.696421 78.201263 10.778947 112.101053L564.816842 994.950737c-14.012632 17.084632-34.708211 27.648-56.697263 28.887579C506.394947 1024 504.778105 1024 503.376842 1024z"
          fill="#ffffff"
          p-id="5714"
        />
      </svg>
    );
    const hostIcon = (
      <svg
        t="1610787647584"
        className="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="2590"
      >
        <path
          d="M832 800H192a128 128 0 0 1-128-128V192a128 128 0 0 1 128-128h640a128 128 0 0 1 128 128v480a128 128 0 0 1-128 128z m64-544a128 128 0 0 0-128-128H256a128 128 0 0 0-128 128v352a128 128 0 0 0 128 128h512a128 128 0 0 0 128-128V256zM60.384 864h914.24c50.496 0 61.664 34.048 29.088 71.264C975.008 968.096 921.504 992 881.312 992H153.696c-40.192 0-93.664-23.904-122.4-56.736C-1.248 898.048 9.92 864 60.384 864z"
          fill="#4d73b1"
          p-id="2591"
        />
        <path
          d="M384 928a128 32 0 1 0 256 0 128 32 0 1 0-256 0Z"
          fill="#4d73b1"
          p-id="2592"
        />
        <path
          d="M256 493.504a114.496 114.016 90 1 0 228.032 0 114.496 114.016 90 1 0-228.032 0Z"
          fill="#4d73b1"
          p-id="2593"
        />
        <path
          d="M508.512 380m-123.488 0a123.488 123.488 0 1 0 246.976 0 123.488 123.488 0 1 0-246.976 0Z"
          fill="#4d73b1"
          p-id="2594"
        />
        <path
          d="M654.016 493.504m-114.016 0a114.016 114.016 0 1 0 228.032 0 114.016 114.016 0 1 0-228.032 0Z"
          fill="#4d73b1"
          p-id="2595"
        />
        <path d="M398.016 460.992h256V608h-256z" fill="#4d73b1" p-id="2596" />
      </svg>
    );
    const providers = cloud.getProviders();
    const K8sCluster = rainbondUtil.isEnableK8sCluster() || false;
    return (
      <PageHeaderLayout
        title="添加集群"
        content="集群是资源的集合，以Kubernetes集群为基础，部署平台Region服务即可成为平台集群资源。"
      >
        <Row style={{ marginBottom: '16px' }}>
          <Steps current={currentStep}>
            {this.loadSteps().map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
        </Row>
        <Card>
          <Row>
            <h3>自建基础设施</h3>
            <Divider />
            <Col span={8}>
              <div onClick={this.addClusterShow} className={styles.import}>
                <div className={styles.importicon}>{icon}</div>
                <div className={styles.importDesc}>
                  <h3>接入已安装平台集群</h3>
                  <p>导入已经完成安装的平台集群，由当前控制台调度管理。</p>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div
                onClick={() => this.toClusterList('custom')}
                className={styles.import}
              >
                <div className={styles.importicon}>{kubernetesIcon}</div>
                <div className={styles.importDesc}>
                  <h3>接入Kubernetes集群</h3>
                  <p>基于已经安装的 Kubernetes 集群，初始化安装平台并接入。</p>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div
                onClick={() => this.toClusterList('rke')}
                className={styles.import}
              >
                <div className={styles.importicon}>{hostIcon}</div>
                <div className={styles.importDesc}>
                  <h3>从主机开始安装</h3>
                  <p>提供至少一台主机，自动完成集群的安装和接入。</p>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {K8sCluster && (
          <Card style={{ marginTop: '16px' }}>
            <Row>
              <h3>云服务商基础设施</h3>
              <Divider />
            </Row>
            {/* provider list */}
            <Row>
              {providers.map(item => {
                return (
                  <Col
                    key={item.id}
                    onClick={() => {
                      if (!item.disable) {
                        this.setProvider(item.id);
                      }
                    }}
                    span={8}
                    style={{ padding: '16px' }}
                  >
                    <Row
                      className={[
                        styles.provider,
                        selectProvider === item.id && styles.providerActive
                      ]}
                    >
                      <Col flex="100px" className={styles.providericon}>
                        {item.icon}
                      </Col>
                      <Col flex="auto" className={styles.providerDesc}>
                        <h4>{item.name}</h4>
                        <p>{item.describe}</p>
                      </Col>
                      {selectProvider === item.id && (
                        <div className={styles.providerChecked}>
                          {selectIcon}
                        </div>
                      )}
                      {item.disable && (
                        <div className={styles.disable}>
                          即将支持（需要请联系我们）
                        </div>
                      )}
                    </Row>
                  </Col>
                );
              })}
            </Row>
            {/* user key info */}
            <Row style={{ marginTop: '32px', padding: '0 16px' }}>
              <h4>账户设置</h4>
              {aliyunAcountSetting}
            </Row>
            <Row justify="center">
              <Col style={{ textAlign: 'center' }} span={24}>
                <Button
                  loading={loading}
                  onClick={this.setAccessKey}
                  type="primary"
                >
                  下一步
                </Button>
              </Col>
            </Row>
          </Card>
        )}
        {addClusterShow && (
          <BaseAddCluster
            eid={eid}
            onOk={this.addClusterOK}
            onCancel={this.cancelAddCluster}
          />
        )}
        {addCustomClusterShow && (
          <CustomClusterAdd eid={eid} onCancel={this.cancelAddCustomCluster} />
        )}
        {K8sCluster && showInitTaskDetail && (
          <ShowInitRainbondDetail
            onCancel={this.cancelShowInitDetail}
            eid={eid}
            providerName={selectProvider}
            taskID={initTask.taskID}
            clusterID={initTask.clusterID}
          />
        )}
        {K8sCluster && initShow && (
          <Modal
            width={600}
            centered
            maskClosable={false}
            footer={false}
            wrapClassName={styles.initModal}
            onCancel={this.hideInitShow}
            visible
          >
            <h2 className={styles.initTitle}>欢迎您成为本平台用户！</h2>
            <p>
              在开始您的云原生应用管理之旅前，你需要完成计算资源集群的对接工作。
            </p>
            <div className={styles.initDescribe}>
              <div className={styles.initDescribeItem}>
                <span>
                  <svg
                    t="1588068572145"
                    className="icon"
                    viewBox="0 0 1318 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="4912"
                  >
                    <path
                      d="M558.913829 880.274286H285.871543a209.700571 209.700571 0 0 1 0-419.401143h3.291428l33.28 0.512c1.901714 0.146286 13.604571 1.097143 25.6-11.995429 12.068571-13.165714 7.68-24.649143 7.68-39.424a317.001143 317.001143 0 0 1 316.854858-317.147428A315.245714 315.245714 0 0 1 885.935543 175.542857c6.363429 5.851429 5.12 5.558857 11.044571 11.995429a38.692571 38.692571 0 0 0 31.158857 16.822857 34.962286 34.962286 0 0 0 34.962286-35.108572c0-11.922286-6.582857-21.942857-14.774857-30.134857-5.851429-6.436571-4.900571-4.827429-11.190857-10.752A382.390857 382.390857 0 0 0 672.577829 22.674286a386.925714 386.925714 0 0 0-386.194286 368.201143 279.698286 279.698286 0 1 0-0.512 559.250285h273.042286a35.035429 35.035429 0 0 0 35.035428-35.035428 35.108571 35.108571 0 0 0-35.108571-34.889143z m146.285714-76.653715V366.08a17.481143 17.481143 0 0 0-17.481143-17.408H582.904686a17.481143 17.481143 0 0 0-17.481143 17.408v437.540571c0 9.654857 7.826286 17.481143 17.554286 17.481143h104.740571c9.728 0 17.554286-7.826286 17.554286-17.554285zM600.458971 716.214857a34.962286 34.962286 0 1 1 69.851429-0.073143 34.962286 34.962286 0 0 1-69.851429 0.073143z m314.514286 87.405714V366.08a17.481143 17.481143 0 0 0-17.408-17.408h-104.96a17.481143 17.481143 0 0 0-17.481143 17.408v437.540571c0 9.654857 7.826286 17.481143 17.554286 17.481143h104.886857a17.481143 17.481143 0 0 0 17.408-17.554285z m-104.813714-87.405714a34.962286 34.962286 0 1 1 69.924571 0 34.962286 34.962286 0 0 1-69.924571 0z m454.070857 26.404572L1093.076114 340.114286a17.408 17.408 0 0 0-22.893714-9.216l-96.548571 40.96a17.481143 17.481143 0 0 0-9.216 22.893714l171.154285 402.651429a17.554286 17.554286 0 0 0 22.893715 9.216l96.548571-40.96a17.334857 17.334857 0 0 0 9.216-22.966858z m-130.633143-39.350858a34.889143 34.889143 0 1 1 64.219429-27.428571 34.889143 34.889143 0 0 1-64.219429 27.428571z"
                      fill="#326CE5"
                      p-id="4913"
                    />
                  </svg>{' '}
                  管理您的公有云资源，实现自动化云原生运维
                </span>
                <Paragraph className={styles.describe}>
                  <ul>
                    <li>辅助您快速购买云资源并完成云原生初始化。</li>
                  </ul>
                </Paragraph>
              </div>
              <div className={styles.initDescribeItem}>
                <span>
                  <svg
                    t="1588069176883"
                    className="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="5980"
                  >
                    <path
                      d="M501.418667 30.72c-8.874667 0.682667-17.408 2.730667-25.258667 6.826667L135.168 199.338667c-17.749333 8.533333-30.72 24.576-35.157333 43.690666L17.066667 608.256c-4.096 17.066667-0.682667 35.157333 9.216 49.834667 1.024 1.706667 2.389333 3.413333 3.754666 5.12l235.52 292.522666c12.288 15.36 31.061333 24.234667 50.858667 23.893334h377.514667c19.797333 0 38.570667-9.216 50.858666-24.234667l235.178667-292.864c12.288-15.36 16.725333-35.498667 12.288-54.613333L907.946667 243.029333c-4.437333-19.114667-17.408-35.157333-35.157334-43.690666L532.48 37.205333c-9.557333-4.778667-20.48-7.168-31.061333-6.485333z"
                      fill="#326CE5"
                      p-id="5981"
                    />
                    <path
                      d="M504.490667 154.965333c-11.605333 0.682667-20.48 10.922667-20.138667 22.528v5.802667c0.682667 6.485333 1.365333 12.970667 2.730667 19.456 2.048 12.288 2.389333 24.576 2.048 36.864-1.024 4.096-3.413333 7.850667-6.826667 10.581333l-0.341333 8.533334c-12.288 1.024-24.576 3.072-36.864 5.802666-50.858667 11.605333-97.28 37.888-133.12 76.117334l-7.168-5.12c-4.096 1.365333-8.533333 0.682667-12.288-1.365334-9.898667-7.509333-19.114667-15.701333-27.306667-24.917333-4.096-5.12-8.533333-9.898667-13.312-14.336l-4.437333-3.754667c-4.096-3.072-8.874667-5.12-13.994667-5.461333-6.144-0.341333-12.288 2.389333-16.384 7.168-6.826667 9.557333-4.778667 23.210667 5.12 30.037333l4.096 3.072c5.461333 3.754667 10.922667 6.826667 16.725333 9.898667 10.922667 6.144 21.162667 13.312 30.378667 21.504 2.389333 3.413333 3.754667 7.509333 4.096 11.605333l6.826667 6.144c-35.84 53.930667-50.517333 119.466667-41.301334 183.637334l-8.533333 2.389333c-2.048 3.413333-5.12 6.485333-8.874667 8.874667-11.946667 3.072-24.234667 5.12-36.522666 6.144-6.485333 0-12.970667 0.682667-19.456 1.365333l-5.461334 1.365333h-0.682666c-11.264 1.706667-19.114667 11.946667-17.408 23.210667 0.682667 4.437333 2.730667 8.533333 5.802666 11.605333 5.461333 5.461333 13.653333 7.509333 20.821334 5.12h0.341333l5.461333-0.682666c6.144-1.706667 12.288-4.096 18.432-6.826667 11.605333-4.437333 23.210667-8.192 35.498667-10.24 4.096 0.341333 8.192 1.706667 11.605333 4.096l9.216-1.365333c19.797333 61.781333 61.781333 114.005333 117.418667 146.773333l-3.754667 7.509333c1.706667 3.413333 2.389333 7.509333 1.706667 11.605334-5.12 11.605333-11.264 22.869333-18.432 33.450666-4.096 5.12-7.509333 10.581333-10.922667 16.384l-2.730666 5.461334c-5.802667 9.898667-2.389333 22.186667 7.509333 27.989333 3.754667 2.048 8.192 3.072 12.288 2.730667 7.509333-1.024 14.336-5.802667 17.066667-13.312l2.389333-5.12c2.389333-6.144 4.437333-12.288 5.802667-18.432 5.461333-13.312 8.192-27.648 15.701333-36.522667 2.389333-2.389333 5.461333-3.754667 8.874667-4.437333l4.437333-8.192c60.416 23.210667 127.317333 23.552 187.733333 0.341333l4.096 7.509333c4.096 0.682667 7.850667 2.730667 10.24 6.144 5.802667 10.922667 10.24 22.528 13.994667 34.133334 1.706667 6.485333 3.754667 12.629333 5.802667 18.773333l2.389333 5.12c4.096 10.581333 15.701333 16.042667 26.282667 11.946667 4.096-1.365333 7.509333-4.437333 9.898666-7.850667 4.096-6.485333 4.437333-14.677333 0.341334-21.504l-2.730667-5.461333c-3.413333-5.461333-6.826667-10.922667-10.922667-16.384-7.168-10.24-13.312-21.162667-18.432-32.426667-1.024-4.096-0.341333-8.533333 2.048-12.288-1.365333-2.730667-2.389333-5.461333-3.413333-8.192 55.637333-33.109333 97.28-85.674667 116.736-147.456l8.533333 1.365333c3.072-2.730667 7.168-4.437333 11.264-4.096 11.946667 2.389333 23.893333 5.802667 35.498667 10.24 6.144 3.072 12.288 5.12 18.432 7.168 1.365333 0.341333 3.754667 0.682667 5.12 1.024h0.341333c10.922667 3.413333 22.186667-2.389333 25.941334-13.312 1.365333-4.096 1.365333-8.533333 0-12.970666-2.389333-7.168-8.874667-12.629333-16.725334-13.653334l-5.802666-1.365333c-6.485333-1.024-12.970667-1.365333-19.456-1.365333-12.288-0.682667-24.576-2.730667-36.522667-6.144-3.754667-2.048-6.826667-5.12-8.874667-8.874667l-8.192-2.389333c8.874667-64.170667-6.144-129.365333-42.325333-183.296l7.168-6.826667c-0.341333-4.096 1.024-8.192 3.754667-11.605333 9.216-8.192 19.456-15.018667 30.378666-21.162667 5.802667-3.072 11.605333-6.144 16.725334-9.898667l4.437333-3.754666c9.557333-5.802667 12.629333-18.432 6.485333-28.330667-2.389333-4.096-6.144-7.168-10.581333-8.533333-7.509333-2.730667-15.701333-0.682667-21.162667 4.778666l-4.437333 3.754667c-4.778667 4.437333-9.216 9.216-13.312 14.336-8.192 9.216-17.066667 17.749333-26.624 25.258667-3.754667 1.706667-8.192 2.048-12.288 1.365333l-7.850667 5.461333a267.308373 267.308373 0 0 0-169.301333-81.578666c0-3.072-0.341333-7.509333-0.341333-9.216-3.413333-2.389333-5.802667-6.144-6.826667-10.24-0.341333-12.288 0.341333-24.576 2.389333-36.864 1.365333-6.144 2.389333-12.970667 2.730667-19.456V177.493333c2.048-11.946667-6.826667-21.845333-18.773333-22.528z m-25.6 157.696l-6.144 106.837334h-0.341334c-0.341333 6.485333-4.096 12.288-10.24 15.36-5.802667 3.072-12.970667 2.389333-18.432-1.706667l-87.722666-62.122667c27.989333-27.306667 62.805333-46.421333 101.034666-54.954666 7.509333-1.365333 14.677333-2.389333 21.845334-3.413334z m51.2 0c45.738667 5.802667 88.746667 26.282667 122.197333 58.709334l-86.698667 61.781333a17.954133 17.954133 0 0 1-25.258666-3.072c-2.389333-3.072-3.754667-6.826667-3.754667-10.922667l-6.485333-106.496z m-205.482667 98.645334l80.213333 71.338666v0.341334c7.509333 6.485333 8.192 18.090667 1.365334 25.6-2.389333 2.730667-5.12 4.437333-8.533334 5.461333v0.341333l-102.741333 29.696c-5.12-46.421333 5.12-92.842667 29.696-132.778666z m359.082667 0c24.234667 39.594667 35.157333 86.016 30.72 132.096l-103.082667-29.696v-0.341334c-6.485333-1.706667-11.264-6.826667-12.629333-13.312-1.365333-6.485333 0.682667-13.312 5.802666-17.408l79.189334-71.338666zM488.106667 488.448h32.768l19.797333 25.6-7.168 31.744-29.354667 13.994667-29.354666-13.994667-6.826667-31.744 20.138667-25.6z m104.789333 86.698667h4.096l105.813333 17.749333c-15.36 44.032-45.397333 81.578667-84.992 106.837333l-40.96-99.328c-3.754667-9.216 0.341333-19.797333 9.557334-23.552 2.048-0.682667 3.754667-1.365333 6.144-1.365333l0.341333-0.341333z m-177.834667 0.682666c6.144 0 11.605333 3.072 14.677334 8.192 3.413333 5.12 3.754667 11.264 1.365333 16.725334v0.341333l-40.618667 98.304a209.988267 209.988267 0 0 1-84.309333-105.813333l105.130667-17.749334h3.754666z m88.746667 42.666667c6.826667-0.341333 13.312 3.413333 16.384 9.557333h0.341333l51.882667 93.525334-20.821333 6.144c-38.229333 8.874667-77.824 6.826667-115.029334-5.802667l51.882667-93.525333c3.072-5.461333 8.874667-8.874667 15.36-8.874667v-1.024z"
                      fill="#FFFFFF"
                      p-id="5982"
                    />
                  </svg>
                  管理您的 Kubernetes 集群，简化 Kubernetes 的管理
                </span>
                <Paragraph className={styles.describe}>
                  <ul>
                    <li>Kubernetes 集群自动化对接</li>
                    <li>Kubernetes 透明化，无需用户学习其使用方式</li>
                  </ul>
                </Paragraph>
              </div>
              {!israinbondTird && (
                <Row>
                  {
                    <Col span={8}>
                      <p style={{ marginTop: '16px', textAlign: 'center' }}>
                        <img
                          alt="扫码加入平台社区钉钉群"
                          style={{ width: '100%' }}
                          title="扫码加入平台社区钉钉群"
                          src="https://www.rainbond.com/images/dingding-group.jpeg"
                        />
                      </p>
                    </Col>
                  }
                  <Col span={16}>
                    <p style={{ marginTop: '16px', padding: '16px' }}>
                      如果您对接计算资源遇到障碍，或希望了解DevOps流程、企业中台、2B应用交付、多云管理、行业云等需求场景的更多信息，请扫码加入
                      平台社区钉钉群。
                    </p>
                  </Col>
                </Row>
              )}
            </div>
            <p style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button onClick={this.hideInitShow} type="primary">
                我已知晓，开始对接
              </Button>
            </p>
          </Modal>
        )}
      </PageHeaderLayout>
    );
  }
}
