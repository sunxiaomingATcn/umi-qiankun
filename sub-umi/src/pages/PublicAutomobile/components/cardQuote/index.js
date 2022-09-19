
import styles from './index.scss';
function card(props) {
  const { children, leftExtra, rightExtra, onLeftExtraClick = () => { }, onRightExtraClick = () => { }, noTitle = false, noContent = false } = props;
  return <div className={styles.cardCon} style={{paddingBottom:noContent?'0':'.3rem'}}>
    {!noTitle && <div className={noContent?styles.titleConNoContent:styles.titleCon}>
      <div onClick={onLeftExtraClick}>{leftExtra}</div>
      <div className={styles.rightExtra} onClick={onRightExtraClick}>{rightExtra}</div>
    </div>}
    {!noContent &&
      <div className={styles.contentCon}>
        {children}
      </div>
    }

  </div>
}

export default card;