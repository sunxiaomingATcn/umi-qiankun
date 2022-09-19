/**
 * title: 产品下架说明
 */
import React, { Component } from 'react';
import styles from './index.scss'
import callService from '@/assets/commonData/callService';
import { history } from 'umi';

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {

    }

    render() {

        return (
            <div className={styles.productguide}>
               <p>该产品已下架</p>
               <p className={styles.img}><img src={require('@/assets/productguide.png')}></img></p>
               <p className={styles.lookmore}><button onClick={()=>{history.push('/Home')}}>查看更多其他产品</button></p>
               <p className={styles.connect}><button onClick={()=>{callService()}}>联系客服</button></p>
            </div>
        );
    }
}

export default Index;
