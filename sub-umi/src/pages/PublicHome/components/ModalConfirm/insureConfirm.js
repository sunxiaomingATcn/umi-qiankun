
import styles from './insureConfirm.scss';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Mask } from 'antd-mobile-v5';
import utils from '@/utils/utils';
import { set } from 'core-js/core/dict';


function confirm(params) {
  const Wrapper = (props) => {
    const [visible, setVisible] = useState(true);
    const [second, setSecond] = useState(5);
    const timerRef = useRef();
    //闭包陷阱
    const tick = (currentSec) => {
      timerRef.current = setTimeout(() => {
        console.log('[tick]', currentSec);
        const nextSec = currentSec - 1;
        if (nextSec > 0) {
          tick(nextSec);
        }
        setSecond(nextSec);
      }, 1000);
    }
    useEffect(() => {
      tick(second);
    }, []);

    return <Mask visible={visible} onMaskClick={() => { }}>
      <div className={styles.overlayContent}>
        {props.title && <div className={styles.title}>{props.title}</div>}
        <div className={styles.content}>{props.content ?? ''}</div>
        <div className={styles.footer} style={{ justifyContent: props.showCancel ? 'space-between' : 'center' }}>
          {props.showCancel && <div onClick={() => {
            props.onCancel && props.onCancel();
            timerRef.current && clearTimeout(timerRef.current)
            setVisible(false);
          }} className={styles.cancel}>{props.cancelText ?? '取消'}</div>}

          <div onClick={() => {
            if (second === 0) {
              props.onConfirm && props.onConfirm();
              timerRef.current && clearTimeout(timerRef.current)
              setVisible(false);
            }
          }} className={styles.ok}>{second > 0 && `(${second})`}{props.confirmText ?? '确定'}</div>
        </div>
      </div>
    </Mask>
  }

  utils.renderToBody(<Wrapper {...params} />)

}

export default {
  show: confirm
};