import React, { PureComponent, Fragment } from "react";
import { Form, Button, Modal } from "antd";
import appProbeUtil from "../../../utils/appProbe-util";

const FormItem = Form.Item;

// 查看启动时健康监测
export default class ViewHealthCheck extends PureComponent {
  render() {
    const { title, onCancel } = this.props;
    const data = this.props.data || {};
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 8,
        },
      },
      wrapperCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 16,
        },
      },
    };
    return (
      <Modal
        title={title}
        visible
        onCancel={onCancel}
        footer={[<Button onClick={onCancel}> 关闭 </Button>]}
      >
        <Form>
          <FormItem {...formItemLayout} label="监测端口">
            <span>{data.port}</span>
          </FormItem>
          <FormItem {...formItemLayout} label="探针使用协议">
            <span>{data.scheme}</span>
          </FormItem>
          <FormItem {...formItemLayout} label="不健康处理方式">
            <span>{data.mode == "readiness" ? "下线" : data.mode == "liveness" ? "重启" : data.mode == "ignore" ? "忽略" : "未设置"}</span>
          </FormItem>
          {data.scheme === "http" ? (
            <Fragment>
              <FormItem {...formItemLayout} label="http请求头">
                <span>{appProbeUtil.getHeaders(data)}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="路径">
                <span>{appProbeUtil.getPath(data)}</span>
              </FormItem>
            </Fragment>
          ) : null}

          <FormItem {...formItemLayout} label="初始化等候时间">
            <span>
              {appProbeUtil.getInitWaitTime(data)}
              <span
                style={{
                  marginLeft: 8,
                }}
              >
                秒
              </span>
            </span>
          </FormItem>
          <FormItem {...formItemLayout} label="检测监测时间">
            <span>
              {appProbeUtil.getIntervalTime(data)}
              <span
                style={{
                  marginLeft: 8,
                }}
              >
                秒
              </span>
            </span>
          </FormItem>
          <FormItem {...formItemLayout} label="检测超时时间">
            <span>
              {appProbeUtil.getTimeoutTime(data)}
              <span
                style={{
                  marginLeft: 8,
                }}
              >
                秒
              </span>
            </span>
          </FormItem>
          <FormItem {...formItemLayout} label="连续成功次数">
            <span>{appProbeUtil.getSuccessTimes(data)}</span>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
