/**
 * title: 客户
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './assets/css/index.scss';
import { history } from 'umi';
import Loading from '@/components/Loading/spotLoading';

@connect(({ customer }) => ({
  customer,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: null,
      renewTotal: 0,
      birthdayTotal: 0,
      height: document.documentElement.clientHeight,
      total: 0,
      page: 1,
    };
  }

  scrollRef = React.createRef();

  componentDidMount() {
    this.queryList();
  }

  queryList(params = {}) {
    const { dispatch } = this.props;
    dispatch({ type: 'customer/getCustomerList', payload: { size: 20, ...params } }).then(res => {
      if (res && res.code == 200) {
        this.setState({
          list: (this.state.list || []).concat(res.data.records),
          birthdayTotal: res.data.birthdayTotal,
          renewTotal: res.data.renewTotal,
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

  search() {
    history.push('/Customer/search');
  }

  goBirthday() {
    history.push('/Customer/birthdayRemind');
  }

  goAdd() {
    history.push('/Customer/addCustomer');
  }

  render() {
    const { list, renewTotal, birthdayTotal } = this.state;
    console.log(this.state.height);
    return (
      <div className={styles.customer}>
        <div style={{ position: 'fixed', left: '0', top: '0', width: '100%' }}>
          <div className={styles.customerHeader}>
            <img
              src={require('./assets/image/search.png')}
              onClick={() => {
                this.search();
              }}
              className={styles.searchIcon}
              type="search"
            />
            <input
              onClick={() => {
                this.search();
              }}
              placeholder="输入姓名等关键词搜索"
              className={styles.headerInput}
            />
          </div>
        </div>
        <div style={{ height: '1.5rem' }}></div>
        <div
          ref={this.scrollRef}
          className={styles.list}
          onScroll={e => {
            this.onRefresh(e);
          }}
          style={{ height: 'calc(100% - 1.5rem)', overflowY: 'auto', background: '#FFF' }}
        >
          <div className={styles.container}>
            <div className={styles.customerList} style={{ minHeight: 'calc(100%-3.9rem)' }}>
              {list == null && <div className={styles.finish}><Loading /></div>}
              {list?.map((item, index) => {
                return (
                  <div
                    style={{
                      borderBottom: index == list.length - 1 ? '0.01rem solid #ebecf0' : '',
                    }}
                    className={styles.item}
                    onClick={() => {
                      history.push({
                        pathname: '/Customer/policy',
                        query: { id: item.id },
                      });
                    }}
                  >
                    <div className={styles.left}>
                      <span className={styles.customerHead}>{item.name?.substring(item.name.length - 2)}</span>
                      <div className={styles.name}>{item.name}</div>
                    </div>
                    <div className={styles.right}>
                      <img src={require('@/assets/arrow-right.png')} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {list && list.length > 0 && (
            <div className={styles.finish}>
              {this.state.page == this.state.total ? '没有更多' : <Loading />}
            </div>
          )}
          {list && list.length == 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={styles.emptyValue}>暂无内容</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Index;
