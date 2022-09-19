/**投保*/
import { connect } from 'dva';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createForm } from 'rc-form';
import { List, Checkbox, Input, Switch, DatePicker, Picker, Toast, Space, Result } from 'antd-mobile-v5';
import styles from './index.scss';
import utils from '@/utils/utils';

import { history } from 'umi';
import PPBLoading from '@/components/Loading/loading.js';
import Card from '../components/cardQuote';
import Bottom from '../components/bottom';
import Confirm from '@/components/ModalConfirm/insureConfirm'
import routerTrack from '@/components/routerTrack';
import Agreement from '../components/agreement';
import mzsms from '../components/agreement/components/mzsms';
import merge from 'lodash/merge';
import get from 'lodash/get';
import DynamicComponent from './indexDynamic';


import * as requestMethodsAutomobile from '@/services/publicAutomobile';
import moment from 'moment';
const { generalRequest } = utils;
//解决低版本ios最下面input弹出键盘造成页面上移问题
const changeScroll = () => {
  if (utils.isIOS()) {
    setTimeout(() => {
      const scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0
      window.scrollTo(0, Math.max(scrollHeight - 1, 0))
    }, 200)
  }
}

const inputProps = {
  style: {
    '--text-align': 'right',
    '--font-size': '.28rem',
    '--color': '#5e6c84',
    '--placeholder-color': '#ccd0d8',
  },
};
const listArrowProps = {
  arrow: (
    <img
      style={{ width: '.12rem', height: '.22rem', marginLeft: '.14rem' }}
      src={require('../images/form-arrow.png')}
    />
  ),
};
const checkboxProps = {
  style: {
    '--gap': '.16rem',
    '--icon-size': '.32rem'
  },
  icon: checked =>
    checked ? (
      <img src={require('../images/checked.png')} style={{ width: '.32rem', height: '.32rem' }} />
    ) : (
      <img src={require('../images/normal.png')} style={{ width: '.32rem', height: '.32rem' }} />
    ),
};

function Index(props) {
  const bottomRef = useRef();
  const [info, setInfo] = useState({});
  const { location: { query: { quoteResultId = "" } }, dispatch, publicautomobile: { savedImageFiles = [],preImageFiles=[],insureCache } } = props;
  const { getFieldProps, getFieldError, validateFields, setFieldsValue, getFieldValue, getFieldsValue, getFieldInstance } = props.form;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = '确认订单';

    if (utils.isIOS()) {
      //解决低版本ios点击屏幕其他地方input不失去焦点问题
      document.body.ontouchend = (e) => {
        if (e.target.className != 'adm-input-element') {
          const inputs = document.querySelectorAll('.adm-input-element');
          if (inputs && inputs.length > 0) {
            inputs.forEach(element => {
              element.blur();
            });
          }
        }
      }
    }

    props.trackStart(localStorage.quoteRes);
    let uploaded = savedImageFiles?.find(item=>item.url);
    setHasImageUploaded(!!uploaded);
    initArea();
    initData();
  }, []);

  const [areaList,setAreaList] = useState([]);
  const initArea = ()=>{
    dispatch({
      type: 'common/getTreeList',
    }).then(res => {
      if (res && res.code == 200) {
        setAreaList(res.data)
      }
    });
  }

  const initData = async () => {
    await initDynamicFields();
    generalRequest({ quoteResultId: quoteResultId }, requestMethodsAutomobile.persons)
      .then(res => {
        let result = res.data;
        if(insureCache){
          // result = {
          //   ...res.data,
          //   ...insureCache
          // }
          result = merge(res.data,insureCache);
        }
        setInfo(result);
        setFieldsValue(result);
        dispatch({
          type: 'publicautomobile/clearInsureCache',
        });
        setTimeout(() => {
          bottomRef.current.refresh();
        }, 0);
      })
  };
  const submit = () => {
    validateFields((error, values) => {
      console.log('[submit]', error, values);
      if (error) {
        let errorFieldName = '';
        for (let i = 0; i < orderKeys.length; i++) {
          let key = orderKeys[i];
          if (get(error, key)) {
            errorFieldName = key;
            break;
          }
        }
        let firstmsg = get(error, errorFieldName)?.errors[0]?.message;
        Toast.show(firstmsg);
        autoFocus(errorFieldName);
        return;
      }

      //校验影像
      if(preImageFiles.length>0){
        let imageError = preImageFiles.find(item=>{
          let errorItem = savedImageFiles.find(sItem=>{
            return sItem.fileType == item.fileType && (!sItem.url)
          })
          return !!errorItem || savedImageFiles.length==0;
        });

        if(imageError){
          console.log('[imageError]',preImageFiles,savedImageFiles,imageError)
          Toast.show('请补充完整影像信息');
          return;
        }
      }

      if (!values.checked) {
        Confirm.show({
          // title: '免责声明',
          content: mzsms,
          showCancel: true,
          cancelText: '暂不同意',
          confirmText: '同意',
          onConfirm: () => {
            setFieldsValue({
              checked: true
            })
          },
          onCancel: () => {
            setFieldsValue({
              checked: false
            })
          },
        })
        return;
      }

      const getSupply = (pre) => {
        const fieldArr = dynamicFieldsData[fMap[pre]];
        if (!fieldArr) return []
        let result = fieldArr.map(item => {
          let realValue = values?.[pre]?.[item.key];
          if(item.type == 'Address'){
            realValue = realValue[2]||'';
          }else if (realValue instanceof Date) {
            realValue = moment(realValue).format('YYYY-MM-DD')
          } else if (realValue instanceof Array) {
            realValue = realValue[0];
          }
          return {
            ...item,
            value: realValue
          }
        });
        return result;
      }
      let params = {
        owner: {
          ...info.owner,
          ...values.owner,
          supplyInfos: getSupply('owner')
        },
        insured: {
          ...info.insured,
          ...values.insured,
          supplyInfos: getSupply('insured')
        },
        policyHolder: {
          ...info.policyHolder,
          ...values.policyHolder,
          supplyInfos: getSupply('policyHolder')
        },
        supplyInfos: getSupply('other'),
        files: savedImageFiles.filter(item=>!!item.url),
        quoteResultId: quoteResultId
      }
      console.log(params);
      PPBLoading.show();
      generalRequest(params, requestMethodsAutomobile.commit)
        .then(res => {
          history.push('/PublicAutomobile/insure/success');
        })
        .finally(() => {
          PPBLoading.hide();
        })
    });
  };

  const getClassName = (fieldName) => {
    return getFieldError(fieldName) && currFocus !== fieldName ? 'ppberror' : '';
  }

  const [agreement, setAgreement] = useState({});

  const showAgreement = (type) => {
    setAgreement({
      type: type,
      show: true
    })
  };
  const [dynamicFieldsData, setDynamicFieldsData] = useState({
    applicantInfos: [],
    insuredInfos: [],
    ownerInfos: [],
  });

  const [orderKeys, setOrderKeys] = useState([]);
  const typeKeysState = useRef();
  /**初始化动态字段*/
  const initDynamicFields = async () => {

    let df = await generalRequest({ quoteResultId: quoteResultId }, requestMethodsAutomobile.getDynamicFields);
    // df.data = {
    //   ownerInfos: [
    //     {
    //       desc: '手机号码',
    //       key: 'mobile',
    //       type: 'Mobile',
    //       value: '13522588321',
    //     },
    //     {
    //       desc: '测试日期',
    //       key: 'testDate',
    //       type: 'Date',
    //       value: '2015-11-11',
    //     },
    //     {
    //       desc: '测试picker',
    //       key: 'testPicker',
    //       type: 'Select',
    //       option: [
    //         { text: "呵呵呵", value: "1" },
    //         { text: "哈哈哈", value: "2" },
    //       ],
    //       value: "1",
    //     },
    //     {
    //       desc: '测试地址',
    //       key: 'testAddress',
    //       type: 'Address',
    //       value: "",
    //     }
    //   ],
    //   applicantInfos: [
    //     {
    //       desc: '手机号码',
    //       key: 'mobile',
    //       type: 'Mobile',
    //       value: '13522588321',
    //     },
    //   ]
    // }
    if (!df.data || JSON.stringify(df.data) === '{}') {
      return;
    }
    setDynamicFieldsData({ ...df.data });
    let { applicantInfos = [], insuredInfos = [], ownerInfos = [], files = [],otherInfos=[] } = df.data;
    // files = [
    //   {
    //     "fileName": "投保人身份证正面照",
    //     "fileType": "28",
    //   }
    // ]
    if (files && files.length > 0) {
      dispatch({
        type: 'publicautomobile/savePreImageFiles',
        payload: [...files],
      });
    }
    let typeKeys = {};
    const fieldsConvert = (data, pre) => {
      return data.map(item => {
        //组合{'mobile':['owner.xxxx']}
        if (!typeKeys[item.type]) typeKeys[item.type] = [];
        const reusult = `${pre}.${item.key}`;
        typeKeys[item.type].push(reusult);
        return reusult;
      })
    }
    let policyHolderKeys = fieldsConvert(applicantInfos, 'policyHolder');
    let insuredKeys = fieldsConvert(insuredInfos, 'insured');
    let ownerKeys = fieldsConvert(ownerInfos, 'owner');
    let otherKeys = fieldsConvert(otherInfos, 'other');
    typeKeysState.current = { ...typeKeys };
    setOrderKeys([
      ...ownerKeys,
      ...policyHolderKeys,
      ...insuredKeys,
      ...otherKeys
    ])
  }

  const autoFocus = (errorFieldName) => {
    const ins = getFieldInstance(errorFieldName);
    setPickerVisibleObj((preObj) => {
      return {
        ...preObj,
        [errorFieldName]: true
      }
    });

    if (ins && ins.focus) {
      ins.focus();
    }
  }
  const [currFocus, setCurrFocus] = useState('');
  const dealBlur = (fieldName) => {
    setCurrFocus('');
    changeScroll();
    setTimeout(() => {
      setDropdwonVisibleObj(preData => {
        return {
          ...preData,
          [fieldName]: false
        }
      });
    }, 50);
  }
  const dealFocus = (fieldName, type, e) => {
    const targetValue = e.target.value;
    setCurrFocus(fieldName);
    if(!['Mobile','Email'].includes(type)){
      return;
    }
    let arr = typeKeysState.current[type];
    if (arr && arr.length > 0) {
      let result = [];
      arr.forEach(item => {
        const fV = getFieldValue(item);
        if (fV && !result.includes(fV)) result.push(fV);
      })
      result = result.filter(item => item != targetValue);
      if (result && result.length > 0) {
        setdropdownArrObj((preData) => {
          return {
            ...preData,
            [fieldName]: result
          }
        });
        setDropdwonVisibleObj(preData => {
          return {
            ...preData,
            [fieldName]: true
          }
        });
      }
    }

  }
  const [dropdownVisibleObj, setDropdwonVisibleObj] = useState({});
  const [dropdownArrObj, setdropdownArrObj] = useState({});
  const [pickerVisibleObj, setPickerVisibleObj] = useState({});
  const fMap = {
    'owner': 'ownerInfos',
    'insured': 'insuredInfos',
    'policyHolder': 'applicantInfos',
    'other': 'otherInfos'
  }
  /**动态渲染字段*/
  const renderDynamic = (pre) => {
    const fieldArr = dynamicFieldsData[fMap[pre]];
    if (!fieldArr) return '';
    return <>
      {
        fieldArr.map(field => {
          return <DynamicComponent
            areaList={areaList}
            key={field.key}
            {...props}
            pre={pre} //拼接key owner.xxx
            getClassName={getClassName}
            onFocus={dealFocus}
            onBlur={dealBlur}
            pickerVisible={pickerVisibleObj[`${pre}.${field.key}`]}
            setPickerVisibleObj={setPickerVisibleObj}
            dropdownVisible={dropdownVisibleObj[`${pre}.${field.key}`]}
            setDropdwonVisibleObj={setDropdwonVisibleObj}
            dropdownArr={dropdownArrObj[`${pre}.${field.key}`]}
            inputProps={inputProps}
            field={field} />;
        })
      }
    </>
  }

  const [hasImageUploaded, setHasImageUploaded] = useState(false);
  return <div className={styles.con}>
    <Agreement visible={agreement.show} type={agreement.type} onClose={() => {
      setAgreement({
        ...agreement,
        show: false
      })
    }} />
    <Space direction='vertical' style={{ '--gap': '.2rem', width: '100%', marginTop: '.2rem' }}>
      <Card leftExtra="车主信息">
        <List.Item
          extra={<Input {...inputProps}
            readOnly
            {...getFieldProps('owner.name', { rules: [{ required: true, message: '请输入姓名' }], })} />}
        >
          姓名
        </List.Item>
        <List.Item
          extra={<Input {...inputProps}
            readOnly
            {...getFieldProps('owner.idCardTypeName', { rules: [{ required: true, message: '请选择证件类型' }], })} />}
        >
          证件类型
        </List.Item>
        <List.Item
          extra={<Input {...inputProps}
            readOnly
            {...getFieldProps('owner.idCard', { rules: [{ required: true, message: '请输入证件号码' }], })} />}
        >
          证件号码
        </List.Item>
        {renderDynamic('owner')}

      </Card>


      <Card leftExtra="投保人信息">
        <List.Item
          extra={<Input {...inputProps}
            readOnly
            {...getFieldProps('policyHolder.name', { rules: [{ required: true, message: '请输入姓名' }], })} />}
        >
          姓名
        </List.Item>
        <List.Item
          extra={<Input {...inputProps}
            readOnly
            {...getFieldProps('policyHolder.idCardTypeName', { rules: [{ required: true, message: '请选择证件类型' }], })} />}
        >
          证件类型
        </List.Item>
        <List.Item
          extra={<Input {...inputProps}
            readOnly
            {...getFieldProps('policyHolder.idCard', { rules: [{ required: true, message: '请输入证件号码' }], })} />}
        >
          证件号码
        </List.Item>
        {renderDynamic('policyHolder')}
      </Card>

      <Card leftExtra="被保人信息">
        <List.Item
          extra={<Input {...inputProps}
            readOnly
            {...getFieldProps('insured.name', { rules: [{ required: true, message: '请输入姓名' }], })} />}
        >
          姓名
        </List.Item>
        <List.Item
          extra={<Input {...inputProps}
            readOnly
            {...getFieldProps('insured.idCardTypeName', { rules: [{ required: true, message: '请选择证件类型' }], })} />}
        >
          证件类型
        </List.Item>
        <List.Item
          extra={<Input {...inputProps}
            readOnly
            {...getFieldProps('insured.idCard', { rules: [{ required: true, message: '请输入证件号码' }], })} />}
        >
          证件号码
        </List.Item>
        {renderDynamic('insured')}
      </Card>
      <Card leftExtra='其他信息'>
        <List.Item
          onClick={() => {
            dispatch({
              type: 'publicautomobile/saveInsureCache',
              payload: getFieldsValue(),
            });
            history.push('/PublicAutomobile/insure/imageUpload')
          }}
          {...listArrowProps}
          extra={<Input {...inputProps}
            readOnly value={hasImageUploaded ? '已上传' : '未上传'} />}
        >
          影像资料
        </List.Item>
        {renderDynamic('other')}
      </Card>
      <div className={styles.check}>
        <Checkbox className={styles.cb} {...checkboxProps} {...getFieldProps('checked', { valuePropName: 'checked' })} />
        <div className={styles.def}>
          <span>
            本产品由中国人保财险承保，限家庭自用车投保，我已阅读并同意
            <span onClick={() => showAgreement('ptfwxy')}>《保险代理平台服务协议》</span>
            <span onClick={() => showAgreement('bxtk')}>《机动车商业险条款2020的内容》</span>
            <span onClick={() => showAgreement('mzsms')}>《免责说明书》</span>
            <span onClick={() => showAgreement('khgzs')}>《自动投保客户告知书》</span>
            <span onClick={() => showAgreement('tbxz')}>《投保须知》</span>
          </span>
        </div>
      </div>
    </Space>
    <Bottom ref={bottomRef}>
      <div className={styles.submit} onClick={submit}>提交</div>
    </Bottom>
  </div>
}
const FormIndex = createForm()(Index);
const routerTrackIndex = routerTrack({ id: 'pageInsure', autoStart: false })(FormIndex);

export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(
  routerTrackIndex,
);
