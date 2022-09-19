/**
 * 复兴 & 京东安联 分级获取职业组件
*/
import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import styles from './input.scss';

class JobFx extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstClickedId: '',
            secondClickedId: '',
            Jobs: []
        };
    }

    componentDidMount() {
        // vendorCode=>swissre  只有两级
        const { dispatch, vendorCode } = this.props;
        dispatch({
            type: this.judgeDispatchType(),
            payload: {
                parent: 0,
                vendorCode
            }
        }).then(res => {
            if (res && res.code === 0) {
                this.setState({
                    Jobs: res.payload
                })
            }
        })
    }

    judgeDispatchType = () => {
        return 'common/getFxProfession'
    }

    queryChildrens = (pids) => {
        const curPid = pids && pids[pids.length - 1];
        if (curPid == null) return Promise.resolve()
        return new Promise((reslove, reject) => {
            const { dispatch, vendorCode } = this.props;
            dispatch({
                type: this.judgeDispatchType(),
                payload: {
                    parent: curPid,
                    vendorCode
                },
                pids
            }).then(res => {
                console.log(res)
                if (res && res.code === 0) {
                    reslove(res.payload)
                } else {
                    Toast.info(res && res.message)
                    reject()
                }
            })
        })
    }

    changeFirstIndex = (key) => {
        const curId = key !== this.state.firstClickedId ? key : null;
        this.queryChildrens([curId]).then(() => {
            this.setState({
                firstClickedId: curId,
                secondClickedId: curId
            })
        })
    };

    changeSecondIndex = (key) => {
        const { firstClickedId } = this.state;
        const curId = key !== this.state.secondClickedId ? key : null;
        this.queryChildrens([firstClickedId, curId]).then(() => {
            this.setState({
                secondClickedId: curId
            })
        })
    };

    render() {
        const { Jobs, firstClickedId, secondClickedId } = this.state;
        const { vendorCode } = this.props;

        return (
            <ul className={styles.job_container}>
                {
                    Jobs && Jobs.map(item => {
                        return <li key={item.code} className={styles.job_item}>
                            <h3 className={[styles.first_ele_title, item.code == firstClickedId ? styles.jobclicked : ''].join(" ")} onClick={() => this.changeFirstIndex(item.code)}>
                                {item.name}
                            </h3>
                            {
                                item.children && item.children.map(ele => {
                                    return <div key={ele.code}>
                                        <div>
                                            <p
                                                className={[
                                                    styles.second_ele_title,
                                                    item.code == firstClickedId ? styles.active : '',
                                                    ele.code == secondClickedId ? styles.jobclicked : ''
                                                ].join(' ')}
                                                onClick={() =>
                                                    this.changeSecondIndex(ele.code)}
                                            >{ele.name}</p>
                                        </div>
                                        <ul>
                                            {ele.children && ele.children.map(a => {
                                                return <li key={a.code}
                                                    onClick={
                                                        this.props.jobClick ?
                                                            () => this.props.jobClick([item.code, ele.code, a.code], a.name, a.level) :
                                                            null
                                                    }
                                                    className={[styles.third_item, ele.code == secondClickedId ? styles.active : ''].join(' ')}>
                                                    <div className={styles.level_title}>{a.name}</div>
                                                    {a.illRiskValue && <div className={styles.level}>{a.illRiskValue + '类'}</div>}
                                                </li>
                                            })}
                                        </ul>
                                    </div>
                                })
                            }
                        </li>
                    })
                }
            </ul>
        )
    }

}


export default JobFx;
