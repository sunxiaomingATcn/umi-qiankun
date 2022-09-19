/**补充车辆信息*/
import { connect } from 'dva';
import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { createForm } from 'rc-form';
import createDOMForm from 'rc-form/lib/createDOMForm';
import { List, Radio, Input, Switch, DatePicker, Picker, Toast } from 'antd-mobile-v5';
import styles from './index.scss';
import AutomobileNum from '../../PublicHome/components/automobileNum';
import Line from '../components/line';
import Bottom from '../components/bottom';
import WxSdk from '@/utils/wx-sdk';
import utils from '@/utils/utils';
import moment from 'moment';
import { history } from 'umi';
import PPBLoading from '@/components/Loading/loading.js';
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';

import * as requestMethodsAutomobile from '@/services/publicAutomobile';
const { generalRequest } = utils;
const now = new Date();
const min = new Date('2000-01-01');

function Index(props) {
  const { getFieldProps, getFieldError,getFieldsError, validateFieldsAndScroll,validateFields, setFieldsValue, getFieldValue } = props.form;
  const { location: { query: { type = 'normal', from = 'normal' } }, dispatch, publicautomobile: { imageMap = {} } } = props;
  const [carNoArr, setCarNoArr] = useState([]);
  const [preCarNo, setPreCarNo] = useState('');
  const [GDArea, setGDArea] = useState([]);
  const [regionCode, setRegionCode] = useState('');
  const [currBg, setCurrBg] = useState('');
  const [currFocus, setCurrFocus] = useState('');
  const bottomRef = useRef();
  const photoRef = useRef();
  const viewerRef = useRef();
  const autoCompleteInfo = (info) => {
    if (!info) {
      return;
    }
    setTimeout(() => {
      const finalInfo = utils.mapValuesToFields(info);
      //脱敏处理
      const fv = {
        ...finalInfo,
        vinCode: finalInfo.vinCode.slice(0, 7) + '*******' + finalInfo.vinCode.slice(14),
        engineNo: finalInfo.engineNo.slice(0, 3) + '**' + finalInfo.engineNo.slice(5),
        owner: '*' + finalInfo.owner.slice(1),
        vinCodeNoStar: finalInfo.vinCode,
        engineNoNoStar: finalInfo.engineNo,
        ownerNoStar: finalInfo.owner,
      }
      setFieldsValue(fv);
    }, 500);
  };
  useEffect(() => {
    document.title = '完善车辆信息';
    const regionCode = localStorage.getItem('regionCode');
    setRegionCode(regionCode);
    //自动填充上次填过的信息
    const localBaseCarInfoStr = localStorage.getItem('baseCarInfo');
    const localBaseCarInfo = localBaseCarInfoStr ? JSON.parse(localBaseCarInfoStr) : '';

    //获取广东地区省市选择 11北京 44 广东 31 上海
    if (regionCode == '44') {
      generalRequest({}, requestMethodsAutomobile.regionGD)
        .then(res => {
          setGDArea([res.data]);
          autoCompleteInfo(localBaseCarInfo);
        })
    } else {
      autoCompleteInfo(localBaseCarInfo);
    }

    //不是新车自动填充车辆信息
    if (type == 'normal') {
      const carInfoStr = localStorage.getItem('carInfo');
      const localCarNo = localStorage.getItem('localCarNo');
      let realCarNo = '';
      let carInfo = {};
      if (carInfoStr) {
        carInfo = JSON.parse(carInfoStr);
      }

      realCarNo = carInfo.carLicenseNo || localCarNo;
      if (realCarNo) {
        setPreCarNo(realCarNo);
        setCarNoArr(realCarNo.split('').map(item => { return { value: item } }));
      }

      //有保存过信息的设置ORC图片
      if (localBaseCarInfo && imageMap[realCarNo]){
        setCurrBg(imageMap[realCarNo]);
        initOrUpdateViewer();
      }

    }
    setTimeout(() => {
      bottomRef.current.refresh();
    }, 0);
  }, []);
  const initOrUpdateViewer = ()=>{
    if(viewerRef.current){
      viewerRef.current.update();
      return;
    }
    viewerRef.current = new Viewer(photoRef.current, {
      inline:false,
      navbar:false,//不显示下方画廊
      title:false,//不显示下方标题
      toolbar:{
        oneToOne: true,
        zoomIn:true,
        zoomOut:true,
        reset:true,
        rotateLeft:true,
        rotateRight:true,
        flipHorizontal:true,
        flipVertical:true
      },
      // filter(image){
      //   //过滤背景图片展示
      //   let isBg = image.src.includes('suppbg')
      //   Toast.show(isBg+'---'+image.src);
      //   return !isBg;
      // }
      // viewed() {
      //   viewer.zoomTo(1);
      // },
    });
  }

  const onUploadClick = () => {
    WxSdk.chooseImage(res => {
      let { localIds } = res;
      WxSdk.getLocalImgData(res => {
        PPBLoading.show();
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
          formData.append('type', 'vehicleLicense');
          generalRequest(formData, requestMethodsAutomobile.ocr)
            .then((res) => {
              console.log('[orctest]', res);
              Toast.show('识别成功')
              //ocr字段与业务字段转换
              const finalData = {
                vinCode: res.data.vinNo,//车架号
                owner: res.data.name,//车主姓名
                standardFullName: res.data.model,//品牌型号
                engineNo: res.data.engineNo,//发动机编号
                registDate: res.data.enrollDate ? new Date(res.data.enrollDate) : '',//初登日期
              };
              setFieldsValue(finalData);
              // autoCompleteInfo(finalData)
              setCurrBg(imageBase64);
              initOrUpdateViewer();
              dispatch({
                type: 'publicautomobile/saveImage',
                payload: {
                  [`${preCarNo}`]: imageBase64
                }
              })
            }).finally(() => {
              PPBLoading.hide();
            });
        }).catch(e => {
          PPBLoading.hide();
        });
      }, localIds);
    });
  };

  const submit = () => {
    validateFields((error, values) => {
      if (error) {
        let errorFieldNameKeys = Object.keys(error);
        let errorFieldName = '';
        for(let i=0;i<orderKeys.length; i++){
          let key = orderKeys[i];
          if(errorFieldNameKeys.includes(key)){
            errorFieldName = key;
            break;
          }
        }
        let firstmsg = error[errorFieldName]?.errors[0]?.message;
        Toast.show(firstmsg);
        autoFocus(errorFieldName);
        return;
      };
      values.provinceCode = regionCode;
      values.carLicenseNo = preCarNo;
      values.notRegister = type === "normal" ? 0 : 1;
      values.cityCode = localStorage.cityCode;
      values.saleCompanyCityCode = values.saleCompanyCityCode?.[0] ?? '';
      //提交需要还原脱敏
      let params = {
        ...values,
        vinCode: values.vinCode.includes('*') ? values.vinCodeNoStar : values.vinCode,
        engineNo: values.engineNo.includes('*') ? values.engineNoNoStar : values.engineNo,
        owner: values.owner.includes('*') ? values.ownerNoStar : values.owner,
      };
      if (!params.isTransferFirstYear) delete params.transferDate;
      params = utils.mapFieldsToValues(params);
      generalRequest(params, requestMethodsAutomobile.completeCar)
        .then(res => {
          localStorage.setItem('baseCarInfo', JSON.stringify(params));
          //修改缓存名字，跟最新的保持一致
          const { publicautomobile: { quoteCache },dispatch } = props;
          if (quoteCache) {
            let realOwner = quoteCache.owner?.owner;
            if(realOwner)realOwner.name = params.owner;
            dispatch({
              type: 'publicautomobile/saveQuoteCache',
              payload: {
                ...quoteCache,
              }
            });
          }
          if (from === 'home') {
            history.replace('/PublicAutomobile/quoteInfo');
          } else {
            history.goBack();
          }
        })
    });
  };

  const switchProps = {
    style: {
      '--width': '1rem',
      '--height': '.6rem',
      '--border-width': '.02rem',
      '--checked-color': 'linear-gradient(270deg, #0AB88D 0%, #5B8EFF 100%)',
    },
  };
  const radioProps = {
    icon: checked =>
      checked ? (
        <img src={require('../images/checked.png')} style={{ width: '.4rem', height: '.4rem' }} />
      ) : (
        <img src={require('../images/normal.png')} style={{ width: '.4rem', height: '.4rem' }} />
      ),
  };

  const listArrowProps = {
    arrow: (
      <img
        style={{ width: '.12rem', height: '.22rem', marginLeft: '.14rem' }}
        src={require('../images/form-arrow.png')}
      />
    ),
  };

  const inputProps = {
    style: {
      '--text-align': 'right',
      '--font-size': '.3rem',
      '--color': '#5e6c84',
      '--placeholder-color': '#ccd0d8',
    },

  };
  const dealFocus = (fieldName, needClear = false) => {
    if (needClear) {
      let val = getFieldValue(fieldName);
      if (val && val.indexOf('*') != -1)
        setFieldsValue({
          [fieldName]: ''
        })
    }
    setCurrFocus(fieldName);
  }

  const inputRefs = {
    vinCode: useRef(),
    engineNo: useRef(),
    standardFullName: useRef(),
    owner: useRef(),
    certificateNo: useRef(),
    saleCompany: useRef(),
  };

  const [pickerVisible, setPickerVisible] = useState({
    registDate: false,
    transferDate: false,
    certificateDate: false,
    saleCompanyCityCode: false,
    invoiceDate: false
  })
  const orderKeys = [
    'vinCode',
    'engineNo',
    'registDate',
    'standardFullName',
    'owner',
    'transferDate',
    'certificateNo',
    'certificateDate',
    'saleCompanyCityCode',
    'saleCompany',
    'invoiceDate',
  ];
  const autoFocus = (errorFieldName) => {
    if (inputRefs[errorFieldName]) {
      inputRefs[errorFieldName].current.focus();
    }
    if (pickerVisible.hasOwnProperty(errorFieldName)) {
      setPickerVisible({
        ...pickerVisible,
        [errorFieldName]:true
      })
    }
  }


  // const [pickerVisible, setPickerVisible] = useState(false);
  // const [transferDatePickerVisible, setTransferDatePickerVisible] = useState(false);
  // const [certificateDatePickerVisible, setCertificateDatePickerVisible] = useState(false);
  // const [saleCompanyCityCodePickerVisible, setSaleCompanyCityCodePickerVisible] = useState(false);
  // const [invoiceDatePickerVisible, setInvoiceDatePickerVisible] = useState(false);
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
  const photoConBg = {
    // backgroundImage: `url(${currBg || require('../images/suppbg.png')})`,
    borderRadius: currBg ? '.3rem' : '0'
  }
  return (
    <div className={styles.con}>
      {type === 'normal' && <div className={styles.photoCon} >
        {/* <div className={styles.photoContent} style={photoConBg}> */}
        <div className={styles.photoContent}>
          <img className={styles.photoBg} style={photoConBg} ref={photoRef} src={currBg||require('../images/suppbg.png')} />
          {currBg ? <div className={styles.reUpload} onClick={onUploadClick}>
            <img src={require('../images/scan.png')} /><span>重新上传行驶证</span>
          </div> : <div className={styles.upload} onClick={onUploadClick}>
            <div>
              <img src={require('../images/photo.png')} />
            </div>
            <span>上传行驶证照片</span>
          </div>}

        </div>
      </div>}

      <div className={styles.formCon}>
        {type === 'normal' ? <div className={styles.numCon}>
          <span>车牌号码</span>
          <AutomobileNum disabled data={carNoArr} />
        </div> : <List.Item
          extra='新车未上牌'
        >
          车牌号码
        </List.Item>}
        <Line padding=".4rem" />
        <List.Item
          extra={<Input {...inputProps}
            className={getFieldError('vinCode') && currFocus !== 'vinCode' ? 'ppberror' : ''}
            placeholder="请输入车架号码"
            onFocus={() => dealFocus('vinCode', true)}
            maxLength={17}
            {...getFieldProps('vinCode', {
              ref: inputRefs.vinCode,
              validateTrigger: 'onBlur',
              rules: [
                {
                  asyncValidator: (rule, val) => {
                    setCurrFocus('');
                    return new Promise((resolve, reject) => {
                      if (!val) {
                        reject('请输入车架号码')
                      }
                      setFieldsValue({ vinCode: val.toUpperCase() });
                      let result = /^[a-z|A-Z|0-9|\*]{17}$/.test(val);
                      if (result) {
                        resolve()
                      } else {
                        reject('请输入17位车架号码')
                      }
                    })
                  }
                }
              ]
            })}
          />}
        >
          车架号码
        </List.Item>
        <Input {...getFieldProps('vinCodeNoStar')} style={{ display: 'none' }} />
        <Line padding=".4rem" />
        <List.Item
          extra={<Input {...inputProps}
            maxLength={16}
            onFocus={() => dealFocus('engineNo', true)}
            className={getFieldError('engineNo') && currFocus !== 'engineNo' ? 'ppberror' : ''}
            placeholder="请输入发动机号"
            {...getFieldProps('engineNo', {
              ref: inputRefs.engineNo,
              validateTrigger: 'onBlur',
              rules: [
                {
                  asyncValidator: (rule, val) => {
                    setCurrFocus('');
                    return new Promise((resolve, reject) => {
                      if (!val) {
                        reject('请输入发动机号')
                      }
                      let result = /^[a-z|A-Z|0-9|\-|\*]*$/.test(val);
                      if (result) {
                        resolve()
                      } else {
                        reject('请输入正确发动机号')
                      }
                    })
                  }
                }
              ],
            })} />}
        >
          发动机号
        </List.Item>
        <Input {...getFieldProps('engineNoNoStar')} style={{ display: 'none' }} />
        <Line padding=".4rem" />
        <List.Item
          {...listArrowProps}
          onClick={() => {
            setPickerVisible((preObj) => {
              return {
                ...preObj,
                registDate: true
              }
            });
          }}
          extra={
            <DatePicker
              {...getFieldProps('registDate', {
                rules: [{ required: true, message: '请选择日期' }],
                trigger: 'onConfirm'
              })}
              precision="day"
              renderLabel={labelRenderer}
              visible={pickerVisible.registDate}
              min={min}
              max={now}
              onClose={() => {
                setPickerVisible((preObj) => {
                  return {
                    ...preObj,
                    registDate: false
                  }
                });
              }}
            >
              {value => (
                <span
                  style={{
                    color: getFieldError('registDate') ? '#dd0008' : value ? '#5E6C84' : '#ccd0d8',
                  }}
                >
                  {value ? moment(value).format('YYYY-MM-DD') : '请选择日期'}
                </span>
              )}
            </DatePicker>
          }
        >
          初登日期
        </List.Item>
        <Line padding=".4rem" />
        <List.Item
          extra={<Input {...inputProps}
            className={getFieldError('standardFullName') && currFocus !== 'standardFullName' ? 'ppberror' : ''}
            onFocus={() => dealFocus('standardFullName')}
            placeholder="请输入品牌型号"
            {...getFieldProps('standardFullName', {
              ref: inputRefs.standardFullName,
              validateTrigger: 'onBlur',
              rules: [
                // { required: true, message: '请输入品牌型号' },
                {
                  asyncValidator: (rule, val) => {
                    setCurrFocus('');
                    return new Promise((resolve, reject) => {
                      if (!val) {
                        reject('请输入品牌型号');
                        return;
                      }
                      resolve();
                    })
                  }
                }
              ],

            })} />}
        >
          品牌型号
        </List.Item>
        <Line padding=".4rem" />
        <List.Item
          extra={<Input {...inputProps}
            onFocus={() => dealFocus('owner', true)}
            className={getFieldError('owner') && currFocus !== 'owner' ? 'ppberror' : ''}
            placeholder="请输入车主姓名"
            {...getFieldProps('owner', {
              ref: inputRefs.owner,
              validateTrigger: 'onBlur',
              rules: [
                // { required: true, message: '请输入车主姓名' },
                {
                  asyncValidator: (rule, val) => {
                    setCurrFocus('');
                    return new Promise((resolve, reject) => {
                      if (!val) {
                        reject('请输入车主姓名');
                        return;
                      }
                      resolve();
                    })
                  }
                }],
            })} />}
        >
          车主姓名
        </List.Item>
        <Input {...getFieldProps('ownerNoStar')} style={{ display: 'none' }} />
        <Line padding=".4rem" />
        {type === 'normal' && <> <List.Item
          extra={
            <Switch
              {...getFieldProps('isTransferFirstYear', {
                initialValue: false,
                valuePropName: 'checked',
              })}
              {...switchProps}
            />
          }
        >
          过户车首年投保
        </List.Item>
          <Line padding=".4rem" /></>}

        {<div style={{ display: getFieldValue('isTransferFirstYear') === true ? 'block' : 'none' }}>
          <List.Item
            {...listArrowProps}
            onClick={() => {
              setPickerVisible((preObj) => {
                return {
                  ...preObj,
                  transferDate: true
                }
              });
            }}
            extra={
              <DatePicker
                {...getFieldProps('transferDate', {
                  rules: [{ required: getFieldValue('isTransferFirstYear') === true, message: '请选择日期' }],
                  trigger: 'onConfirm'
                })}
                min={min}
                max={now}
                precision="day"
                renderLabel={labelRenderer}
                visible={pickerVisible.transferDate}
                onClose={() => {
                  setPickerVisible((preObj) => {
                    return {
                      ...preObj,
                      transferDate: false
                    }
                  });
                }}
              >
                {value => (
                  <span
                    style={{
                      color: getFieldError('transferDate') ? '#dd0008' : value ? '#5E6C84' : '#ccd0d8',
                    }}
                  >
                    {value ? moment(value).format('YYYY-MM-DD') : '请选择过户日期'}
                  </span>
                )}
              </DatePicker>
            }
          >
            过户日期
          </List.Item>
          <Line padding=".4rem" />
        </div>}
        {type !== 'normal' && regionCode == '11' && <>
          <List.Item
            extra={<Input {...inputProps}
              className={getFieldError('certificateNo') && currFocus !== 'certificateNo' ? 'ppberror' : ''}
              onFocus={() => dealFocus('certificateNo')}
              placeholder="请输入凭证编号"
              {...getFieldProps('certificateNo', {
                ref: inputRefs.certificateNo,
                validateTrigger: 'onBlur',
                rules: [
                  // { required: true, message: '请输入凭证编号' },
                  {
                    asyncValidator: (rule, val) => {
                      setCurrFocus('');
                      return new Promise((resolve, reject) => {
                        if (!val) {
                          reject('请输入凭证编号');
                          return;
                        }
                        resolve();
                      })
                    }
                  }],
              })} />}
          >
            车辆来历凭证编号
          </List.Item>
          <Line padding=".4rem" />
          <List.Item
            {...listArrowProps}
            onClick={() => {
              setPickerVisible((preObj) => {
                return {
                  ...preObj,
                  certificateDate: true
                }
              });
            }}
            extra={
              <DatePicker
                {...getFieldProps('certificateDate', {
                  rules: [{ required: true, message: '请选择' }],
                  trigger: 'onConfirm'
                })}
                precision="day"
                min={min}
                max={now}
                renderLabel={labelRenderer}
                visible={pickerVisible.certificateDate}
                onClose={() => {
                  setPickerVisible((preObj) => {
                    return {
                      ...preObj,
                      certificateDate: false
                    }
                  });
                }}
              >
                {value => (
                  <span
                    style={{
                      color: getFieldError('certificateDate') ? '#dd0008' : value ? '#5E6C84' : '#ccd0d8',
                    }}
                  >
                    {value ? moment(value).format('YYYY-MM-DD') : '请选择'}
                  </span>
                )}
              </DatePicker>
            }
          >
            开具车辆来历凭证日期
          </List.Item>
          <Line padding=".4rem" />
        </>}
        {type !== 'normal' && regionCode == '44' && <>
          <List.Item
            {...listArrowProps}
            onClick={() => {
              setPickerVisible((preObj) => {
                return {
                  ...preObj,
                  saleCompanyCityCode: true
                }
              });
            }}
            extra={
              <Picker
                {...getFieldProps('saleCompanyCityCode', {
                  rules: [{ required: true, message: '请选择地区' }],
                  trigger: 'onConfirm'
                })}
                columns={GDArea}
                visible={pickerVisible.saleCompanyCityCode}
                onClose={() => {
                  setPickerVisible((preObj) => {
                    return {
                      ...preObj,
                      saleCompanyCityCode: false
                    }
                  });
                }}
              >
                {value => {
                  return (
                    <span
                      style={{
                        color: getFieldError('saleCompanyCityCode') ? '#dd0008' : value && value[0] ? '#5E6C84' : '#ccd0d8',
                      }}
                    >
                      {value && value[0] ? value[0]?.label : '请选择地区'}
                    </span>
                  )
                }}
              </Picker>
            }
          >
            新车销售公司所在地市
          </List.Item>
          <List.Item
            extra={<Input {...inputProps}
              className={getFieldError('saleCompany') && currFocus !== 'saleCompany' ? 'ppberror' : ''}
              onFocus={() => dealFocus('saleCompany')}
              placeholder="请输入公司名称"
              {...getFieldProps('saleCompany', {
                ref: inputRefs.saleCompany,
                validateTrigger: 'onBlur',
                rules: [{
                  asyncValidator: (rule, val) => {
                    setCurrFocus('');
                    return new Promise((resolve, reject) => {
                      if (!val) {
                        reject('请输入公司名称');
                        return;
                      }
                      resolve();
                    })
                  }
                }],
              })} />}
          >
            新车销售公司名称
          </List.Item>
          <Line padding=".4rem" />
          <List.Item
            extra={
              <Radio.Group
                {...getFieldProps('is4sSale', {
                  // valuePropName: 'checked',
                  initialValue: 1,
                })}
              >
                <Radio {...radioProps} value={1}>
                  是
                </Radio>
                <Radio {...radioProps} style={{ marginLeft: '.6rem' }} value={0}>
                  否
                </Radio>
              </Radio.Group>
            }
          >
            是否4s店销售
          </List.Item>
        </>}
        {type !== 'normal' && regionCode == '31' && <>
          <List.Item
            {...listArrowProps}
            onClick={() => {
              setPickerVisible((preObj) => {
                return {
                  ...preObj,
                  invoiceDate: true
                }
              });
            }}
            extra={
              <DatePicker
                {...getFieldProps('invoiceDate', {
                  rules: [{ required: true, message: '请选择日期' }],
                  trigger: 'onConfirm'
                })}
                precision="day"
                min={min}
                max={now}
                renderLabel={labelRenderer}
                visible={pickerVisible.invoiceDate}
                onClose={() => {
                  setPickerVisible((preObj) => {
                    return {
                      ...preObj,
                      invoiceDate: false
                    }
                  });
                }}
              >
                {value => (
                  <span
                    style={{
                      color: getFieldError('invoiceDate') ? '#dd0008' : value ? '#5E6C84' : '#ccd0d8',
                    }}
                  >
                    {value ? moment(value).format('YYYY-MM-DD') : '请选择日期'}
                  </span>
                )}
              </DatePicker>
            }
          >
            新车发票日期
          </List.Item>
        </>}
      </div>
      <Bottom ref={bottomRef}>
        <div className={styles.submit} onClick={submit}>
          确定信息
        </div>
      </Bottom>

    </div>
  );
}
const FormIndex = createDOMForm()(Index);
export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(
  FormIndex,
);
