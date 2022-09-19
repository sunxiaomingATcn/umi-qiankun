/**
 * title: 手机号登录
 */
 import React, { Component } from 'react';
 import styles from './index.scss';
 import { Toast, InputItem, Checkbox } from 'antd-mobile';
 import utils from '@/utils/utils';
 class Index extends Component {
   constructor(props) {
     super(props);
     this.state = {
     };
   }
 
   componentDidMount() {
     if(window.location.hash){
       let arr = window.location.hash.split('?');
       if(arr.length === 2){
         let str = arr[1];
         window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?${str}`;
       }else{
         console.log('错误的hash')
       }
     }else{
      console.log('路径错误')
     }
   }
 
   componentWillUnmount() {
   }
 
 
 
   render() {
 
     return (
       <div>
       </div>
     );
   }
 }
 
 export default Index;
 