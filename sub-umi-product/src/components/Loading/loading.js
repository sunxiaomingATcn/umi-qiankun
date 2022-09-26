
import styles from './loading.scss';
import React from 'react';
import ReactDOM from 'react-dom';
const rootDom = document.getElementById('root');
const show = (index) => {
  let keyboardDiv = document.getElementById('ppbLoadingCon');
  if (!keyboardDiv) {
    keyboardDiv = document.createElement('div');
    keyboardDiv.id = 'ppbLoadingCon';
    keyboardDiv.className = 'ppbLoadingCon';
    keyboardDiv.addEventListener('touchmove', function (e) {
      e.preventDefault();
    }, false);
    rootDom.appendChild(keyboardDiv);
    document.body.addEventListener('touchstart', function () { });
    // ReactDOM.render(<div className='loader13'>
    // <svg width="30px" height="30px" fill="#5B8EFF" viewBox="0 0 30 30">
    //   <circle cx="4" cy="4" r="4" />
    //   <circle cx="4" cy="26" r="4" />
    //   <circle cx="26" cy="4" r="4" />
    //   <circle cx="26" cy="26" r="4" />
    // </svg>  </div>, keyboardDiv);
    ReactDOM.render( <div className={styles['line-scale-pulse-out']}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>, keyboardDiv);
  }
}

const hide = () => {
  const keyboardDiv = document.getElementById('ppbLoadingCon');
  if (keyboardDiv) {
    ReactDOM.unmountComponentAtNode(keyboardDiv);
    rootDom.removeChild(keyboardDiv);
  }
}


export default {
  show,
  hide
};