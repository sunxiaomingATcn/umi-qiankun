/**
 * title: 个人信息
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, ActivityIndicator } from 'antd-mobile';
import styles from './info.scss';
import WxSdk from '@/utils/wx-sdk';
import * as requestMethods from '@/services/public';
import request from '@/utils/request';
import utils from '@/utils/utils';
import { history } from 'umi';

@connect(({ my }) => ({
  my,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.userInfo();
  }

  userInfo() {
    if (localStorage.loginData) {
      let loginData = JSON.parse(localStorage.loginData);
      requestMethods.queryUserDetail(loginData.userId).then(res => {
        if (res && res.code === 200) {
          console.log(res.data);
          this.setState({
            userInfo: res.data,
          });
        }
      });
    }
  }

  compressCanvas(base64, w, name) {
    let that = this;
    var newImage = new Image();
    var quality = 0.6; //压缩系数0-1之间
    newImage.src = base64;
    newImage.setAttribute('crossOrigin', 'Anonymous'); //url为外域时需要
    var imgWidth, imgHeight;
    newImage.onload = function() {
      imgWidth = this.width;
      imgHeight = this.height;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      if (Math.max(imgWidth, imgHeight) > w) {
        if (imgWidth > imgHeight) {
          canvas.width = w;
          canvas.height = (w * imgHeight) / imgWidth;
        } else {
          canvas.height = w;
          canvas.width = (w * imgWidth) / imgHeight;
        }
      } else {
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        quality = 0.6;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
      var base64 = canvas.toDataURL('image/jpeg', quality);
      localStorage.setItem(name, base64);
      that.props
        .dispatch({
          type: 'my/updateImage',
          payload: {
            headImgUrl: base64,
          },
        })
        .then(res => {
          if (res && res.code == 200) {
            that.userInfo();
          }
        });
    };
  }

  handClick() {
    const that = this;
    WxSdk.chooseImage(res => {
      let { localIds } = res;
      WxSdk.getLocalImgData(res => {
        const localData = res.localData;
        let imageBase64 = '';
        if (localData.indexOf('data:image') == 0) {
          //苹果的直接赋值，默认生成'data:image/jpeg;base64,'的头部拼接
          imageBase64 = localData;
        } else {
          //此处是安卓中的唯一得坑！在拼接前需要对localData进行换行符的全局替换
          //此时一个正常的base64图片路径就完美生成赋值到img的src中了
          imageBase64 = 'data:image/jpeg;base64,' + localData.replace(/\n/g, '');
        }
        that.compressCanvas(imageBase64, 200, 'WechatImage');
        imageBase64 = localStorage.getItem('WechatImage');
      }, localIds);
    });
  }

  render() {
    const { userInfo } = this.state;
    return (
      <div className={styles.info}>
        <div className={styles.avater}>
          <div className={styles.title}>头像</div>
          <div className={styles.avaterRight}>
            <img
              src={userInfo && userInfo.wechatImg}
              className={styles.image}
              onClick={() => {
                this.handClick();
              }}
            ></img>
            <img className={styles.arrow} src={require('../assets/img/arrow-right.png')} />
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.title}>工号</div>
          <div className={styles.value}>{userInfo && userInfo.account}</div>
        </div>
        <div className={styles.item}>
          <div className={styles.title}>姓名</div>
          <div className={styles.value}>{userInfo && userInfo.realName}</div>
        </div>
        <div className={styles.item}>
          <div className={styles.title}>职位</div>
          <div className={styles.value}>{userInfo && userInfo.entryName}</div>
        </div>
        <div className={styles.item}>
          <div className={styles.title}>所属机构</div>
          <div className={styles.value}>{userInfo && userInfo.mainDeptName}</div>
        </div>
        <div className={styles.item}>
          <div className={styles.title}>手机号</div>
          <div className={styles.value}>
            {userInfo && userInfo.phone}
            <span
              onClick={() => {
                history.push('/My/info/checkMobile');
              }}
              style={{ color: '#0065FF', marginLeft: '0.3rem' }}
            >
              更换
            </span>
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.title}>资格证</div>
          <div className={styles.value}>{userInfo && userInfo.licenseNumber}</div>
        </div>
      </div>
    );
  }
}

export default Index;
