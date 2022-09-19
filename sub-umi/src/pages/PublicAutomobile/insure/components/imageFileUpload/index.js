import React, { useState, useEffect, useCallback } from 'react';
import styles from './index.scss';
import WxSdk from '@/utils/wx-sdk';
import utils from '@/utils/utils';
import PPBLoading from '@/components/Loading/loading.js';
import * as requestMethodsAutomobile from '@/services/publicAutomobile';
import { Toast } from 'antd-mobile-v5';
import request from '@/utils/request';
import { CloseCircleFill } from 'antd-mobile-icons'
const DEFAULT = require('../../images/default.png');
const GOBACK = require('../../images/goBack.png');
const GOFRONT = require('../../images/goFront.png');
const IDBACK = require('../../images/idBack.png');
const IDFRONT = require('../../images/idFront.png');
const CLOSE = require('../../../images/close.png');

const ALL_BG = {
  '3': GOFRONT,
  '4': GOBACK,
  '0': IDFRONT,
  '1': IDBACK,
  '25': IDFRONT,
  '26': IDBACK,
  '28': IDFRONT,
  '29': IDBACK,
}



function Index(props) {
  const { required = false, title = '', fileType = '', defaultOSSKey = '', OSSSettings, onSuccess,onDelete } = props;
  const [currBg, setCurrBg] = useState('');
  const [OSSKey, setOSSKey] = useState(defaultOSSKey);
  useEffect(() => {
    if (OSSKey) displayImage(OSSKey);
  }, []);

  const displayImage = (key, callback = false) => {
    requestMethodsAutomobile.getOSSUrl(key)
      .then(res => {
        setCurrBg(res.data);

        callback && onSuccess && onSuccess(key);
      })
  }

  const onCloseClick = (e) =>{
    e.stopPropagation();
    setCurrBg('');
    onDelete && onDelete();
  }

  const onUploadClick = () => {
    if (!OSSSettings) {
      Toast.show('未获取到上传信息');
      return;
    }
    WxSdk.chooseImage(res => {
      let { localIds } = res;
      WxSdk.getLocalImgData(res => {
        PPBLoading.show();
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
        utils.compressCanvasWithPromise(imageBase64, 1440).then(res => {
          const fileName = new Date().getTime() + '.jpg';
          const osskey = OSSSettings.dir + fileName;
          let formData = new FormData();

          formData.append('success_action_status', 200);
          formData.append('key', osskey);
          formData.append('OSSAccessKeyId', OSSSettings.accessid);
          formData.append('policy', OSSSettings.policy);
          formData.append('signature', OSSSettings.signature);
          formData.append('callback', OSSSettings.callback);
          formData.append('file', utils.dataURLtoFile(imageBase64, fileName));
          request(OSSSettings.host, {
            method: 'POST',
            body: formData
          }).then(() => {
            displayImage(osskey, true);
          }).finally(() => {
            PPBLoading.hide();
          });
        }).catch(e => {
          PPBLoading.hide();
        });
      }, localIds);
    });
  };

  return <div className={styles.photoCon} >
    <div className={styles.photoContent} onClick={onUploadClick}>
      {currBg && <CloseCircleFill  onClick={onCloseClick} className={styles.close}/>}
      <img className={styles.photoBg} src={currBg || ALL_BG[fileType] || DEFAULT} />
      {currBg ? <div className={styles.reUpload} >
        <span>重新上传</span>
      </div> : <div className={styles.upload}>
        <img src={require('../../images/action.png')} />
      </div>}
    </div>
    <div className={styles.titleCon}>{required && <span>*</span>}{title || ''}</div>
  </div>
}
export default Index;
