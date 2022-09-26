/**
 * 非车险订单
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import { PullToRefresh, InfiniteScroll } from 'antd-mobile-v5';
import Search from '../components/Search';
import styles from '../index.less';
import { history } from 'umi';
import Loading from '@/components/Loading/spotLoading';
import LongPress from '@/components/LongPress';
import PPBLoading from '@/components/Loading/loading';
@connect(({ commonOrder, loading }) => ({
  commonOrder,
  loading: loading.models.commonOrder
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search_params: {},
      targetPage: 1,
      data: [],
      clickedIndex: 0,
      searchVisible: false,
      isPullingUpLoad: false,
      hasMore: true
    }
  }

  tabs = [
    { title: '待处理', searchTitle: '待处理订单筛选', type: 'pending', statusName: 'status', status: '1,2,3', order: { desc: 'createTime' } },
    { title: '已完成', searchTitle: '已完成订单筛选', type: 'completed', statusName: 'status', status: '4,5,8', order: { desc: 'acceptDate' } },
    { title: '续期管理', searchTitle: '续期管理订单筛选', type: 'renewal_management', statusName: 'renewalStatus', status: '1', },
    // { title: '已失效', searchTitle: '已失效订单筛选', type: 'invalid', statusName: 'policyStatus', status: '5,6,7', order: { desc: 'acceptDate' } },
  ]

  componentDidMount() {
    const tabType = this.getDetailBack();
    const index = this.tabs.findIndex(i => i.type == tabType);
    this.setState({ clickedIndex: index > 0 ? index : 0 })
  }

  loadData = async (params = this.state.search_params) => {
    const { dispatch } = await this.props;
    const { clickedIndex, targetPage, totalPage, pageSize = 10 } = this.state;
    const { statusName, order } = this.tabs[this.state.clickedIndex];
    if (!params[statusName]) params[statusName] = this.tabs[clickedIndex].status;
    if (totalPage && (targetPage > totalPage)) {
      this.setState({ hasMore: false });
      return;
    };
    return dispatch({
      type: clickedIndex == 2 ? 'commonOrder/queryRenewalList' : 'commonOrder/queryList',
      payload: { current: targetPage, size: pageSize, ...order, ...params }
    }).then(res => {
      if (res && res.code === 200) {
        let { data } = this.state;
        const { total = 0, size, pages } = res.data;
        if (targetPage == 1) {
          data = res.data.records
        } else {
          data.push(...res.data.records)
        }
        this.setState({
          data,
          totalPage: pages,
          targetPage: targetPage + 1,
          total
        }, () => {
          this.setState({ hasMore: !(data.length >= total) })
        })
      } else {
        this.setState({ hasMore: false })
      }
    })
  }

  // 筛选查询触发
  onSearch = (params) => {
    console.log('search', params)
    return new Promise((resolve) => {
      this.setState({
        searchVisible: false,
        targetPage: 1,
        // data: [],
        // total: null,
        search_params: params
      }, async () => {
        await this.loadData(params)
        resolve()
      });
    })
  }

  toDetail = (e, item) => {
    const { clickedIndex } = this.state;
    const { type } = this.tabs[clickedIndex];
    const { search_params } = this.state;
    sessionStorage.setItem('agent_order_tab_type', type)
    sessionStorage.setItem('agent_order_tab_search', JSON.stringify(search_params))
    history.push(clickedIndex == 2 ? `/order/life/detail?renewalId=${item.renewalId}` : `/order/life/${clickedIndex === 0 ? `pending?purchaseOrderId=${item.purchaseOrderId}` : `detail?policyId=${item.policyId}`}`)
  }

  getDetailBack = () => {
    const type = sessionStorage.getItem('agent_order_tab_type')
    const search_params = JSON.parse(sessionStorage.getItem('agent_order_tab_search') || '{}');
    this.setState({ search_params })
    sessionStorage.removeItem('agent_order_tab_type');
    sessionStorage.removeItem('agent_order_tab_search');
    return type;
  }

  navClick = (index) => {
    if (index === this.state.clickedIndex) return;
    const { dispatch } = this.props;
    this.setState({
      clickedIndex: index,
      search_params: {},
      targetPage: 1,
      data: [],
      total: null,
      totalPage: null,
      hasMore: false,
      navClickLoading: true
    }, async () => {
      dispatch({ type: "commonOrder/clearOrderList" })
      await this.loadData();
      this.setState({ navClickLoading: false })
    })
  }

  onDeleteOk = (item) => {
    console.log("确定删除 id：", item)
    PPBLoading.show();
    const { dispatch } = this.props;
    dispatch({
      type: 'commonOrder/removeOrder',
      payload: { id: item.id }
    }).then(res => {
      if (res && res.code === 200) {
        this.onSearch(this.state.search_params);
      }
      PPBLoading.hide();
    })
  }

  renderList = () => {
    const { data, total, clickedIndex } = this.state;

    return <div className={styles.order_noncar_scroll_content}>
      {(data && data.length) ?
        <>
          {data.map(item => (
            <div className={styles.listItem}>
              <LongPress
                open={item.status !== 4}
                onClick={e => this.toDetail(e, item)}
                actionText={<span>删除<br />订单</span>}
                onPress={() => console.log("长按 id：", item)}
                onOk={() => this.onDeleteOk(item)}
              >
                <a >
                  <div className={styles.listItemHeader}>
                    <div className={styles.insuranceCompanyName}>
                      <img src={item.logoPath} />
                      <span>{item.productName}</span>
                    </div>
                    <div
                      className={[
                        styles.statusName,
                        styles[`statusColor${clickedIndex == 0 ? item.status : clickedIndex == 2 ? item.renewalStatus == 1 ? 'AdvanceDay' : `Renewal${item.renewalStatus}` : `Policy${item.policyStatus}`}`]
                      ].join(" ")}
                    >{clickedIndex == 2 ?
                      item.renewalStatus == 1 ? <span>待提前续保{item.advanceDay}天</span> : item.renewalStatusName :
                      item.purchaseOrderStatusName
                      }
                    </div>
                  </div>
                  <div className={styles.listItemContent}>
                    <div>投保人：{item.applicantName}</div>
                    <div>被保人：{item.insuredName}</div>
                    <div>出单人：<span className={styles.ellipsis}>{item.salepersonName}</span></div>
                    {clickedIndex == 2 ? <div>下次缴费日期：{item.paymentDate}</div> :
                      clickedIndex == 1 ? <div>承保时间：{item.acceptDate}</div> :
                        <div>投保时间：{item.insureDate}</div>
                    }
                    <div>保&nbsp;&nbsp;&nbsp;&nbsp;费：<span className={styles.yuan}>￥{item.premium}</span></div>
                  </div>
                </a>
              </LongPress>

            </div>
          ))}
        </>
        : null
      }
      {!!(total == 0) && <p className={styles.nodata}>
        <img src={require('../assets/images/empty.png')} />
        <p>暂无订单</p>
      </p>}
    </div>
  }

  render() {
    const { searchVisible, total, navClickLoading } = this.state;
    const { commonOrder: { purchaseData: { totalPremium } } } = this.props;
    const { searchTitle, type, statusName } = this.tabs[this.state.clickedIndex];

    return (
      <div
        className={styles.userOrderContainer}
      >
        {searchVisible &&
          <Search
            initValue={this.state.search_params}
            type={type}
            statusItemName={statusName}
            title={searchTitle}
            onSearch={this.onSearch}
            onCancel={() => this.setState({ searchVisible: false })}
          />}

        <div className={styles.fixedHeader}>
          <div className={styles.navbar}>
            {this.tabs.map((tab, index) =>
              <div
                className={[styles.slide, this.state.clickedIndex == index ? styles.active : null].join(' ')}
                onClick={() => this.navClick(index)}
              >{tab.title}
              </div>
            )}
          </div>
          {/* <div className={styles.summary}>
            <b>累计 <span>{total}</span> 单，保费 <span>{totalPremium}</span> 元</b>
            <span className={styles.search} onClick={() => this.setState({ searchVisible: true })}>筛选<img className={styles.screenIcon} src={require('../assets/images/screen.png')} /></span>
          </div> */}
        </div>
        <div className={[styles.listContainer, styles.noncarListContainer].join(" ")} id="order_noncar_scroll_wrapper">
          <PullToRefresh
            onRefresh={async () => {
              await this.onSearch(this.state.search_params);
            }}
            refreshingText={<Loading />}
            pullingText={<Loading />}
            canReleaseText={<Loading />}
            completeText={<Loading />}
          >
            {this.renderList()}
            <InfiniteScroll loadMore={this.loadData} hasMore={this.state.hasMore}>
              {this.state.hasMore || !!navClickLoading ? <Loading /> : <p>{!!(total > 0) && '没有更多'}</p>}
            </InfiniteScroll>
          </PullToRefresh>
        </div>
      </div>
    );
  }
}

export default Index;
