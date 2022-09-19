
import styles from './index.scss';
function line(props) {
  const styleObj = {
    paddingLeft: props.padding||0,
    paddingRight:props.padding||0,
    width:props.add?`calc(100% + ${props.add} )`:'100%',
    marginLeft: props.offset?`-${props.offset}`:'0',
    marginTop: props.marginTop?props.marginTop:props.marginTopAndBottom?props.marginTopAndBottom:'0',
    marginBottom: props.marginBottom?props.marginBottom: props.marginTopAndBottom?props.marginTopAndBottom:'0',
  };
  return <div className={styles.lineCon} style={{...styleObj}}>
    <div className={styles.realLine}></div>
  </div>
}

export default line;