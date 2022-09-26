/**
 * title: 影像上传
 */

import React, { Component } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import Utils from '@/utils/utils';
import ImagePicker from '@/components/IDImageUpload';
import routerTrack from '@/components/routerTrack';
import WxSDK from '@/utils/wx-sdk';
import styles from './assets/upload.less';

@routerTrack({ id: 'page21' })
@connect(({ login, productNew, loading, insuredNew }) => ({
  login,
  productNew,
  insuredNew,
  loading: loading.effects['productNew/queryProductInfo', 'productNew/queryQuote']
}))
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkWxApiOk: Utils.isWeiXin()
    };
  }

  componentDidMount() {
    new WxSDK({
      configErrorCallback: () => {
        this.setState({ checkWxApiOk: false })
      }
    });
  }

  componentWillUnmount() {
  }

  submit = () => {
    const { idObverse, idReverseSide } = this.state;
    const { dispatch, location: { query: { purchaseOrderId, id: productId } } } = this.props;
    Toast.loading("Loading...", 0)
    dispatch({
      type: 'insuredNew/submitInsure',
      payload: {
        params: {
          purchaseOrderId,
          images: [
            {
              name: "idCardA",
              value: idObverse
            },
            {
              name: "idCardB",
              value: idReverseSide
            }
          ],
          tracebackCode: localStorage.getItem('uuid')
        }
      }
    }).then(res => {
      if (res && res.code === 0) {
        Toast.hide();
        // 投保确认页
        history.push({
          pathname: '/productnew/insured/confirm',
          query: {
            id: productId,
            purchaseOrderId,
          }
        })
      } else {
        res && Toast.info(res.message, 2);
      }
    })
    console.log("idObverse, idReverseSide", idObverse, idReverseSide)
  }

  render() {
    const { checkWxApiOk, idObverse, idReverseSide } = this.state;
    return (<div className={styles.uploadIdCard}>
      <h3>请上传影像资料</h3>
      <div>
        <div className={styles.IdCardImage}>
          <p className={styles.imageTitle}>身份证正面</p>
          <ImagePicker checkWxApiOk={checkWxApiOk} type="idObverse" onChange={(base64) => { this.setState({ idObverse: base64 }) }} />
          <p className={styles.imageDes}>点击拍摄/上传<span>人像面</span></p>
        </div>
        <div className={styles.IdCardImage}>
          <p className={styles.imageTitle}>身份证反面</p>
          <ImagePicker checkWxApiOk={checkWxApiOk} type="idReverseSide" onChange={(base64) => { this.setState({ idReverseSide: base64 }) }} />
          <p className={styles.imageDes}>点击拍摄/上传<span>国徽面</span></p>
        </div>
      </div>
      {(idObverse && idReverseSide) && <div className={styles.submit} onClick={this.submit}>确认上传</div>}
    </div>
    );
  }
}

export default index;
