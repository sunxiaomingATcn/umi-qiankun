
import styles from './index.scss';
import React, { useState, useEffect,forwardRef,useImperativeHandle } from 'react';

function checkIsBottom() {
  var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;;

  //变量scrollTop是滚动条滚动时，滚动条上端距离顶部的距离
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

  //变量windowHeight是可视区的高度
  var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;

  //变量scrollHeight是滚动条的总高度（当前可滚动的页面的总高度）
  var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

  //滚动条到底部
  if (scrollTop + windowHeight >= scrollHeight) {
    return true;
  }
  return false;
}
function Bottom(props,ref) {
  const [isBottom, setIsBottom] = useState(false);
  useEffect(() => {
    setIsBottom(checkIsBottom());
    window.onscroll = function (e) {
      setIsBottom(checkIsBottom());
    };
    return function cleanup() {
      window.onscroll = null;
    }
  }, [])
  useImperativeHandle(ref, () => ({
    refresh(){
      setIsBottom(checkIsBottom());
    }
  }))

  const { children } = props;
  return <div className={isBottom ? styles.cardConBottom : styles.cardCon}>
    {children}
  </div>
}

export default forwardRef(Bottom);