/**
 * title: 客户搜索
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { Toast, ActivityIndicator, Icon, PullToRefresh } from 'antd-mobile';
import styles from './assets/css/search.scss';
import { deBounce } from '@/utils/utils';
import { history } from 'umi';

@connect(({ customer, loading }) => ({
    customer,
    loading: loading.effects['customer'],
}))
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
            list: [],
            page: 1,
            total: 0,
            isLoading: false,
            height: document.documentElement.clientHeight,
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
    }

    queryList(params = {}, isSearch) {
        const { dispatch } = this.props;
        dispatch({ type: 'customer/getCustomerList', payload: { ...params, size: 20 } }).then(
            res => {
                if (res && res.code == 200) {
                    this.setState({
                        list: isSearch
                            ? res.data.records
                            : this.state.list.concat(res.data.records),
                        total: res.data.pages,
                        page: res.data.current,
                        isLoading: false,
                    });
                }
            },
        );
    }

    searchValue = deBounce(value => {
        if (value) {
            this.queryList({ current: this.state.page, customerName: value }, true);
        }
    }, 300);

    detail(item) {
        history.push({ pathname: '/Customer/policy', query: { id: item.id } });
    }

    onRefresh(e) {
        let scrollHeight = e.target.scrollHeight;
        let clientHeight = e.target.clientHeight;
        let scrollTop = e.target.scrollTop;
        if (!this.state.isLoading && this.state.searchValue) {
            if (this.state.page < this.state.total) {
                if (scrollHeight - (scrollTop * 1 + clientHeight * 1) <= 10) {
                    let page = this.state.page;
                    this.setState({ isLoading: true }, () => {
                        setTimeout(() => {
                            this.queryList(
                                {
                                    current: ++page,
                                    customerName: this.state.searchValue,
                                },
                                false,
                            );
                        }, 500);
                    });
                }
            }
        }
    }

    render() {
        const { searchValue, cancel = false, list = [] } = this.state;
        return (
            <div className={styles.search}>
                <div className={styles.searchHeader}>
                    <img src={require('./assets/image/search.png')} className={styles.searchIcon}  />
                    <input
                        onChange={e => {
                            this.setState({ searchValue: e.target.value });
                            this.searchValue(e.target.value);
                        }}
                        onFocus={() => {
                            this.setState({ cancel: true });
                        }}
                        onBlur={() => {
                            setTimeout(() => {
                                this.setState({ cancel: false });
                            }, 0);
                        }}
                        value={searchValue}
                        placeholder="输入姓名等关键词搜索"
                        className={styles.searchInput}
                        maxLength={20}
                    />
                    {cancel && (
                        <div
                            onClick={() => {
                                this.setState({ searchValue: '' });
                            }}
                            className={styles.cancel}
                        >
                            取消
                        </div>
                    )}
                    {searchValue && searchValue.length > 0 && (
                        <img
                            onClick={() => {
                                this.setState({ searchValue: '' });
                            }}
                            className={styles.clear}
                            src={require('./assets/image/clear.png')}
                        />
                    )}
                </div>
                <div
                    ref={this.scrollRef}
                    className={styles.list}
                    onScroll={e => {
                        this.onRefresh(e);
                    }}
                >
                    <PullToRefresh
                        ref={el => (this.ptr = el)}
                        style={{
                            height: this.state.height,
                            overflow: 'auto',
                        }}
                        className={styles.hidden}
                    >
                        <div className={styles.searchContainer}>
                            {list.map((item, index) => {
                                return (
                                    <div
                                        className={styles.searchItem}
                                        onClick={() => {
                                            this.detail(item);
                                        }}
                                    >
                                        {item.name}
                                    </div>
                                );
                            })}
                        </div>
                        {list && list.length > 0 && (
                            <div className={styles.finish}>
                                {this.state.page == this.state.total ? '加载完成' : '加载更多'}
                            </div>
                        )}
                        {list && list.length == 0 && !cancel && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems:'center', marginTop:'1.2rem' }}>
                                <img style={{ width:'2.8rem', height:'auto' }} src={require('@/assets/empty.png')}/>
                                <span className={styles.emptyValue}>暂无内容</span>
                            </div>
                        )}
                    </PullToRefresh>
                </div>
            </div>
        );
    }
}

export default Index;
