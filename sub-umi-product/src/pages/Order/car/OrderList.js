/**
 * 车险订单
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import { PullToRefresh, InfiniteScroll } from 'antd-mobile-v5';
import Search from '../components/Search';
import styles from '../index.less';
import LongPress from '@/components/LongPress';
import { history } from 'umi';
import Loading from '@/components/Loading/spotLoading';
import PPBLoading from '@/components/Loading/loading.js';

@connect(({ carOrder, loading }) => ({
  carOrder,
  loading: loading.models.carOrder
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
      hasMore: true
    }
  }

  tabs = [
    { title: '待处理', searchTitle: '待处理订单筛选', type: 'pending', order: {} },
    { title: '已完成', searchTitle: '已完成订单筛选', type: 'done', order: {} },
    { title: '续期管理', searchTitle: '续期管理订单筛选', type: 'renewal', order: {} }
  ]

  componentDidMount() {
    const tabType = this.getDetailBack();
    const index = this.tabs.findIndex(i => i.type == tabType);
    this.setState({ clickedIndex: index > 0 ? index : 0 })
  }

  loadData = async (params = this.state.search_params) => {
    const { dispatch } = this.props;
    const { targetPage, totalPage, pageSize = 10 } = await this.state;

    const { type, order } = this.tabs[this.state.clickedIndex];
    if (totalPage && (targetPage > totalPage)) {
      this.setState({ hasMore: false });
      return;
    };

    return await dispatch({
      type: 'carOrder/queryList',
      payload: { current: targetPage, size: pageSize, type, ...order, ...params }
    }).then(res => {
      if (res && res.code === 200) {
        let { data } = this.state;
        const { total = 0, size = 0, pages = 0 } = res.data;
        if (targetPage == 1) {
          data = res.data.records || [];
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
    // e.stopPropagation();
    const { clickedIndex } = this.state;
    const { type } = this.tabs[clickedIndex];
    const { search_params } = this.state;
    sessionStorage.setItem('agent_order_tab_type', type)
    sessionStorage.setItem('agent_order_tab_search', JSON.stringify(search_params))
    history.push(`/order/car/detail?orderId=${item.id}`)
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
      total: null,
      data: [],
      totalPage: null,
      hasMore: false,
      navClickLoading: true
    }, async () => {
      dispatch({ type: "carOrder/clearOrderList" })
      await this.loadData();
      this.setState({ navClickLoading: false })
    })
  }

  onDeleteOk = (item) => {
    console.log("确定删除 id：", item)
    PPBLoading.show();
    const { dispatch } = this.props;
    dispatch({
      type: 'carOrder/removeOrder',
      payload: { orderId: item.id }
    }).then(res => {
      if (res && res.code === 200) {
        this.onSearch(this.state.search_params);
      }
      PPBLoading.hide();
    })
  }

  renderList = () => {
    const { data, clickedIndex, total } = this.state;

    return <div className={styles.order_scroll_content}>
      {(data && data.length) ?
        <div className={styles.listContent}>
          {data.map(item => (
            <div className={styles.listItem}>
              <LongPress
                open={item.status !== 'insured'}
                onClick={e => this.toDetail(e, item)}
                actionText={<span>删除<br />订单</span>}
                onPress={() => console.log("长按 id：", item)}
                onOk={() => this.onDeleteOk(item)}
              >
                <a>
                  <div className={styles.listItemHeader}>
                    <div className={styles.insuranceCompanyName}>
                      <img src={item.icLogo} />
                      <span>{item.icName}</span>
                    </div>
                    <div
                      className={[
                        styles.statusName,
                        styles[`statusColor${clickedIndex == 2 && item.remind ? 'AdvanceDay' : item.status}`]
                      ].join(" ")}
                    >{clickedIndex == 2 && item.remind ? item.remind : item.statusName}
                    </div>
                  </div>
                  <div className={styles.listItemContent}>
                    <div><span>车牌号：</span><span className={styles.listItemValue}>{item.carLicenseNo}</span></div>
                    <div><span>车主：</span><span className={styles.listItemValue}>{item.owner}</span></div>
                    <div><span>被保人：</span><span className={styles.listItemValue}>{item.insured}</span></div>
                    <div><span>录单时间：</span><span className={styles.listItemValue}>{item.createTime}</span></div>
                    <div><span>保费：</span><span className={styles.yuan}>￥{item.premium}</span></div>
                  </div>
                </a>
              </LongPress>
            </div>
          ))}
        </div>
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
        </div>

        <div className={[styles.listContainer, styles.carListContainer].join(' ')} id="order_car_scroll_wrapper">
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
