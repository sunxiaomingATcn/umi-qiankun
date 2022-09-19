import { connect } from 'dva';
import React, { useState } from 'react';
import { createForm } from 'rc-form';
import { Picker,List } from 'antd-mobile';
import { district, provinceLite } from 'antd-mobile-demo-data';

function Index(props) {
  const [test, setTest] = useState("aabbc");
  const { getFieldProps } = props.form;
  return <div>
    <Picker extra="请选择(可选)"
      data={district}
      title="投保地区"
      {...getFieldProps('district', {
        initialValue: ['340000', '341500', '341502'],
      })}
      onOk={e => console.log('ok', e)}
      onDismiss={e => console.log('dismiss', e)}
    >
      <List.Item arrow="horizontal">投保地区</List.Item>
    </Picker>
    <List.Item arrow="horizontal">车牌号</List.Item>
  </div>
}
const FormIndex = createForm()(Index);
export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(FormIndex)