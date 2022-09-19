
import styles from './automobileNum.scss';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';
import { Toast } from 'antd-mobile-v5';

const proviceArr = ['京', '津', '渝', '沪', '冀', '晋', '辽', '吉', '黑', '苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '琼', '川', '贵', '云', '陕', '甘', '青', '蒙', '桂', '宁', '新', '藏']
const normalArr = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'DEL',
  'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'CONFIRM',
];

function isDisabledItem(numIndex, item) {
  if (numIndex === 0) {
    return false;
  } else if (numIndex === 1) {
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'I', 'O'].includes(item);
  } else {
    return ['I', 'O'].includes(item);
  }
}

/**键盘组件*/
function AutomobileKeyboard(props) {
  const { numIndex, onKeyboardClick, alias=[] } = props;

  const onProviceItemClick = (e, item) => {
    if (isDisabledItem(numIndex, item)) {
      return;
    }
    onKeyboardClick && onKeyboardClick(item.name, numIndex);
  };
  const onNormalItemClick = (e, item) => {
    if (isDisabledItem(numIndex, item)) {
      return;
    }
    onKeyboardClick && onKeyboardClick(item, numIndex);
  };
  const isProvince = numIndex === 0;

  return <div id='ppbKeyboard' className={styles.keyboard}>
    <div className={styles.proviceBoard} style={{ display: isProvince ? 'flex' : 'none' }}>
      {alias && alias.map((item, index) => {
        return <div key={index} onClick={(e) => onProviceItemClick(e, item)} className={styles.proviceItem}>
          <span>{item.name}</span>
        </div>
      })}
    </div>
    <div className={styles.normalBoard} style={{ display: isProvince ? 'none' : 'flex' }}>
      {normalArr && normalArr.map((item, index) => {
        let itemClassName = styles.normalItem;
        let text = item;
        if (item === 'CONFIRM') {
          itemClassName = styles.confirmItem;
          text = '确定';
        } else if (item === 'DEL') {
          text = <img className={styles.normalImg} src={require('./images/del.png')} />
        } else if (isDisabledItem(numIndex, item)) {
          itemClassName = styles.disabledItem;
        }
        return <div key={index} onClick={(e) => onNormalItemClick(e, item)} className={itemClassName}>
          <span>{text}</span>
        </div>
      })}
    </div>
  </div>
}

/**车牌号组件*/
function AutomobileNum(props, ref) {

  const [data, setData] = useState([]);
  const [provCode, setProvCode] = useState();
  const { alias=[] } = props;

  const changeCurrProv = (toProvCode)=>{
    if(toProvCode && alias && alias.length>0){
      let newItem = {value:alias.find(item=>item.code == toProvCode)?.name,sel:false};
      let newData = [...data];
      newData[0] = newItem;
      setData(newData);
      props.onChange && props.onChange(newData);
    }else{
      setProvCode(toProvCode);
    }
    
  }
  useImperativeHandle(ref, () => ({
    changeProv(toProvCode){
      changeCurrProv(toProvCode);
    },
    checkNum(e) {
      return new Promise((resolve, reject) => {
        // let hasEmpty = false;
        // let newData = data.map((item, index) => {
        //   const showError = !item.value && index !== data.length - 1;
        //   if (showError) hasEmpty = true;
        //   return {
        //     ...item,
        //     showError:false
        //   }
        // })
        let emptyIndex = data.findIndex((item,index)=>{
          return !item.value && index !== data.length - 1;
        })

        if (emptyIndex && emptyIndex !== -1) {
          // setData(newData);
          onItemClick(e,emptyIndex);
          reject('车牌号未完整录入')
          return;
        } else {
          //转换为字符串
          let result = data.map(item=>item.value).join("");
          resolve(result)
        }
      })
    }
  }))

  useEffect(()=>{
    if(provCode){
      changeCurrProv(provCode);
      setProvCode(undefined);
    }
  },[props.alias]);

  useEffect(() => {
    let newData = Array.from({ length: 8 })
      .map((item, index) => {
        return { value: '', sel: false }
      });
    const { data: oriData } = props;
    if (oriData) {
      newData = [
        ...oriData,
        ...newData
      ].slice(0, 8);
    }
    setData(newData);

    document.addEventListener("click", event => {
      var cDom = document.getElementById("ppbKeyboardcon");
      if (cDom) {
        var tDom = event.target;
        if (cDom == tDom || cDom.contains(tDom)) {
        } else {
          closekeyboard();
        }
      }
    });

  }, [props.data]);
  const rootDom = document.getElementById('root');

  const onKeyboardClick = (item, numIndex) => {
    // console.log('[onKeyboardClick]', data);
  
    if (item === 'CONFIRM') {
      closekeyboard();
      return;
    }
    if (item === 'DEL') {
      setData(preData => {
        const finalData = preData.map((numItem, index) => {
          return {
            ...numItem,
            value: index === numIndex ? '' : numItem.value,
            sel: index === numIndex - 1
          }
        });
        props.onChange && props.onChange(finalData);
        return finalData;
      });
      showKeyboard(numIndex - 1);
      return;
    }
    setData(preData => {
      const finalData = preData.map((numItem, index) => {
        return {
          ...numItem,
          value: index === numIndex ? item : numItem.value,
          sel: index === (numIndex + 1 > 7 ? 7 : numIndex + 1)
        }
      });
      props.onChange && props.onChange(finalData);
      return finalData;
    });
    if (numIndex >= 7) {
      return;
    }
    showKeyboard(numIndex + 1);
  };

  const showKeyboard = (index) => {
    if(!alias || alias.length === 0){
      Toast.show('所属机构未配置车险报价渠道');
      return;
    }
    let keyboardDiv = document.getElementById('ppbKeyboardcon');
    if (!keyboardDiv) {
      keyboardDiv = document.createElement('div');
      keyboardDiv.id = 'ppbKeyboardcon';
      rootDom.appendChild(keyboardDiv);
      document.body.addEventListener('touchstart', function () { })
    }
    ReactDOM.render(<AutomobileKeyboard alias={alias} numIndex={index} onKeyboardClick={onKeyboardClick} />, keyboardDiv);
  }

  const closekeyboard = () => {
    const keyboardDiv = document.getElementById('ppbKeyboardcon');
    if (keyboardDiv) {
      ReactDOM.unmountComponentAtNode(keyboardDiv);
      rootDom.removeChild(keyboardDiv);
      setData(preData => {
        return preData.map((item) => {
          return {
            ...item,
            sel: false
          }
        })
      });
    }

  }
  const onItemClick = (e, index) => {
    //点击别的区域关闭键盘，这里必须住址，否则点击键盘也会关闭键盘
    e && e.nativeEvent && e.nativeEvent.stopImmediatePropagation();

    if(props.disabled){
      return;
    }
    let newData = [...data];
    setData(newData.map((oriItem, oriIndex) => {
      return {
        value: oriItem.value,
        sel: oriIndex === index
      }
    }));

    showKeyboard(index);
    if(props.bs){
      setTimeout(() => {
        const keyboardHeight = document.getElementById('ppbKeyboard')?.clientHeight;
        if(keyboardHeight){
          const dom = document.getElementById('ABN_CON');
          //滚动偏移量窗口高度-键盘高度-输入框高度
          let offset = window.innerHeight - keyboardHeight-dom.clientHeight;
          props.bs.scrollToElement(dom,500,0,-offset);
        }
      }, 800);
    }
  };

  const { disabled=false } = props;
  return (
    <div className={styles.wrapper}>
      <div className={styles.itemCon} id='ABN_CON'>
        {data && data.map((item, index) => {
          return <div key={index} onClick={(e) => onItemClick(e, index)} className={disabled?styles.itemDisabled: item.sel ? styles.itemSel : item.showError ? styles.itemError : styles.item}>
            {item.value ? <span>{item.value}</span> : index === 7 ?
              <div className={styles.energy}>
                <img src={disabled?require('./images/plus-grey.png'): require('./images/plus.png')} />
                <span>新能源</span>
              </div> : ''
            }
          </div>
        })}
      </div>
    </div>
  )
}

export default forwardRef(AutomobileNum);