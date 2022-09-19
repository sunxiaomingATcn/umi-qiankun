/**
 * title: 订单详情
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../../assets/detail.less';
import Upload from './imageFileUpload';
import * as requestMethodsAutomobile from '@/services/publicAutomobile';
const DEAFULT_FILES = [
  {
    "fileName": "投保人身份证正面照",
    "fileType": "28",
  },
  {
    "fileName": "投保人身份证反面照",
    "fileType": "29",
  },
  {
    "fileName": "行驶证正页照",
    "fileType": "3",
  },
  {
    "fileName": "行驶证副页照",
    "fileType": "4",
  },
]
@connect(({ carOrder, loading }) => ({
  carOrder,
  loading: loading.models.carOrder
}))
class detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      OSSSettings:undefined
    };
  }

  componentDidMount(){
    requestMethodsAutomobile.getOSSSettings()
    .then(res => {
      this.setState({
        OSSSettings:{...res}
      })
    })
  }

  render() {
    const { carOrder: { detail: { files = [] } } } = this.props;
    // files = DEAFULT_FILES;
    const { OSSSettings}= this.state;
    return (<div className={styles.detailContainer}>
      {
        <div className={styles.uploadCon}>
          {files.map(item => {
            return <Upload OSSSettings={OSSSettings}
              key={item.fileType}
              fileType={item.fileType}
              title={item.fileName}
              defaultOSSKey={item.url} />
          })}
        </div>
      }
      {!!(files.length == 0) && <p className={styles.nodata}>
        <img src={require('../../assets/images/empty.png')} />
        <p>暂无影像</p>
      </p>}
    </div>
    );
  }
}

export default detail;