import React, { Component } from 'react';
import { Link } from 'umi';

class _layout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { location: { pathname } } = this.props;
    return (<div style={{ height: '100%' }}>
      <div style={{ height: '100%', paddingBottom: '1.66rem', overflowY: 'auto' }}>
        {this.props.children}
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%' }}>
        {/* <Link to="/">首页</Link>
        <Link to="/agent/order"><span style={{ color: pathname == '/agent/order' ? 'blue' : '#ccc' }}>订单</span></Link>
        <Link to="/">客户</Link>
        <Link to="/">我的</Link> */}
      </div>
    </div>)
  }
}

export default _layout;
