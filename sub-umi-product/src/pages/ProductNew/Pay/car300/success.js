/**
 * title: 承保完成
 */
 import React, { Component } from 'react';
 import { connect } from 'dva';
 import { Toast } from 'antd-mobile';
 import routerTrack from '@/components/routerTrack';
 import styles from './index.scss';
 
 @routerTrack({ id: 'page40' })
 @connect(({ commonOrder, loading }) => ({
     commonOrder,
     loading: loading.models.commonOrder
 }))
 class Index extends Component {
     constructor(props) {
         super(props);
         this.state = {
            detail: {},
        }
     }
 
     componentDidMount() {
         Toast.loading('正在查询保单，请稍等', 0);
         this.queryDetail()
     }

     queryDetail = () =>{
        const { location: { query: { orderNo } }, dispatch } = this.props;
        dispatch({
            type: 'commonOrder/queryPolicyDetail',
            payload: { policyId: orderNo },
            toast: false
        }).then(res => {
            if(res && res.code == 0){
                console.log(Boolean(res.payload.policyNo))
                if(res.payload.policyNo){
                    this.props.trackStop(false);
                    this.setState({
                        detail:{
                            ...res.payload,
                            productName:localStorage.ppb_visting_productName
                        }
                    },()=>{
                        Toast.hide();
                    })
                }else{
                    setTimeout(() => {
                        this.queryDetail()
                    }, 1000);
                }
            }
        })
     }
 
     componentWillUnmount() {
     }
 
     render() {
         const success = true;
         const { detail, detail: { applicant = {}, insurants = [] } = {}  } = this.state
         return (
             <div className={styles.payback_detail}>
                 <div className={styles.order_detail}>
                     <div className={styles.order_item}><span>保单号</span><span>{detail.policyNo}</span></div>
                     <div className={styles.order_item}><span>产品</span><span>{detail.productName}</span></div>
                     <div className={styles.order_item}><span>保费</span><span>{detail.premium}</span></div>
                     <div className={styles.order_item}><span>投保人</span><span>{applicant.name}</span></div>
                 </div>
                 <div className={styles.result}>
                     <img src={require(`@/assets/icon/${success ? 'paysuccess' : 'fail'}.svg`)} alt="" />
                     <p>承保完成</p>
                 </div>
             </div>
         );
     }
 }
 
 export default Index;
 