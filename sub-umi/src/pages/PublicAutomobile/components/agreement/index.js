
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import styles from './index.scss';
import { Mask } from 'antd-mobile-v5';
import Agreements from './components';

const Agreement = (props, ref) => {
  const [visible,setVisible] = useState(false);
  const { type = '' } = props;
  useEffect(() => {
    setVisible(props.visible??false);
    const con = document.getElementById('ppb_agreement');
    if(props.visible && con){
      setTimeout(() => {
        con.children[1].scrollTo(0,0);
      }, 50);
    }
  }, [props.visible]);

  useEffect(() => {
  }, []);

  const {} = props;
  const maskProps = {
    style:{
      '--z-index':1001
    }
  }
  return <Mask {...maskProps} visible={visible} onMaskClick={()=>{}}>
    <div className={styles.con} id="ppb_agreement">
      <img src={require('../../images/close.png')} onClick={()=>{
        props.onClose && props.onClose();
        setVisible(false);
      }}/>
      {Agreements[type]||''}
    </div>
  </Mask>
}

export default forwardRef(Agreement);