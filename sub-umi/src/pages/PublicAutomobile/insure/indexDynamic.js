import { List, Checkbox, Input, Switch, DatePicker, Picker, CascadePicker, Toast, Space } from 'antd-mobile-v5';
import DropdownC from '@/components/Dropdown';
import moment from 'moment';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import utils from '@/utils/utils';
import styles from './index.scss';

const emailReg = /^\w+@[a-z0-9]+\.[a-z]{2,4}$/;
const phoneReg = /^1[3-9]\d{9}$/;

const areaOptions = [
  {
    label: '浙江',
    value: '浙江',
    children: [
      {
        label: '杭州',
        value: '杭州',
      },
      {
        label: '宁波',
        value: '宁波',
        children: [
          {
            label: '街道',
            value: '街道',
            children: [
              {
                label: '小区1',
                value: '小区1',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: '江苏',
    value: '江苏',
    children: [
      {
        label: '南京',
        value: '南京',
      },
      {
        label: '苏州',
        value: '苏州',
        children: [
          {
            label: '街道',
            value: '街道',
            children: [
              {
                label: '小区2',
                value: '小区2',
              },
            ],
          },
        ],
      },
    ],
  },
];


const DynamicComponent = (props) => {
  const { form, pre, getClassName, onFocus, onBlur, inputProps, field,
    dropdownArr = [], dropdownVisible = false, setDropdwonVisibleObj,
    pickerVisible = false, setPickerVisibleObj, areaList } = props;
  const { getFieldProps, setFieldsValue, getFieldError } = form;

  const { desc, key, option, type, value } = field;
  const fullKey = `${pre}.${field.key}`;

  const ruleMap = {
    'Date': [{ required: true, message: `请选择${desc}` }],
    'Mobile': [
      { required: true, message: `请输入${desc}` },
      {
        pattern: phoneReg,
        message: '请输入正确的手机号码',
      }
    ],
    'Email': [
      { required: true, message: `请输入${desc}` },
      {
        pattern: emailReg,
        message: '请输入正确的邮箱',
      }
    ],
    'Address': [{ required: true, message: `请选择${desc}` },
    {
      asyncValidator: (rule, val) => {
        return new Promise((resolve, reject) => {
          if(!val||val.length!=3){
            reject('请选择完整的省市区')
          }else{
            resolve();
          }
        })
      }
    }
    ],
    'Text': [{ required: true, message: `请输入${desc}` }],
    'Select': [{ required: true, message: `请选择${desc}` }],
  };
  const labelRenderer = useCallback((type, data) => {
    switch (type) {
      case 'year':
        return data + '年';
      case 'month':
        return data + '月';
      case 'day':
        return data + '日';
      default:
        return data;
    }
  }, []);

  const getComponentByType = () => {
    let result = <></>;
    const rules = ruleMap[type];
    //日期:date、手机号码:mobile、邮箱:email、地址:address、文本框:text、选择框:select
    switch (type) {
      case 'Date':
        result = <>
          <DatePicker
            {...getFieldProps(fullKey, {
              rules: rules,
              trigger: 'onConfirm',
              // initialValue: field.value ? new Date(field.value) : new Date()
            })}
            precision="day"
            max={moment().add(20,'y').toDate()}
            renderLabel={labelRenderer}
            visible={pickerVisible}
            onClose={() => {
              setPickerVisibleObj((preObj) => {
                return {
                  ...preObj,
                  [fullKey]: false
                }
              });
            }}
          >
            {value => (
              <span
                style={{
                  color: getFieldError(fullKey) ? '#dd0008' : value ? '#5E6C84' : '#ccd0d8',
                }}
              >
                {value ? moment(value).format('YYYY-MM-DD') : '请选择日期'}
              </span>
            )}
          </DatePicker>
        </>
        break;
      case 'Select':
        const { option = [] } = field;
        if (!option || option.length === 0) {
          result = <></>;
          break;
        }
        let realOtion = option.map(item => {
          return {
            ...item,
            label: item.text
          }
        })
        result = <>
          <Picker
            {...getFieldProps(fullKey, {
              rules: rules,
              trigger: 'onConfirm',
              initialValue: field.value ? [field.value] : []
            })}
            columns={[realOtion]}
            visible={pickerVisible}
            onClose={() => {
              setPickerVisibleObj((preObj) => {
                return {
                  ...preObj,
                  [fullKey]: false
                }
              });
            }}
          >
            {value => {
              return (
                <span
                  style={{
                    color: getFieldError(fullKey) ? '#dd0008' : value && value[0] ? '#5E6C84' : '#ccd0d8',
                  }}
                >
                  {value && value[0] ? value[0]?.label : `请选择${desc}`}
                </span>
              )
            }}
          </Picker>
        </>
        break;
      case 'Address':
        result = <div>
          <CascadePicker
            title='地址选择'
            {...getFieldProps(fullKey, {
              rules: rules,
              trigger: 'onConfirm',
              initialValue: [localStorage.regionCode, localStorage.cityCode]
            })}
            options={areaList}
            visible={pickerVisible}
            onClose={() => {
              setPickerVisibleObj((preObj) => {
                return {
                  ...preObj,
                  [fullKey]: false
                }
              });
            }}
          >
            {value => {
              const displayFormat = <div className={styles.df} >
                <span>{value?.[0]?.label||'请选择'}</span><img src={require('./images/down-arrow.png')}/>
                <span>{value?.[1]?.label||'请选择'}</span><img src={require('./images/down-arrow.png')}/>
                <span>{value?.[2]?.label||'请选择'}</span><img src={require('./images/down-arrow.png')}/>
              </div>;
              return <div
                style={{
                  color: getFieldError(fullKey) ? '#dd0008' : value && value[0] ? '#5E6C84' : '#ccd0d8',
                }}
                onClick={() => {
                  setPickerVisibleObj((preObj) => {
                    return {
                      ...preObj,
                      [fullKey]: true
                    }
                  });
                }} >{displayFormat}</div>
            }}
          </CascadePicker>
          {/* <Input {...inputProps}
              type={'text'}
              className={getClassName(fullKey)}
              placeholder={`请输入详细地址`}
              onFocus={(e) => onFocus(fullKey, type, e)}
              {...getFieldProps(fullKey, {
                initialValue: field.value || '',
                validateTrigger: 'onBlur',
                onBlur: () => onBlur(fullKey),
                rules: rules,
              })} /> */}
        </div>
        break;
      default:
        result = <>
          <DropdownC menuArr={dropdownArr} visible={dropdownVisible} onMenuSelect={(value) => {
            setFieldsValue({ [fullKey]: value });
            setDropdwonVisibleObj(preData => {
              return {
                ...preData,
                [fullKey]: false
              }
            });
          }}>
            <Input {...inputProps}
              type={field.type === 'Mobile' ? 'number' : 'text'}
              className={getClassName(fullKey)}
              placeholder={`请输入${desc}`}
              onFocus={(e) => onFocus(fullKey, type, e)}
              {...getFieldProps(fullKey, {
                initialValue: field.value || '',
                validateTrigger: 'onBlur',
                onBlur: () => onBlur(fullKey),
                rules: rules,
              })} />
          </DropdownC>
        </>
    }
    return result;
  }
  return <List.Item
    arrow={<></>}
    onClick={() => {
      if (['Date', 'Select'].includes(type)) {
        setPickerVisibleObj((preObj) => {
          return {
            ...preObj,
            [fullKey]: true
          }
        });
      }
    }}
    extra={getComponentByType()}
  >
    {desc}
  </List.Item>
}

export default DynamicComponent;