import {Form} from 'antd';
import {FormItemProps} from 'antd/lib/form';
import React, {FC} from 'react';

export const SubFormItem: FC<FormItemProps> = props => (
  <div style={{paddingLeft: '24px'}}>
    <Form.Item {...props}></Form.Item>
  </div>
);
