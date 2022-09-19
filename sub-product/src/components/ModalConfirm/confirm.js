
import styles from './confirm.scss';
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Mask } from 'antd-mobile-v5';
import utils from '@/utils/utils';


function confirm(params) {
  const Wrapper = (props) => {
    const [visible, setVisible] = useState(true);
    return <Mask disableBodyScroll={false} visible={visible} onMaskClick={() => { }}>
      <div className={styles.overlayContent}>
        {props.title && <div className={styles.title}>{props.title}</div>}
        <div className={styles.content}>{props.content ?? ''}</div>
        <div className={styles.footer} style={{justifyContent:props.showCancel?'space-between':'center'}}>
          {props.showCancel && <div onClick={() => {
            setVisible(false);
          }} className={styles.cancel}>{props.cancelText ?? '取消'}</div>}

          <div onClick={() => {
            props.onConfirm && props.onConfirm();
            setVisible(false);
          }} className={styles.ok}>{props.confirmText ?? '确定'}</div>
        </div>
      </div>
    </Mask>
  }

  utils.renderToBody(<Wrapper {...params} />)

}

export default {
  show: confirm
};