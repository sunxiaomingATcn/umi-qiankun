import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Toast, Checkbox, List, Switch, Space, Input, DatePicker, Mask, Radio, Picker } from 'antd-mobile-v5';
import styles from '../index.scss';
import createDOMForm from 'rc-form/lib/createDOMForm';
import WxSdk from '@/utils/wx-sdk';
import PPBLoading from '@/components/Loading/loading.js';
import utils from '@/utils/utils';
import regEx from '@/utils/RegEx';
import Card from '../../components/card';
import * as requestMethodsAutomobile from '@/services/publicAutomobile';
import get from 'lodash/get';

const { generalRequest } = utils;
const { regMap: { IdCardNo1518 } } = regEx;

//车主投保人被保人组件
const PersonInfo = (props, ref) => {
  const { data, onChange, form } = props;
  const { getFieldProps, getFieldError, getFieldsError, validateFieldsAndScroll, validateFields, setFieldsValue, getFieldValue, getFieldsValue } = form;
  const [myData, setMyData] = useState({});

  useEffect(() => {
    let newDataStr = JSON.stringify(data);
    if (newDataStr !== JSON.stringify(myData)) {
      let newData = JSON.parse(newDataStr);
      setMyData(newData);
      setFieldsValue(newData);
    }
  }, [data]);

  const inputRefs = {
    ['owner.idCard']: useRef(),
    ['policyHolder.name']: useRef(),
    ['policyHolder.idCard']: useRef(),
    ['insured.name']: useRef(),
    ['insured.idCard']: useRef(),
  };

  const orderKeys = [
    'owner.idCard',
    'policyHolder.name',
    'policyHolder.idCard',
    'insured.name',
    'insured.idCard',
  ];

  const autoFocus = (errorFieldName) => {
    if (inputRefs[errorFieldName]) {
      inputRefs[errorFieldName].current.focus();
    }
    if (pickerVisibleObj.hasOwnProperty(errorFieldName)) {
      setPickerVisibleObj({
        ...pickerVisibleObj,
        [errorFieldName]: true
      })
    }
  }
  const validateAndGetVal = (callback) => {
    return new Promise((resolve, reject) => {
      const callbackError = (error, values) => {
        let errorFieldName = '';
        for (let i = 0; i < orderKeys.length; i++) {
          let key = orderKeys[i];
          if (get(error, key)) {
            errorFieldName = key;
            break;
          }
        }
        let firstmsg = get(error, errorFieldName)?.errors[0]?.message;
        autoFocus(errorFieldName);
        callback && callback(firstmsg, values);
        return firstmsg;
      };
      validateFields(['owner'], (error, values) => {
        //先验证车主信息
        if (error) {
          reject(callbackError(error, values));
        } else {
          //根据选择验证投保人和被保人
          const { PToO, IToO, IToP } = myData;
          const validatePH = !PToO, validateIS = !IToO && !IToP;

          let validateArr = [];
          if (validatePH) validateArr.push('policyHolder');
          if (validateIS) validateArr.push('insured');

          if (validateArr.length > 0) {
            validateFields(validateArr, (otherError, otherValues) => {
              if (otherError) {
                reject(callbackError(otherError, otherValues));
              } else {
                let result = {
                  ...values,
                  ...otherValues,
                }
                //补齐属性，有的同车主有的同投保人
                if (!result.policyHolder) result.policyHolder = { ...values.owner };
                if (!result.insured) {
                  result.insured = IToO ? { ...values.owner } : { ...result.policyHolder };
                }
                callback && callback(null, result);
                resolve(result);
              }
            })
          } else {
            //不需要验证说明全部同车主
            let result = {
              ...values,
              policyHolder: { ...values.owner },
              insured: { ...values.owner }
            }
            callback && callback(null, result);
            resolve(result);
          }
        }
      })
    })
  }

  useImperativeHandle(ref, () => ({
    validate(callback) {
      validateAndGetVal(callback);
    },
    getVal() {
      let val = getFieldsValue();
      val = {
        ...val,
        IToO: myData.IToO,
        IToP: myData.IToP,
        PToO: myData.PToO,
      }
      return val;
    },
    async getNoStarVal() {

      const val = await validateAndGetVal();
      try {
        const delStar = (obj) => {
          obj.name = obj.name.includes('*') ? obj.nameNoStar : obj.name;
          obj.idCard = obj.idCard.includes('*') ? obj.idCardNoStar : obj.idCard;
        }
        Object.keys(val).forEach(key => {
          delStar(val[key]);
        })
        return val;
      } catch (error) {
        console.log('[validateerror]', error)
        return {};
      }
    }
  }))

  //证件类型表
  const [cardTypes, setCardTypes] = useState([]);

  useEffect(() => {
    generalRequest({}, requestMethodsAutomobile.cardTypes)
      .then(res => {
        const remoteCT = res.data?.map(item => {
          return {
            label: item.name,
            value: item.code
          }
        });
        setCardTypes([remoteCT]);
        // setFieldsValue({...data});
      });
  }, [])

  const onUploadClick = (type = 'owner') => {
    WxSdk.chooseImage(res => {
      PPBLoading.show();
      let { localIds } = res;
      WxSdk.getLocalImgData(res => {
        const localData = res.localData;
        let imageBase64 = '';
        if (localData.indexOf('data:image') == 0) {
          //苹果的直接赋值，默认生成'data:image/jpeg;base64,'的头部拼接
          imageBase64 = localData;
        } else {
          //此处是安卓中的唯一得坑！在拼接前需要对localData进行换行符的全局替换
          //此时一个正常的base64图片路径就完美生成赋值到img的src中了
          imageBase64 = 'data:image/jpeg;base64,' + localData.replace(/\n/g, '');
        }
        utils.compressCanvasWithPromise(imageBase64, 400).then(res => {
          let formData = new FormData();
          formData.append('file', utils.dataURLtoFile(imageBase64, new Date().getTime() + '.jpg'));
          formData.append('side', 'front');
          formData.append('type', 'idCard');
          generalRequest(formData, requestMethodsAutomobile.ocr)
            .then((res) => {
              Toast.show('识别成功');
              const idC = res.data.number;
              const name = res.data.name;
              let params = {
                idCard: idC,
                idCardNoStar: idC
              };
              //车主名称不覆盖
              if (type !== 'owner') {
                params.name = name;
                params.nameNoStar = name;
              }
              setFieldsValue({
                [type]: params
              })
            }).finally(() => {
              PPBLoading.hide();
            });
        }).catch(e => {
          PPBLoading.hide();
        });;
      }, localIds);
    });
  };

  const listArrowProps = {
    arrow: <img style={{ width: '.12rem', height: '.22rem', marginLeft: '.14rem' }} src={require('../../images/form-arrow.png')} />
  };

  const inputProps = (fieldName) => {
    return {
      className: getFieldError(fieldName) && currFocus !== fieldName ? 'ppberror' : '',
      style: {
        '--color': '#333D4F',
        '--text-align': 'right',
        '--font-size': '.28rem',
      }
    }
  };

  const checkboxProps = {
    style: {
      '--font-size': '.28rem',
      '--gap': '.1rem',
    },
    icon: checked =>
      checked ? (
        <img src={require('../../images/checked.png')} style={{ width: '.32rem', height: '.32rem' }} />
      ) : (
        <img src={require('../../images/normal.png')} style={{ width: '.32rem', height: '.32rem' }} />
      ),
    block: true
  };
  const [currFocus, setCurrFocus] = useState('');
  const dealBlur = (fieldName) => {
    setCurrFocus('');
  }
  const dealFocus = (fieldName) => {
    const value = getFieldValue(fieldName);
    if (value?.includes('*')) {
      setFieldsValue({ [fieldName]: '' })
    }
    setCurrFocus(fieldName);
  }

  const [pickerVisibleObj, setPickerVisibleObj] = useState({
    owner: false,
    policyHolder: false,
    insured: false
  })

  const controlPicker = (type, value) => {
    setPickerVisibleObj((pre) => {
      return {
        ...pre,
        [type]: value
      }
    });
  };
  const onCheckboxChange = (val, fieldName) => {
    let newData = {
      ...myData,
      [fieldName]: val
    }
    if (val === true && fieldName === 'IToO') newData.IToP = false;
    if (val === true && fieldName === 'IToP') newData.IToO = false;
    setMyData(newData)
    onChange && onChange(newData);
  }

  const getIdCardValidator = (fieldName, message) => {
    let fieldValue = getFieldValue(fieldName);

    if (fieldValue && fieldValue?.[0] === '0') {
      return {
        asyncValidator: (rule, val) => {
          return new Promise((resolve, reject) => {
            let result = IdCardNo1518.reg.test(val);
            if (val.includes('*') || result) {
              resolve()
            } else {
              reject(message)
            }
          })
        }
      }
    }
    return {}
  }

  return <>
    <Space direction='vertical' style={{ '--gap': '.2rem', width: '100%' }}>
      <Card
        leftExtra="车主信息"
        onRightExtraClick={() => onUploadClick('owner')}
        rightExtra={
          <img
            style={{ width: '.38rem', height: '.32rem' }}
            src={require('../../images/camera.png')} />
        } >

        <List.Item
          style={{ display: 'none' }}
          extra={<Input
            {...getFieldProps('owner.name', {
              rules: [{ required: true, message: '请输入车主姓名' }],
            })}
            onFocus={() => dealFocus('owner.name')}
            {...inputProps('owner.name')} placeholder='请输入车主姓名' />}>姓名</List.Item>

        <Input {...getFieldProps('owner.nameNoStar')} style={{ display: 'none' }} />
        <List.Item {...listArrowProps}
          onClick={() => controlPicker('owner', true)}
          extra={
            // <span style={{ color: '#5E6C84' }}>身份证</span>
            <Picker
              {...getFieldProps('owner.idCardType', {
                rules: [{ required: true, message: '请选择证件类型' }],
                trigger: 'onConfirm',
                onConfirm: (value) => {
                  const preValue = getFieldValue('owner.idCardType');
                  if (preValue && preValue[0] != value[0]) {
                    setFieldsValue({ ['owner.idCard']: '' })
                  }
                }
              })}
              columns={cardTypes}
              visible={pickerVisibleObj.owner}
              onClose={() => controlPicker('owner', false)}
            >
              {value => {
                return (
                  <span
                    style={{ color: value && value[0] ? '#5E6C84' : '#ccd0d8' }}
                  >
                    {value && value[0] ? value[0].label : '请选择证件类型'}
                  </span>
                )
              }}
            </Picker>
          }>证件类型</List.Item>
        <Input {...getFieldProps('owner.idCardNoStar')} style={{ display: 'none' }} />
        <List.Item extra={<Input
          {...getFieldProps('owner.idCard', {
            ref: inputRefs['owner.idCard'],
            validateTrigger: 'onBlur',
            onBlur: () => dealBlur('owner.idCard'),
            rules: [
              { required: true, message: '请输入车主证件号码' },
              getIdCardValidator('owner.idCardType', '请输入正确的车主证件号码')
            ],
          })}
          onFocus={() => dealFocus('owner.idCard')}
          {...inputProps('owner.idCard')} placeholder='请输入车主证件号码' />}>证件号码</List.Item>
      </Card>

      <Card
        hideContent={myData.PToO}
        leftExtra={<div className={styles.leftExtra}>
          <span>投保人信息</span>
          <Checkbox className={styles.cb} {...checkboxProps}
            checked={myData.PToO}
            onChange={(val) => onCheckboxChange(val, 'PToO')}
          >
            同车主
          </Checkbox>
        </div>}
        onRightExtraClick={() => onUploadClick('policyHolder')}
        rightExtra={!myData.PToO &&
          <img
            style={{ width: '.38rem', height: '.32rem' }}
            src={require('../../images/camera.png')} />
        } >

        <List.Item
          extra={<Input
            {...getFieldProps('policyHolder.name',
              {
                ref: inputRefs['policyHolder.name'],
                validateTrigger: 'onBlur',
                onBlur: () => dealBlur('policyHolder.name'),
                rules: [{ required: true, message: '请输入投保人姓名' }],
              })}
            onFocus={() => dealFocus('policyHolder.name')}
            {...inputProps('policyHolder.name')} placeholder='请输入投保人姓名' />}>姓名</List.Item>

        <Input {...getFieldProps('policyHolder.nameNoStar')} style={{ display: 'none' }} />
        <List.Item {...listArrowProps}
          onClick={() => controlPicker('policyHolder', true)}
          extra={
            // <span style={{ color: '#5E6C84' }}>身份证</span>
            <Picker
              {...getFieldProps('policyHolder.idCardType', {
                rules: [{ required: true, message: '请选择证件类型' }],
                trigger: 'onConfirm',
                onConfirm: (value) => {
                  const preValue = getFieldValue('policyHolder.idCardType');
                  if (preValue && preValue[0] != value[0]) {
                    setFieldsValue({ ['policyHolder.idCard']: '' })
                  }
                }
              })}
              columns={cardTypes}
              visible={pickerVisibleObj.policyHolder}
              onClose={() => controlPicker('policyHolder', false)}
            >
              {value => {
                return (
                  <span
                    style={{ color: value && value[0] ? '#5E6C84' : '#ccd0d8' }}
                  >
                    {value && value[0] ? value[0].label : '请选择证件类型'}
                  </span>
                )
              }}
            </Picker>
          }>证件类型</List.Item>
        <Input {...getFieldProps('policyHolder.idCardNoStar')} style={{ display: 'none' }} />
        <List.Item extra={<Input
          {...getFieldProps('policyHolder.idCard', {
            ref: inputRefs['policyHolder.idCard'],
            validateTrigger: 'onBlur',
            onBlur: () => dealBlur('policyHolder.idCard'),
            rules: [{ required: true, message: '请输入投保人证件号码' },
            getIdCardValidator('policyHolder.idCardType', '请输入正确的投保人证件号码')
            ],
          })}
          onFocus={() => dealFocus('policyHolder.idCard')}
          {...inputProps('policyHolder.idCard')} placeholder='请输入投保人证件号码' />}>证件号码</List.Item>
      </Card>

      <Card
        hideContent={myData.IToO || myData.IToP}
        leftExtra={
          <div className={styles.leftExtra}>
            <span>被保人信息</span>
            <Checkbox className={styles.cb} {...checkboxProps}
              checked={myData.IToO}
              onChange={(val) => onCheckboxChange(val, 'IToO')}
            >
              同车主
            </Checkbox>
            <Checkbox className={styles.cb} {...checkboxProps}
              checked={myData.IToP}
              onChange={(val) => onCheckboxChange(val, 'IToP')}
            >
              同投保人
            </Checkbox>
          </div>
        }
        onRightExtraClick={() => onUploadClick('insured')}
        rightExtra={
          !myData.IToO && !myData.IToP &&
          <img
            style={{ width: '.38rem', height: '.32rem' }}
            src={require('../../images/camera.png')} />
        } >

        <List.Item
          extra={<Input
            {...getFieldProps('insured.name', {
              ref: inputRefs['insured.name'],
              validateTrigger: 'onBlur',
              onBlur: () => dealBlur('insured.name'),
              rules: [{ required: true, message: '请输入被保人姓名' }],
            })}
            onFocus={() => dealFocus('insured.name')}
            {...inputProps('insured.name')} placeholder='请输入被保人姓名' />}>姓名</List.Item>

        <Input {...getFieldProps('insured.nameNoStar')} style={{ display: 'none' }} />
        <List.Item {...listArrowProps}
          onClick={() => controlPicker('insured', true)}
          extra={
            // <span style={{ color: '#5E6C84' }}>身份证</span>
            <Picker
              {...getFieldProps('insured.idCardType', {
                rules: [{ required: true, message: '请选择证件类型' }],
                trigger: 'onConfirm',
                onConfirm: (value) => {
                  const preValue = getFieldValue('insured.idCardType');
                  if (preValue && preValue[0] != value[0]) {
                    setFieldsValue({ ['insured.idCard']: '' })
                  }
                }
              })}
              columns={cardTypes}
              visible={pickerVisibleObj.insured}
              onClose={() => controlPicker('insured', false)}
            >
              {value => {
                return (
                  <span
                    style={{ color: value && value[0] ? '#5E6C84' : '#ccd0d8' }}
                  >
                    {value && value[0] ? value[0].label : '请选择证件类型'}
                  </span>
                )
              }}
            </Picker>
          }>证件类型</List.Item>
        <Input {...getFieldProps('insured.idCardNoStar')} style={{ display: 'none' }} />
        <List.Item extra={<Input
          {...getFieldProps('insured.idCard', {
            ref: inputRefs['insured.idCard'],
            validateTrigger: 'onBlur',
            onBlur: () => dealBlur('insured.idCard'),
            rules: [{ required: true, message: '请输入被保人证件号码' },
            getIdCardValidator('insured.idCardType', '请输入正确的被保人证件号码')
            ],
          })}
          onFocus={() => dealFocus('insured.idCard')}
          {...inputProps('insured.idCard')} placeholder='请输入被保人证件号码' />}>证件号码</List.Item>
      </Card>
    </Space>

  </>
}

const FormIndex = forwardRef(PersonInfo);

export default createDOMForm()(FormIndex);