import React, { useState, useEffect, useCallback,useRef } from 'react';
import styles from './index.scss';
import WxSdk from '@/utils/wx-sdk';
import utils from '@/utils/utils';
import PPBLoading from '@/components/Loading/loading.js';
import * as requestMethodsAutomobile from '@/services/publicAutomobile';
import { Toast } from 'antd-mobile-v5';
import request from '@/utils/request';
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';

function Index(props) {
  const { required = false, title = '', fileType = '', defaultOSSKey = '', OSSSettings, onSuccess } = props;
  const [currBg, setCurrBg] = useState('');
  const [OSSKey, setOSSKey] = useState(defaultOSSKey);
  const viewerRef = useRef();
  const photoRef = useRef();
  useEffect(() => {
    if (OSSKey) displayImage(OSSKey);
    viewerRef.current = new Viewer(photoRef.current, {
      inline: false,
      navbar: false,//不显示下方画廊
      title: false,//不显示下方标题
      toolbar: {
        oneToOne: true,
        zoomIn: true,
        zoomOut: true,
        reset: true,
        rotateLeft: true,
        rotateRight: true,
        flipHorizontal: true,
        flipVertical: true
      },
    });
  }, []);

  const displayImage = (key, callback = false) => {
    if(key.startsWith('http')){
      setCurrBg(key);
      return;
    }
    requestMethodsAutomobile.getOSSUrl(key)
      .then(res => {
        setCurrBg(res.data);
        callback && onSuccess && onSuccess(key);
        viewerRef.current.update();
      })
  }

  return <div className={styles.photoCon} >
    <div className={styles.photoContent}>
      <img ref={photoRef} className={styles.photoBg} src={currBg || require('../../../assets/images/default.png')} />
    </div>
    <div className={styles.titleCon}>{required && <span>*</span>}{title || ''}</div>
  </div>
}
export default Index;
