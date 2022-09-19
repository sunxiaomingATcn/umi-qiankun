/**
 * title: 生日提醒
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { Toast, ActivityIndicator, PullToRefresh } from 'antd-mobile';
import styles from './assets/css/birthday.scss';
import { history } from 'umi';

@connect(({ customer, loading }) => ({
  customer,
  loading: loading.effects['customer'],
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      page: 1,
      list: [],
      isLoading: false,
      height: document.documentElement.clientHeight,
    };
  }

  scrollRef = React.createRef();

  componentDidMount() {
    const hei = this.state.height - ReactDOM.findDOMNode(this.ptr).offsetTop;
    setTimeout(
      () =>
        this.setState({
          height: hei,
        }),
      0,
    );
    this.queryList();
  }

  queryList(params = {}) {
    const { dispatch } = this.props;
    dispatch({ type: 'customer/getCustomerBirthdayList', payload: params }).then(res => {
      if (res && res.code == 200) {
        this.setState({
          list: this.state.list.concat(res.data.records),
          total: res.data.pages,
          page: res.data.current,
          isLoading: false,
        });
      }
    });
  }

  onRefresh(e) {
    let scrollHeight = e.target.scrollHeight;
    let clientHeight = e.target.clientHeight;
    let scrollTop = e.target.scrollTop;
    if (!this.state.isLoading) {
      if (this.state.page < this.state.total) {
        if (scrollHeight - (scrollTop * 1 + clientHeight * 1) <= 10) {
          let page = this.state.page;
          this.setState({ isLoading: true }, () => {
            setTimeout(() => {
              this.queryList({
                current: ++page,
              });
            }, 500);
          });
        }
      }
    }
  }

  goDetail(item) {
    history.push({ pathname: '/Customer/customerDetail', query: { id: item.id } });
  }

  render() {
    const { list } = this.state;
    return (
      <div className={styles.birthday}>
        <div
          ref={this.scrollRef}
          className={styles.list}
          onScroll={e => {
            this.onRefresh(e);
          }}
        >
          <div
            ref={el => (this.ptr = el)}
            style={{
              height: this.state.height,
              overflow: 'auto',
            }}
            className={styles.hidden}
          >
            <div className={styles.birthdayContainer}>
              {list.map((item, index) => {
                return (
                  <div className={styles.birthdayItem}>
                    <div className={styles.left}>
                      <img
                        src={require('./assets/image/head.png')}
                        className={styles.customerImage}
                      />
                      <div className={styles.name}>{item.name}</div>
                    </div>
                    <div className={styles.middle}>
                      {item.birthday.slice(5, 10).replace('-', '.')}
                    </div>
                    <div className={styles.right}>
                      {item.remindDay != 0 && '还有'}&nbsp;
                      <span className={styles.days}>
                        {item.remindDay != 0 ? `${item.remindDay}天` : '今天'}
                      </span>
                      &nbsp;过生日
                    </div>
                  </div>
                );
              })}
            </div>

            {list && list.length > 0 && list.length > 10 && (
              <div className={styles.finish}>
                {this.state.page == this.state.total ? '加载完成' : '加载更多'}
              </div>
            )}
            {list && list.length == 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems:'center', marginTop:'1.2rem' }}>
                  <img style={{ width:'2.8rem', height:'2.5rem' }} src={require('./assets/image/empty.png')}/>
                  <span className={styles.emptyValue}>暂无内容</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Index;
