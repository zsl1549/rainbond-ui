import React, { PureComponent, Fragment } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Icon,
  Alert,
  Select,
  Modal,
  Input,
} from 'antd';

const FormItem = Form.Item;

// 添加、编辑变量
@Form.create()
export default class AddVarModal extends PureComponent {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onSubmit && this.props.onSubmit(values);
      }
    });
  };
  handleCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const data = this.props.data || {};
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <Modal
        title="添加变量"
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        visible
      >
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="变量名">
            {getFieldDecorator('attr_name', {
              initialValue: data.attr_name || '',
              rules: [
                { required: true, message: '请输入变量名称' },
                {
                  // pattern: /^[A-Za-z].*$/,
                  pattern: /[-._a-zA-Z][-._a-zA-Z0-9]/,
                  message: ' 必须由字母、数字和 - . _ 组成，不支持数字开头',
                },
              ],
            })(
              <Input disabled={!!data.attr_name} placeholder="请输入变量名称" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="变量值">
            {getFieldDecorator('attr_value', {
              initialValue: data.attr_value || '',
              rules: [{ required: true, message: '请输入变量值' }],
            })(<Input placeholder="请输入变量值" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="说明">
            {getFieldDecorator('name', {
              initialValue: data.name || '',
              rules: [{ required: false, message: '请输入变量说明' }],
            })(<Input placeholder="请输入变量说明" />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
