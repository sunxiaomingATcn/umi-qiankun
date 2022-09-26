import styles from './spot.less';

// export default () => <span className={styles.loader6}>
//   <svg width="38px" height="10px" viewBox="0 0 38 10" >
//     <circle fill="#3A3A3A" cx="4" cy="5" r="4"></circle>
//     <circle fill="#3A3A3A" cx="19" cy="5" r="4"></circle>
//     <circle fill="#3A3A3A" cx="34" cy="5" r="4"></circle>
//   </svg>
// </span>
export default () => <span className={styles['ball-pulse-sync']}>
  <div></div>
  <div></div>
  <div></div>
</span>