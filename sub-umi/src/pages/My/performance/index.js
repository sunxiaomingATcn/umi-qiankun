/**
 * title: 团队业绩明细
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { Toast, Button, DatePicker, List } from 'antd-mobile';
import styles from './performancedetail.scss';
import moment from 'moment';

@connect(({ my }) => ({
  my,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      list: [],
      page: 1,
      height: document.documentElement.clientHeight,
      total: 0,
    };
  }
  componentDidMount() {
    const hei = this.state.height - ReactDOM.findDOMNode(this.ptr).offsetTop;
    setTimeout(
      () =>
        this.setState({
          height: hei,
        }),
      0,
    );
    this.queryList({
      acceptDateMin: moment()
        .startOf('month')
        .format('YYYY-MM-DD'),
      acceptDateMax: moment().format('YYYY-MM-DD'),
    });
    this.setState({
      startDate: moment().startOf('month')._d,
      endDate: moment()._d,
    });
  }

  queryList(params, flag = false) {
    const { dispatch } = this.props;
    let newList = this.state.list;
    dispatch({
      type: 'my/orderList',
      payload: {
        ...params,
        size: 10,
        team: true,
        performance: true,
        // policyStatus: 2,
      },
    }).then(res => {
      if (res && res.code == 200) {
        this.setState({
          list: res.data.records.concat(newList),
          total: res.data.pages,
          totalPremium: res.data.totalPremium,
          totalCount: res.data.total,
        });
        if (flag) this.isShowChange();
      }
    });
  }

  submit() {
    this.setState(
      {
        list: [],
      },
      () => {
        let params = {
          servicePersonName: this.state.servicePersonName,
          applicantName: this.state.applicantName,
          policyNo: this.state.policyNo,
          acceptDateMax: this.state.endDate ? moment(this.state.endDate).format('YYYY-MM-DD') : '',
          acceptDateMin: this.state.startDate
            ? moment(this.state.startDate).format('YYYY-MM-DD')
            : '',
        };
        this.queryList(params, true);
      },
    );
  }

  onRefresh(e) {
    // console.log(e.target.scrollTop, 'scrollTop');
    // console.log(e.target.clientHeight, 'clientHeight ');
    // console.log(e.target.scrollTop + e.target.clientHeight);
    // console.log(e.target.scrollHeight, 'scrollHeight');
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
                servicePersonName: this.state.servicePersonName,
                applicantName: this.state.applicantName,
                policyNo: this.state.policyNo,
                acceptDateMax: this.state.endDate
                  ? moment(this.state.endDate).format('YYYY-MM-DD')
                  : '',
                acceptDateMin: this.state.startDate
                  ? moment(this.state.startDate).format('YYYY-MM-DD')
                  : '',
              });
            }, 500);
          });
        }
      }
    }
  }

  isShowChange() {
    this.setState({ isShow: !this.state.isShow });
  }

  render() {
    const { isShow, list = [], total = 0, totalPremium = 0, totalCount = 0 } = this.state;
    console.log(this.state.startDate)
    console.log(moment())
    return (
      <div className={styles.performance}>
        <div className={styles.header}>
          <div className={styles.left}>
            累计 <span style={{ color: '#FF5935' }}>{totalCount}</span> 单，保费{' '}
            <span style={{ color: '#FF5935' }}>{totalPremium}</span> 元
          </div>
          <div
            className={styles.right}
            onClick={() => {
              this.isShowChange();
            }}
          >
            筛选
            <img src={require('../assets/img/screen.png')} />
          </div>
        </div>
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
            {list.map((item, index) => {
              return (
                <div className={styles.item}>
                  <div className={styles.top}>
                    <div className={styles.right}>
                      <img src={item.logoPath} className={styles.image}></img>
                      <div className={styles.name}>{item.productName}</div>
                    </div>
                    <div className={styles.status}>{item.policyStatusName}</div>
                  </div>
                  <div className={styles.line}></div>
                  <div className={styles.bottom}>
                    <div className={styles.one}>
                      <div className={styles.content}>投保人：{item.applicantName}</div>
                      <div className={styles.content} style={{ paddingLeft: '0.3rem' }}>
                        被保人：{item.insuredName}
                      </div>
                    </div>
                    <div className={styles.two}>
                      <div className={styles.content}>出单人：{item.salepersonName}</div>
                      <div className={styles.content} style={{ paddingLeft: '0.3rem' }}>
                        承保时间：{item.acceptDate}
                      </div>
                    </div>
                    <div className={styles.three}>
                      <div className={styles.content}>保 费：{item.premium}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {list && list.length > 0 && (
              <div className={styles.finish}>
                {this.state.page == this.state.total ? '加载完成' : '加载更多'}
              </div>
            )}
            {list && list.length == 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.emptyValue}>暂无内容</span>
              </div>
            )}
          </div>
        </div>
        {isShow && (
          <div className={styles.search}>
            <div className={styles.mask}></div>
            <div className={styles.container}>
              <div className={styles.searchheader}>
                团队业绩筛选
                <img
                  onClick={() => {
                    this.isShowChange();
                  }}
                  src={require('../assets/img/clear.png')}
                  className={styles.clear}
                ></img>
              </div>
              <div className={styles.searchValue}>
                <div className={styles.title} style={{ marginTop: '0' }}>
                  时间
                </div>
                <div>承保时间</div>
                <div style={{ marginTop: '0.2rem' }}>
                  <div className={styles.leftDate}>
                    <DatePicker
                      mode="date"
                      title="请选择时间"
                      extra={<span className={styles.placeholder}>请选择时间</span>}
                      value={this.state.startDate}
                      onChange={startDate => this.setState({ startDate })}
                    >
                      <List.Item></List.Item>
                    </DatePicker>
                  </div>
                  <span style={{ margin: '0 0.2rem' }}>至</span>
                  <div className={styles.rightDate}>
                    <DatePicker
                      mode="date"
                      title="请选择时间"
                      extra={<span className={styles.placeholder}>请选择时间</span>}
                      value={this.state.endDate}
                      onChange={endDate => this.setState({ endDate })}
                    >
                      <List.Item></List.Item>
                    </DatePicker>
                  </div>
                </div>
                <div className={styles.title}>状态</div>
                <div className={styles.tag}>已承保</div>
                <div className={styles.title}>保单号</div>
                <input
                  className={styles.ipt}
                  value={this.state.policyNo}
                  onChange={e => {
                    this.setState({ policyNo: e.target.value });
                  }}
                  placeholder="请输入保单号"
                />
                <div className={styles.title}>投保人姓名</div>
                <input
                  className={styles.ipt}
                  value={this.state.applicantName}
                  onChange={e => {
                    this.setState({ applicantName: e.target.value });
                  }}
                  placeholder="请输入投保人姓名"
                />
                <div className={styles.title}>业务员</div>
                <input
                  className={styles.ipt}
                  value={this.state.servicePersonName}
                  onChange={e => {
                    this.setState({ servicePersonName: e.target.value });
                  }}
                  placeholder="请输入业务员"
                />
                <div className={styles.btn}>
                  <Button
                    onClick={() => {
                      this.isShowChange();
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      this.submit();
                    }}
                  >
                    确定
                  </Button>
                </div>
                <div style={{ height: '0.58rem' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Index;
