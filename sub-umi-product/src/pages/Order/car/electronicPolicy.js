/**
 * title: 电子保单
*/
import React, { Component } from 'react';
import { connect } from 'dva';
import PDFPage1 from '@/components/PdfView/Page1';
import styles from '../assets/electronicPolicy.less';
import FileViewer from 'react-file-viewer';
import OSSFile from '@/components/OSSFile';
import routerTrack from '@/components/routerTrack';

@routerTrack({ id: 'page-order-car-electronic', autoStart: false })
@connect(({ carOrder, loading }) => ({
  carOrder,
  loading: loading.models.carOrder
}))
class electronicPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
  }

  componentDidMount() {
    const { dispatch, location: { query: { orderId } } } = this.props;
    if (orderId) this.props.trackStart(orderId)
    dispatch({
      type: 'carOrder/getElectronic',
      payload: { orderId }
    }).then(async res => {
      if (res && res.code !== 200) {
        const { efcPdfUrl, bizPdfUrl } = res.data || {};
        this.setState({
          efcPdfKey: efcPdfUrl,
          bizPdfKey: bizPdfUrl,
          efcPdfUrl: efcPdfUrl && await OSSFile.getLink(efcPdfUrl),
          bizPdfUrl: bizPdfUrl && await OSSFile.getLink(bizPdfUrl)
        })
        console.log(res.data)
      }
    })
  }

  renderFile = (url) => {
    if (!url) return null;
    const link = url.split('?').shift();
    const index = link.lastIndexOf(".");
    const fileType = index > -1 ? link.substring(index + 1, link.length) : null;
    return fileType === "pdf" ?
      <PDFPage1
        data={{ path: url }}
      /> :
      <FileViewer
        fileType={fileType}
        filePath={url}
      />
  }

  render() {
    const { efcPdfKey, bizPdfKey, efcPdfUrl, bizPdfUrl } = this.state;
    return (
      <div className={styles.electronicPolicy}>
        {efcPdfUrl &&
          <a className={styles.policy} onClick={() => OSSFile.downLoadOss({ osskey: efcPdfKey })}>
            <div className={styles.policyImg}>
              {this.renderFile(efcPdfUrl)}
            </div>
            <p>交强险保单</p>
          </a>
        }
        {bizPdfUrl &&
          <a className={styles.policy} onClick={() => OSSFile.downLoadOss({ osskey: bizPdfKey })}>
            <div className={styles.policyImg}>
              {this.renderFile(bizPdfUrl)}
            </div>
            <p>商业险保单</p>
          </a>}
      </div>
    );
  }
}

export default electronicPolicy;