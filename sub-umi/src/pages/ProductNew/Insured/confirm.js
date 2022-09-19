/**
 * title: 投保信息确认
*/
/**
* 投保人 => 投保信息确认页面
* from:'/productnew/insured', to:'收银台'
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast } from 'antd-mobile';
import ModalPopup from '@/components/modal/Popup';
import OrderContent from '@/pages/Order/components/ConfirmOrderContent';
import WxSDK from "@/utils/wx-sdk";
import miniProgramPays from '@/utils/miniProgramPays';
import iosnohistory from '@/utils/tool/iosnohistory';
import routerTrack from '@/components/routerTrack';
import FileRead from '../components/FileRead';
import { getFixValue } from '../assets/productConfig/judgeProductFeature';
import styles from '@/pages/Order/assets/order.less';

const car300 = localStorage.ppb_visting_productName == '机动车延长保修保险UAC' || localStorage.ppb_visting_productName == '人保驾乘意外险产品EAU'

@routerTrack({ id: 'page31' })
@connect(({ commonOrder, loading }) => ({
  commonOrder,
  loading: loading.models.commonOrder
}))
class confirm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      readChecked: true,
      modalPopupConfig: {
        visible: false
      },
      quoteRestrictGenes: null,
    };
  }

  componentDidMount() {
    new WxSDK().hideAllNonBaseMenuItem();
    this.initData();
    this.getQuote();
    this.initDocument();
  }

  componentWillUnmount() {
  }

  /**
   * 获取订单投保信息
   *  判断人身险/非车险 query没有type && 没有getFixValue('insuranceType')默认人身险
   * getFixValue('insuranceType') 是根据产品名写死的值
   * 1 非车, 2 => 人身险
   * */
  initData = async () => {
    const { location: { query: { purchaseOrderId, type } }, dispatch } = this.props;
    const insuranceType = type || getFixValue('insuranceType') == 1 ? 1 : undefined;
    await this.setState({
      insuranceType,
      isNon: !!(insuranceType == 1)
    });

    const { isNon } = this.state;
    Toast.loading('Loading...', 0);
    if (car300 || isNon) {
      // 非车详情
      dispatch({
        type: 'commonOrder/queryPolicyDetail',
        payload: { policyId: purchaseOrderId }
      })
    } else {
      // 人身险详情
      dispatch({
        type: 'commonOrder/queryDetail',
        payload: { id: purchaseOrderId }
      })
    }
  }

  // 获取报价因子
  getQuote = () => {
    const { quoteRecordId } = this.props.location.query;
    const { dispatch } = this.props;
    return quoteRecordId ? dispatch({
      type: 'productNew/queryQuoteDetail',
      payload: {
        id: quoteRecordId
      }
    }).then(res => {
      if (res && res.code === 0) {
        this.setState({
          quoteRestrictGenes: res.payload.restrictGenes
        });
      }
      return res;
    }) : null
  }

  // 获取缓存的投保须知等
  initDocument = () => {
    const { location: { query: { id: productId } } } = this.props;
    const insured_read_document = sessionStorage.getItem(`insured_read_document_${productId}`)
    if (insured_read_document) this.setState({ insured_read_document: JSON.parse(insured_read_document) })
  }

  /**
     * 阅读条款 begin
     * file {name:'',url:'',}
    */
  showFile = (file) => {
    this.setState({
      modalPopupConfig: {
        visible: true,
        title: file.name,
        content: <FileRead file={file} />
      }
    })
  }

  // 关闭文件弹窗
  closeFileModal = () => {
    this.setState({ modalPopupConfig: { visible: false } });
    this.timer && clearInterval(this.timer)
  }

  pay = async () => {
    const { dispatch, location: { query, query: { purchaseOrderId }, search }, commonOrder: { detail }, } = this.props;
    const { quoteRestrictGenes = [], insuranceType } = this.state;
    let toPayUrl = null;
    if (car300) {
      const insuredAmount = quoteRestrictGenes.filter(item => item.name === '保额')
      let params = {
        clientId: '1',
        productId: '2',//localStorage.product_id
        orderNo: purchaseOrderId,
        amount: detail && detail.premium * 100,
        productTitles: [
          {
            title: '产品名称',
            desc: localStorage.ppb_visting_productName,
          },
          {
            title: '基本保额',
            desc: insuredAmount[0].value,
          },
          {
            title: '投保人姓名',
            desc: detail.applicant.name,
          }
        ]
      }
      let payUrl = 'http://h.bedrock.chetimes.com'
      if (!(window.origin.includes('dev') || window.origin.includes('localhost'))) {
        payUrl = 'https://cc.chetimes.com'
        params.productId = '3'
      }
      let cmdString = JSON.stringify(params)
      console.log(cmdString)
      toPayUrl = `${payUrl}/pay-center/platform/redirectPayPage?cmdString=${cmdString}`
    } else {
      toPayUrl = await dispatch({
        type: 'commonOrder/getPaymentLink',
        payload: { ...query, orderId: purchaseOrderId, type: insuranceType }
      })
    }

    if (toPayUrl) {
      this.props.trackStop()
        .then(() => {
          miniProgramPays(toPayUrl); // 兼容小程序/h5支付
        })
    }
  }

  render() {
    const { readChecked, insured_read_document, modalPopupConfig, quoteRestrictGenes } = this.state;
    const { commonOrder: { detail }, location: { query: { plan } } } = this.props;
    console.log(detail, quoteRestrictGenes)
    return (
      <div className={styles.order_confirm}>
        <OrderContent data={detail} quote={quoteRestrictGenes} plan={plan} type='confirm' />
        <div className={[styles.reads].join(' ')}>
          <div
            className={[styles.radio, readChecked ? styles.checked : ''].join(' ')}
            onClick={() => this.setState({ readChecked: true })} />
          <div className={styles.insured_document_container}>
            我已认真阅读并同意
            {
              insured_read_document && insured_read_document.map((item) => {
                return <span key={item.name}
                  onClick={() => this.showFile(item)}
                >
                  《{item.name}》
                </span>
              })
            }
          </div>
        </div>
        <footer style={{ height: `${iosnohistory() ? 1.8 : 1.2}rem` }}>
          <div className={styles.orderFlexFooter}>
            <div className={styles.cost}><span>￥</span>{detail.premium}</div>
            <div className={styles.pay} onClick={this.pay}>支 付</div>
          </div>
        </footer>
        <ModalPopup
          popup
          closable
          animationType="slide-up"
          visible={modalPopupConfig.visible}
          title={modalPopupConfig.title}
          onClose={this.closeFileModal}
        >
          <div style={{ height: '8rem', overflow: 'auto', padding: '.2rem', marginBottom: '.3rem' }}>
            {modalPopupConfig.content}
          </div>
        </ModalPopup>
      </div>
    );
  }
}

export default confirm;
