/**投保*/
import { connect } from 'dva';
import React, { useState, useEffect, useCallback } from 'react';
import { List, Checkbox, Input, Switch, DatePicker, Picker, Toast, Space } from 'antd-mobile-v5';
import styles from './imageUpload.scss';
import { history } from 'umi';
import routerTrack from '@/components/routerTrack';
import Upload from './components/imageFileUpload';
import * as requestMethodsAutomobile from '@/services/publicAutomobile';
import utils from '@/utils/utils';

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
const { generalRequest } = utils;
function Index(props) {
  const { dispatch, publicautomobile: { preImageFiles = [], savedImageFiles = [] } } = props;

  const [OSSSettings, setOSSSettings] = useState();
  const [files, setFiles] = useState([]);
  useEffect(() => {
    document.title = '影像资料';
    props.trackStart(localStorage.quoteRes);
    requestMethodsAutomobile.getOSSSettings()
      .then(res => {
        setOSSSettings({ ...res });
        let result = [...DEAFULT_FILES];
        //有save优先save
        if (savedImageFiles && savedImageFiles.length > 0) {
          result = [...savedImageFiles];
        } else {
          //合并pre 与default
          if (preImageFiles && preImageFiles.length > 0) {
            let realDefault = DEAFULT_FILES.filter(item => {
              return !preImageFiles.find(pItem => pItem.fileType == item.fileType);
            });
            result = [...preImageFiles.map(item => {
              item.required = true;
              return item;
            }), ...realDefault];
          }
        }
        setFiles(result);
      })
  }, []);

  const goback = () => {
    //保存缓存
    let emptyItem = files.find(item => item.required && !item.url);
    if (emptyItem) {
      Toast.show(`请上传${emptyItem.fileName}`)
      return;
    }
    dispatch({
      type: 'publicautomobile/saveSavedImageFiles',
      payload: files,
    })
    history.goBack();
  }
  return <div className={styles.con}>
    <div style={{ width: '100%', height: '.2rem', background: '#F8F9F9' }}></div>
    <div className={styles.content}>
      <span className={styles.tips}>“<span style={{ color: '#DD0008' }}>*</span>”标记的影像为必传影像</span>
      <div className={styles.uploadCon}>
        {files.map(item => {
          return <Upload OSSSettings={OSSSettings}
            key={item.fileType}
            fileType={item.fileType}
            required={item.required}
            title={item.fileName}
            defaultOSSKey={item.url}
            onDelete={() => {
              item.url = '';
              setFiles(files);
            }}
            onSuccess={(OSSKey) => {
              item.url = OSSKey;
              setFiles(files);
            }} />
        })}

      </div>
    </div>
    <div className={styles.submit} onClick={goback}>确定</div>
  </div>
}

const routerTrackIndex = routerTrack({ id: 'pageSuccess', autoStart: false })(Index);

export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(
  routerTrackIndex,
);
