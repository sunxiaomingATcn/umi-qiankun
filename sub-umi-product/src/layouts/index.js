import React from 'react';
// import styles from './index.css';
// import Animate from './animate';


function BasicLayout(props) {
  return (
    <div className='container'>
      { props.children }
    </div>
  );
}

export default BasicLayout;
