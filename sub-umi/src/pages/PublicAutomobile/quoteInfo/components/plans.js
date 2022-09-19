import React, { useState, useEffect, useCallback } from 'react';
import { Toast, Checkbox, List, Switch, Space, Input, DatePicker, Mask, Radio, Picker } from 'antd-mobile-v5';
import styles from '../index.scss';
import Line from '../../components/line';

const idArr = [
  '1000000000000000029',//交强险
  '1000000000000000001',//车损险
  '1000000000000000010',//三者险
  '1000000000000000016',//司机责任险
]

//方案条目组件
const PlanItem = (props) => {
  //动态渲染方案需要的state
  const [planState, setPlanState] = useState({});
  const switchPlanPicker = (plan = {}, show = false) => {
    setPlanState((preState) => {
      return {
        ...preState,
        [`${plan.id}`]: show
      }
    });
  };
  const { plan,parent={}, onChange } = props;
  let defaultValue = plan.checked;
  //车船税与交强险保持一致
  if(plan.riskName === '车船税')defaultValue = parent.checked==='投保'?'代缴':'不代缴';

  const arrowImg = <img style={{ width: '.12rem', height: '.22rem', marginLeft: '.14rem' }} src={require('../../images/form-arrow.png')} />;
  return <List.Item
    arrow={props.disabled?<div/>:arrowImg}
    onClick={() => {
      if (props.disabled) return;
      switchPlanPicker(plan, true);
    }}
    extra={<Picker
      columns={[plan.options.map(option => {
        return {
          label: option.optionValue,
          value: option.optionValue
        }
      })]}
      value={[defaultValue]}
      visible={planState[plan.id] && !props.disabled}
      onClose={() => {
        switchPlanPicker(plan, false);
      }}
      onConfirm={(value, item) => {
        try{
          if(value && value[0] && value[0] !== defaultValue )onChange && onChange(value);
        }catch(e){
          console.log(e)
        }
        switchPlanPicker(plan, false);
      }}
    >
      {value => {
        return (
          <span
            className={props.isMain ? styles.mainSpan : styles.noMainSpan}
            style={{ color: value && value.length > 0 ? props.isMain ? '#437DFF' : '#5E6C84' : '#ccd0d8' }}
          >
            {value && value[0] ? value[0]?.label : '请选择'}
          </span>
        )
      }}
    </Picker>}>{plan.shortName}</List.Item>
}

//方案组件
const Plans = (props) => {
  const { data, onChange } = props;
  const [plans, setPlans] = useState(data);

  useEffect(() => {
    setPlans(data);
  }, [data]);

  const handleChange = (value, planChild, plan) => {
    console.log('[handleChange]', value, planChild, plan);
    let changeItem = plans.find(item => item.id === plan.id);
    if (planChild) {
      let changeChild = changeItem.child.find(item => item.id === planChild.id);
      changeChild.checked = value[0];
    } else {
      changeItem.checked = value[0];
      if (changeItem.checked === '不投保') {
        const changeChild = (parent)=>{
          if(!parent.child){
            return;
          }
          parent.child = parent.child.map(child => {
            const option = child.options?.find(item => item.optionKey === '0');
            return {
              ...child,
              checked: option.optionValue
            }
          });
        }
     
        if(!checkHasMain()){
          //没有商业险把所有的选项改为不投保
          plans.forEach(plan=>{
            plan.checked = plan.options?.find(item => item.optionKey === '0')?.optionValue
            changeChild(plan);
          })
        }else{
          changeChild(changeItem);
        }
      }
    }
    setPlans([...plans]);
    onChange && onChange(plans);
  }

  const checkHasMain = () =>{
    const mainPlan = plans.find(item=>idArr.includes(item.id) && item.checked !=='不投保');
    return !!mainPlan;
  };
  

  return plans.map((plan, index) => {

    //有商业险主险才能选条款
    const disMainPlan = !checkHasMain() && !idArr.includes(plan.id);

    return <div key={plan.id}>
      <PlanItem isMain={true} fontWeight='' plan={plan} onChange={(itemValue) => {
        handleChange(itemValue, null, plan)
      }} disabled={disMainPlan} />
      <div className={styles.subCon}>
        {plan.child && plan.child.map((child) => {
          return <PlanItem disabled={plan.checked === '不投保' || child.riskName==='车船税'} onChange={(childItemValue) => {
            handleChange(childItemValue, child, plan)
          }} key={child.id} plan={child} parent={plan}/>
        })}
      </div>
      {index !== plans.length - 1 && <Line add='.6rem' offset='.3rem' marginTopAndBottom='.2rem' />
      }
    </div>
  })
}

export default Plans;