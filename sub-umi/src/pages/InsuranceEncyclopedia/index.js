/**
 * title: 保险百科
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import styles from './assets/css/index.scss';
import { Tabs, Toast, PullToRefresh } from 'antd-mobile';
import { createForm, formShape } from 'rc-form';
import { history } from 'umi';
import Modal from '@/components/modal';

@connect(({ InsuranceEncyclopedia }) => ({
  InsuranceEncyclopedia,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      page: 1,
      tabs: [
        { title: '保险知识', id: 0 },
        { title: '常见问题', id: 1 },
        { title: '产品测评', id: 2 },
      ],
      list: [],
      height: document.documentElement.clientHeight,
      data: [],
      isLoading: false,
      isQueryList: false,
    };
  }

  scrollRef = React.createRef();

  componentDidMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;
    let key = localStorage.getItem('bxbkKey');
    this.setState({ currentIndex: key && key ? key : 0 });
    localStorage.removeItem('bxbkKey');
    const hei = this.state.height - ReactDOM.findDOMNode(this.ptr).offsetTop;
    // dispatch({
    //     type: 'InsuranceEncyclopedia/queryDictionary',
    //     payload: {
    //         code: 'cyclopedia_type',
    //     },
    // }).then(res => {
    //     console.log(res);
    //     if (res && res.code == 200) {
    //         this.setState({ tabs: res.payload.data });
    //     }
    // });
    this.queryList({
      category: key ? key : '0',
      current: 1,
      size: 10,
    });
    setTimeout(
      () =>
        this.setState({
          height: hei,
        }),
      0,
    );
  }

  queryList(params = {}) {
    const { dispatch } = this.props;
    Toast.loading('Loading...', 0);
    dispatch({
      type: 'InsuranceEncyclopedia/queryList',
      payload: {
        ...params,
        size: 10,
      },
    }).then(res => {
      Toast.hide();
      this.setState({ isQueryList: false, isLoading: false });
      if (res && res.code == 200) {
        this.setState({
          list: this.state.list.concat(res.data.records),
          page: res.data.current,
          total: res.data.pages,
        });
      }
    });
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
                category: this.state.currentIndex,
              });
            }, 500);
          });
        }
      }
    }
  }

  itemClick(item) {
    const {
      // localtion: { query },
    } = this.props;
    const { currentIndex } = this.state;
    history.push({
      pathname: '/InsuranceEncyclopedia/detail',
      query: { key: currentIndex, id: item.id },
    });
  }

  changeKey(item) {
      console.log(this.state.currentIndex , item.id)
    if (this.state.currentIndex != item.id) {
      this.setState({ currentIndex: item.id, page: 1, list: [] });
      if (!this.state.isQueryList) {
        this.setState({ isQueryList: true }, () => {
          this.queryList({
            category: item.id,
            current: 1,
            size: 10,
          });
        });
      }
    }
  }
  render() {
    const { tabs, currentIndex, list = [], page, total } = this.state;
    return (
      <div className={styles.insuranceEncyclopedialist}>
        <div className={styles.tab}>
          <Tabs
            tabs={tabs}
            swipeable={false}
            prerenderingSiblingsNumber={0}
            destroyInactiveTab={true}
            animated={false}
            page={currentIndex}
            renderTabBar={props => (
              <Tabs.DefaultTabBar
                {...props}
                page={4}
                // activeTab={currentIndex}
                renderTab={tab => (
                  <div
                    onClick={e => {
                      this.changeKey(tab);
                    }}
                    className={currentIndex == tab.id ? styles.selected : styles.normal}
                  >
                    {tab.title}
                  </div>
                )}
              />
            )}
          ></Tabs>
        </div>
        <div
          ref={this.scrollRef}
          className={styles.list}
          onScroll={e => {
            this.onRefresh(e);
          }}
        >
          <div
            // damping={60}
            ref={el => (this.ptr = el)}
            style={{
              height: this.state.height,
              overflow: 'auto',
            }}
            // className={`${this.state.page < this.state.total ? '' : styles.hidden}`}
            className={styles.hidden}
            // indicator={{
            //     deactivate: <div></div>,
            //     finish: <div></div>,
            //     activate: '加载更多',
            // }}
            // direction={'up'}
            // refreshing={this.state.refreshing}
            // onRefresh={() => {
            //     // if (this.state.page <  this.state.total) {
            //     this.onRefresh();
            //     // }
            // }}
          >
            {list &&
              list.map((item, index) => {
                if (item.recommend) {
                  return (
                    <div
                      className={`${styles.articleItem} ${styles.imgleftpadding}`}
                      style={{ display: 'flex' }}
                      onClick={() => {
                        this.itemClick(item);
                      }}
                    >
                      <img src={item.covorPhoto} className={styles.img}></img>
                      <div style={{ marginLeft: '0.2rem' }}>
                        <div className={styles.title} style={{ WebkitBoxOrient: 'vertical' }}>
                          {item.title}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div className={styles.recommend}>热门推荐</div>
                          <div className={styles.time}>{item.releaseTime}</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (!item.covorPhoto) {
                  return (
                    <div
                      className={`${styles.articleItem} ${styles.textpadding}`}
                      style={{ display: 'flex' }}
                      onClick={() => {
                        this.itemClick(item);
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        <div
                          className={styles.title}
                          style={{
                            flex: '1',
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div className={styles.recommend}>热门推荐</div>
                          <div className={styles.time}>{item.releaseTime}</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (item.covorPhoto) {
                  return (
                    <div
                      className={`${styles.articleItem} ${styles.imgrightpadding}`}
                      style={{ display: 'flex' }}
                      onClick={() => {
                        this.itemClick(item);
                      }}
                    >
                    <img
                        className={styles.img}
                        style={{
                          marginLeft: '0.4rem',
                          // paddingRight: '0.2rem',
                        }}
                        src={'https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/'+item.covorPhoto}
                      ></img>
                      <div
                        style={{
                          flex: '1',
                        }}
                      >
                        <div
                          style={{
                            width: '4.4rem',
                            WebkitBoxOrient: 'vertical',
                          }}
                          className={styles.title}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div className={styles.time}>{item.releaseTime}</div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            {list && list.length > 0 && (
              <div className={styles.finish}>
                {this.state.page == this.state.total ? '加载完成' : '加载更多'}
              </div>
            )}
            {list && list.length == 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img className={styles.empty} src={require('./assets/image/empty.png')} />
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
