
import styles from './index.scss';
function card(props) {
  const {hideContent=false, children, leftExtra, rightExtra, onLeftExtraClick = () => { }, onRightExtraClick = () => { }, noTitle = false } = props;
  return <div className={styles.cardCon} style={{paddingBottom:hideContent?'0':'.06rem'}}>
    {!noTitle && <div className={styles.titleCon}>
      <div onClick={onLeftExtraClick}>{leftExtra}</div>
      <div onClick={onRightExtraClick}>{rightExtra}</div>
    </div>}

    <div className={styles.contentCon} style={{display:hideContent?'none':'block'}}>
      {children}
    </div>
  </div>
}

export default card;