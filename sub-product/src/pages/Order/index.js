/**
 * title: 订单管理
 */
/**
 * 业务员订单管理页面
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Popover } from 'antd-mobile-v5';
import { history } from 'umi';
import styles from './index.less';
import LifeTab from './life/OrderList';
import CarTab from './car/OrderList';

@connect(({ commonOrder, loading }) => ({
  commonOrder,
  loading: loading.models.commonOrder
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderType: null
    }
  }

  orderTypes = [
    { text: '车险订单', key: '1', component: CarTab },
    { text: '人身险订单', key: '2', component: LifeTab }
  ]

  componentDidMount() {
    const { location: { query: { orderType } } } = this.props;
    this.setState({ orderType: orderType || 1 })
  }

  onSelect = (opt) => {
    const orderType = opt.key;
    this.setState({
      visible: false,
      orderType
    });
    const { location: { pathname, query } } = this.props;
    history.replace({
      pathname,
      query: { ...query, orderType }
    })
  };

  handleVisibleChange = (visible) => {
    this.setState({ visible });
  };

  renderCurrentTab = () => {
    const { orderType } = this.state;
    const _tab = this.orderTypes.find(item => item.key == orderType);
    const _tabComponent = _tab && _tab.component;
    return _tabComponent && <_tabComponent {...this.props} />
  }

  render() {
    const { orderType } = this.state;

    return (
      <div
        className={styles.userOrderContainer}
      >
        <div className={styles.orderType}>
          <Popover.Menu
            actions={this.orderTypes.map(action => ({
              ...action,
              icon: null,
            }))}
            onAction={this.onSelect}
            placement='bottomLeft'
            trigger='click'
          >
            <span>{(this.orderTypes.find(item => item.key == orderType) || {}).text}</span>
          </Popover.Menu>
        </div>
        {this.renderCurrentTab()}
      </div>
    );
  }
}

export default Index;
