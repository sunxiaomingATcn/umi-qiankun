
import { Toast } from 'antd-mobile';
import React, { useEffect, useState, forwardRef, useImperativeHandle,useRef} from 'react';
import styles from './index.scss';
import Ring from './ring';
const Ball = (props, ref) => {
  const [disabled, setDisabled] = useState(false);
  const [go, setGo] = useState(false);
  const [ringFinished, setRingFinished] = useState(false);
  //complete 执行完成失败也算，showring 展示绿环，showsuccess展示右上完成图标， success 执行成功
  const {completed=false,showRing=false,showSuccess=false,success=false,top='50vh',upSize=".24rem" } = props;

  useEffect(() => {
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
    return function cleanup() {
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    }
  }, []);

  const completedRef = useRef();
  useEffect(()=>{
    setDisabled(props.disabled);
    completedRef.current = props.completed;
  },[props.disabled,props.completed])

  const handleMove = (e) => {
    if(completedRef.current){
      setTimeout(() => {
        setGo(true)
      }, 500);
    }
  };
  const handleEnd = (e) => {
    // setTimeout(() => {
    //   setGo(false)
    // }, 1000);
  };

  const {} = props;
  return <div style={{top:top}} onClick={() => {
    if(disabled){
      Toast.show('未查询到续保信息');
      return
    }
    props.onClick && !disabled && props.onClick();
  }} className={(disabled || go) ? styles.conDis : styles.con}>
    {(disabled) && <div className={styles.dis}></div>}
    <span style={{fontSize:upSize}}>{props.up ?? '续保'}</span>
    <span>{props.down ?? '查询'}</span>
    {
      completed && showSuccess && success && <img src={require('../../images/complete.png')} />
    }

    {(!ringFinished && !completed) && showRing && <Ring onFinish={() => {
      // setRingFinished(true)
    }}
    />
    }
  </div>
}

export default forwardRef(Ball);