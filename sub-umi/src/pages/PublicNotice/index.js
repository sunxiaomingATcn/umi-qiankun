/**
 * title: 公告
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import styles from './index.scss';
import { Toast } from 'antd-mobile';
// import Util from '@/utils/utils';
import { history } from 'umi';
import BScroll from 'better-scroll';
import * as requestMethods from '@/services/public';

@connect(({ login, loading }) => ({
  login,
  loading: loading.models.login,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 1,
      size: 999,
      data: [],
      nomoredata: false,
      showContent: false,
    };
  }

  componentDidMount() {
    document.title = '公告';
    // this.getContentScroll();
    this.loadData();
  }

  pullingDown = () => {
    console.log('[pullingDown]');
    this.setState(
      {
        current: 1,
        data: [],
        nomoredata: false,
      },
      () => {
        this.loadData();
      },
    );
  };

  loadData = () => {
    const { current, size, totalPage, data } = this.state;
    // if (totalPage && current > totalPage) return;
    // Toast.loading();
    requestMethods
      .queryNoticeList({
        status: 1,
        current,
        size,
      })
      .then(res => {
        // Toast.hide();
        this.setState({
          showContent: true,
        });
        console.log('[queryNoticeList]', res);
        if (res && res.code === 200) {
          this.setState({
            data: res.data.records,
          });
          // const { total } = res.data;
          // data.push(...res.data.records);
          // this.setState({ data, totalPage: Math.ceil(total / size) });
          // if (data.length >= res.data.total) {
          //   // 没有更多
          //   this.setState({ nomoredata: true });
          // }
        }
      })
      .catch(() => {
        // Toast.hide();
        this.setState({
          showContent: true,
        });
      });
  };

  // getContentScroll = () => {
  //   const wrapper = document.getElementById('scroll_wrapper');
  //   this.bScroll = new BScroll(wrapper, {
  //     preventDefault: true,
  //     scrollY: true,
  //     // 实时派发scroll事件
  //     probeType: 3,
  //     mouseWheel: true,
  //     scrollbars: true,
  //     click: true,
  //     pullDownRefresh: {
  //       // 下拉距离超过30px触发pullingDown事件
  //       threshold: 30,
  //       // 回弹停留在距离顶部20px的位置
  //       stop: 20,
  //     },
  //     pullUpLoad: true,
  //   });
  //   // 下拉刷新
  //   this.bScroll.on('pullingDown', async () => {
  //     await this.pullingDown();
  //     this.bScroll.finishPullDown();
  //   });

  //   // 加载更多
  //   this.bScroll.on('touchEnd', () => {
  //     if (this.bScroll.y <= 100) {
  //       const { current } = this.state;
  //       this.setState({ current: current + 1 }, async () => {
  //         await this.loadData();
  //         this.bScroll.finishPullUp();
  //       });
  //     }
  //   });
  // };

  componentWillUnmount() {
    this.setState({
      showContent: false,
    });
  }

  toDetail = item => {
    history.push('/PublicNotice/detail?id=' + item.id);
  };

  render() {
    const { data = [], nomoredata, showContent = false } = this.state;
    return (
      <div className={styles.listContainer} id="scroll_wrapper">
        {showContent && (
          <div className={styles.scroll_content}>
            {data.length > 0 ? (
              <>
                {data.map(item => (
                  <div key={item.id} onClick={() => this.toDetail(item)} className={styles.item}>
                    <span>{item.title}</span>
                    <span>{item.releaseTime}</span>
                    <img src={require('./images/arrow-right.png')} />
                  </div>
                ))}
                {nomoredata && <p className={styles.nodata}>没有更多了</p>}
              </>
            ) : (
              <div className={styles.emptyCon}>
                <img src={require('./images/empty.png')} />
                <span>暂无公告</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Index;
