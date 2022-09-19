/**报价信息*/
import { connect } from 'dva';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toast, Checkbox, List, Switch, Space, Input, DatePicker, Mask, Radio, Picker } from 'antd-mobile-v5';
import Confirm from '@/components/ModalConfirm/confirm'
import styles from './index.scss';
import Card from '../components/card';
import Line from '../components/line';
import Ball from '../components/ball';
import Bottom from '../components/bottom';
import Plans from './components/plans';
import PersonInfo from './components/personInfo';
import utils from '@/utils/utils';
import moment from 'moment';
import { history } from 'umi';
import PPBLoading from '@/components/Loading/loading.js';


import * as requestMethodsAutomobile from '@/services/publicAutomobile';
import * as requestMethodCarOrder from "@/services/carOrder";

const { generalRequest } = utils;

const idCardWithStar = (idCard) => {
  if (!idCard) return ''
  return idCard.slice(0, 6) + '********' + idCard.slice(14, 17) + "*";
}
const nameWithStar = (name) => {
  if(!name)return ''
  return '*' + name.slice(1);
}

function Index(props) {
  const personInfoRef = useRef();
  const bottomRef = useRef();
  //车辆基本信息
  const [carInfoReq, setCarInfoReq] = useState({});

  //选中的车型
  const [currentModel, setCurrentModel] = useState({});

  //车主、投保人、被保人信息
  const [owner, setOwner] = useState({});


  //最终投保方案
  const [plans, setPlans] = useState([]);
  let plansRef = useRef();
  let XBRef = useRef();

  useEffect(() => {
    plansRef.current = plans;
  }, [plans]);

  //最终提交的对象
  const [submitData, setSubmitData] = useState({});

  let carModelsRef = useRef();
  //车型列表
  const [carModels, setCarModels] = useState([]);
  useEffect(() => {
    carModelsRef.current = carModels;
  }, [carModels]);

  //投保方案数据
  const [plansData, setPlansData] = useState({ plans: [] });

  //是否显示续保查询插件
  const [showBall, setShowBall] = useState(false);
  const [ballDis, setBallDis] = useState(false);

  //保存页面状态
  const savePage = () => {
    const owner = personInfoRef.current.getVal();
    const { dispatch } = props;
    dispatch({
      type: 'publicautomobile/saveQuoteCache',
      payload: {
        currentModel,
        owner,
        plans,
        submitData,
        currentPlans
      }
    });
  };
  //恢复页面状态
  const comebackPage = () => {
    const { publicautomobile: { quoteCache } } = props;
    if (quoteCache) {
      setOwner({ ...quoteCache.owner });
      setSubmitData({ ...quoteCache.submitData });
      if (carModelsRef.current && carModelsRef.current.length > 0) {
        const cacheModel = carModelsRef.current.find(model => model.modelCode === quoteCache.currentModel?.modelCode)
        if (cacheModel) {
          setCurrentModel({ ...cacheModel });
        }
      }
      quoteCache.currentPlans && quoteCache.currentPlans.label && setCurrentPlans({ ...quoteCache.currentPlans });
      quoteCache.plans && quoteCache.plans.length > 0 && setPlans([...quoteCache.plans]);
    }
    clearPage();
  };
  //清除页面缓存
  const clearPage = () => {
    const { dispatch } = props;
    dispatch({
      type: 'publicautomobile/clearQuoteCache'
    });
  };

  //覆盖页面信息,type 1大数据查车，2续保查询
  const updateAllInfo = (allInfo, type = 1,suppInfo = stateBaseInfo) => {
    allInfo = utils.mapValuesToFields(allInfo);

    dealPersonInfo(allInfo,suppInfo);

    setSubmitData({
      ...submitData,
      jqStartDate: allInfo.jqStartDate,
      syStartDate: allInfo.syStartDate,
    });

    if (allInfo.riskDefaultMap && JSON.stringify(allInfo.riskDefaultMap) != '{}') {
      changeCurrentPlans(null, allInfo.riskDefaultMap);
      setCurrentPlans({
        // label: type === 1 ? '大数据方案' : '续保方案'
        label: '续保方案'
      })
    }
  };

  //处理覆盖人员信息数据
  //同车主
  //1.未查询到续保信息/大数据信息
  //2.查询到续保信息/大数据信息，名称与车主名称一致

  //同投保人
  //查询到续保信息/大数据信息，名称不与车主名称一致
  //且 查询到续保信息/大数据信息，名称与投保人名称一致
  const dealPersonInfo = (allInfo,suppInfo) => {
    let preCarOwner = {
      ...allInfo.carOwner,
      //处理证件类型没有证件号的默认身份证
      idCardType: allInfo.carOwner?.idCard ? [allInfo.carOwner.idCardType + ''] : ['0'],
    };
    //优先采用补充信息里的名字然后是大数据或续保有可能没有名字
    preCarOwner.name = suppInfo.owner||preCarOwner.name;
    let preInsured = Array.isArray(allInfo.insured) ? {
      ...allInfo.insured[0]
    } : {
      ...allInfo.insured
    };
    preInsured.idCardType = Array.isArray(preInsured.idCardType) ?preInsured.idCardType:[preInsured.idCardType+''];
    let prePolicyHolder = { ...allInfo.applicant }
    prePolicyHolder.idCardType = Array.isArray(prePolicyHolder.idCardType) ?prePolicyHolder.idCardType:[prePolicyHolder.idCardType+''];

    let PToO = true, IToO = true, IToP = false
    if (prePolicyHolder.name) {
      if (prePolicyHolder.name == preCarOwner.name) {
        PToO = true;
        prePolicyHolder = { ...preCarOwner };
      } else {
        PToO = false;
      }
    } else {
      // prePolicyHolder = { ...preCarOwner };
      PToO = false;
    }

    if (preInsured.name) {
      if (preInsured.name == preCarOwner.name) {
        IToO = true;
        preInsured = { ...preCarOwner };
      } else if (preInsured.name == prePolicyHolder.name) {
        IToP = true;
        IToO = false;
        preInsured = { ...prePolicyHolder };
      }else{
        IToO = false;
      }
    } else {
      // preInsured = { ...preCarOwner }
      IToO = false;
    }
    //当投保人跟被保人都确认好数据后处理脱敏
    preCarOwner = {
      ...preCarOwner,
      nameNoStar: preCarOwner.name,
      name: nameWithStar(preCarOwner.name),
      idCardNoStar: preCarOwner.idCard,
      idCard: preCarOwner.idCardType[0] === '0' ? idCardWithStar(preCarOwner.idCard) : preCarOwner.idCard
    }

    preInsured = {
      ...preInsured,
      nameNoStar: preInsured.name,
      name: nameWithStar(preInsured.name),
      idCardType: preInsured.idCardType && preInsured.idCardType!=-1 ? [preInsured.idCardType + ''] : ['0'],
      idCardNoStar: preInsured.idCard,
      idCard: preInsured.idCardType[0] === '0' ? idCardWithStar(preInsured.idCard) : preInsured.idCard
    }
    prePolicyHolder = {
      ...prePolicyHolder,
      nameNoStar: prePolicyHolder.name,
      name: nameWithStar(prePolicyHolder.name),
      idCardType: prePolicyHolder.idCardType && prePolicyHolder.idCardType!=-1 ? [prePolicyHolder.idCardType + ''] : ['0'],
      idCardNoStar: prePolicyHolder.idCard,
      idCard: prePolicyHolder.idCardType[0] === '0' ? idCardWithStar(prePolicyHolder.idCard) : prePolicyHolder.idCard
    }
    let newOwner = {
      owner: preCarOwner,
      insured: preInsured,
      policyHolder: prePolicyHolder,
      IToO,
      IToP,
      PToO
    }
    setOwner(newOwner);
  }
  const [XBData, setXBData] = useState({});
  useEffect(() => {
    XBRef.current = XBData;
  }, [XBData]);

  const showXB = (data) => {
    if (!data && !XBRef.current) {
      return;
    }

    //判断还在不在当前页面
    if (window.location.hash.toUpperCase() !== '#/PublicAutomobile/quoteInfo'.toUpperCase()) {
      return;
    }
    const params = data ?? XBRef.current;
    Confirm.show({
      title: '续保信息查询成功',
      content: '您的续保信息查询成功，使用续保方案将覆盖您当前方案，请您确认是否使用续保信息',
      showCancel: true,
      cancelText: '否',
      confirmText: '是',
      onConfirm: () => {
        updateAllInfo(params, 2);
        Toast.show('方案已替换为续保方案');
      }
    })
  };

  //获取投保方案列表并更新页面localCarInfo:大数据查车信息；finalInfo：补充车辆信息
  const initPlansAndDoUpdate = async (localCarInfo, finalInfo, res) => {
    // const res = await generalRequest({}, requestMethodsAutomobile.plans);
    //picker 接收的数据是二维数组，[[{label:'',value:''}]]
    res.data.plans = [res.data?.plans?.map(item => {
      return {
        label: item.name,
        value: item.planId
      }
    })];
    setPlansData({ ...res.data });
    setPlans([...res.data.risks]);
    //默认选中第一个方案
    const cp = res.data.plans[0][0];
    setCurrentPlans(cp);
    changeCurrentPlans(cp, null, [...res.data.risks], [...res.data.planRiskDefaults]);
    //成果获取投保方案后进行页面覆盖，大数据查车或者续保查询
    setTimeout(async () => {
      bottomRef.current && bottomRef.current.refresh();
      //查询到大数据查车覆盖页面信息
      if (localCarInfo.hasValidRenewal) {
        updateAllInfo(localCarInfo, 1,finalInfo);
        //再次报价从订单设置车型
        let modelStr = localStorage.modelInfo;
        if (modelStr) {
          let modelInfo = JSON.parse(modelStr);
          setCurrentModel(modelInfo);
          localStorage.removeItem('modelInfo');
        }
        //如果有缓存就恢复缓存,缓存优先级最高，最后执行
        comebackPage();
      } else {
        //如果有缓存就恢复缓存
        comebackPage();
        //没有查询到大数据查车，去进行续保查询，先查询是否开通续保查询能力
        if (finalInfo.carLicenseNo) {
          const renewalRes = await generalRequest({}, requestMethodsAutomobile.renewal);
          if (renewalRes && renewalRes.data === true) {
            setShowBall(true);
            // setTimeout(() => {
            //   setXBData({});
            //   setCompleted(true);
            //   setSuccess(true)
            //   showXB({});
            //   setBallDis(true);
            // }, 10000);
            //调用续保查询接口
            try {
              const xbRes = await generalRequest(finalInfo, requestMethodsAutomobile.xbcx)
              if (xbRes && xbRes.code === 200) {
                localStorage.setItem('renewalCarInfo',JSON.stringify(xbRes.data));
                setXBData(xbRes.data);
                setCompleted(true);
                setSuccess(true)
                showXB(xbRes.data);
              } else {
                setCompleted(true);
                setSuccess(false);
                setBallDis(true);
              }
            } catch (e) {
              setCompleted(true);
              setBallDis(true);
            }
          }
        }
      }
    }, 0);
  };

  const [stateBaseInfo,setStateBaseInfo] = useState({})

  const initPreData = async () => {
    //获取本地大数据查车数据
    const localCarInfoStr = localStorage.getItem('carInfo');
    const localCarInfo = localCarInfoStr ? JSON.parse(localCarInfoStr) : '';

    //获取本地缓存车辆基本信息,baseCarInfo在大数据查车full的时候等于carInfo
    const localBaseCarInfoStr = localStorage.getItem('baseCarInfo');
    const localBaseCarInfo = localBaseCarInfoStr ? JSON.parse(localBaseCarInfoStr) : '';
    if (localBaseCarInfo) {
      localBaseCarInfo.vinNo = localBaseCarInfo.vinCode ?? localBaseCarInfo.vinNo;
      const baseFinalInfo = utils.mapFieldsToValues(localBaseCarInfo);
      //基本信息脱敏,withStar的属性只做展示
      const bf = {
        ...baseFinalInfo,
        vinCodeWithStar: baseFinalInfo.vinCode.slice(0, 7) + '*******' + baseFinalInfo.vinCode.slice(14),
        engineNoWithStart: baseFinalInfo.engineNo.slice(0, 3) + '**' + baseFinalInfo.engineNo.slice(5),
        ownerWithStar: nameWithStar(baseFinalInfo.owner),
      }
      setCarInfoReq(bf);
      setOwner({
        owner: { idCardType: ['0'], name: baseFinalInfo.owner },
        insured: { idCardType: ['0'] },
        policyHolder: { idCardType: ['0'] },
        PToO: true,//投保人同车主
        IToO: true,//被保人同车主
        IToP: false//被保人同投保人
      })
      //获取车型信息
      const modelReq = generalRequest(baseFinalInfo, requestMethodsAutomobile.model)
        .then(res => {
          setCarModels(res.data?.carModels);
          localStorage.setItem('carModels', JSON.stringify(res.data?.carModels));
          const defaultModel = res.data?.carModels?.find(model => {
            return model.default === true;
          });

          setCurrentModel(defaultModel ?? {})
        });

      const plansReq = generalRequest({}, requestMethodsAutomobile.plans);
      const initData = await Promise.all([modelReq, plansReq]);
      setStateBaseInfo({...baseFinalInfo});
      initPlansAndDoUpdate(localCarInfo, baseFinalInfo, initData[1]);
    } else {
      Toast.show({
        content: '车辆基本信息错误',
        duration: 2000
      });
    }
  };
  const initDataFromOrder = async (orderId) => {
    clearPage();
    PPBLoading.show();
    generalRequest({ orderId }, requestMethodCarOrder.queryDetail)
      .then((res) => {
        const { car, insured, order, owner, policy, } = res.data;

        //解决再次报价补充信息不生效问题
        const preCarInfoStr = localStorage.baseCarInfo;
        let preCarInfo = preCarInfoStr ? JSON.parse(preCarInfoStr) : {};

        let resCar = {
          ...car,
          carLicenseNo: car.carLicenseNo === '新车未上牌' ? '' : car.carLicenseNo,
          notRegister: car.carLicenseNo === '新车未上牌' ? 1 : 0
        };
        preCarInfo = preCarInfo.carLicenseNo === resCar.carLicenseNo ? preCarInfo : {};
        let targetInfo = {
          ...preCarInfo,
          ...resCar,
          hasValidRenewal: true,
          owner: owner.name,
          carOwner: {
            ...owner,
            mobile: owner.phone
          },
          insured: {},
          applicant: {},
          riskDefaultMap: {},
          full: true,
        }
        const targetStr = JSON.stringify(targetInfo);
        const modelStr = JSON.stringify({
          modelStr: resCar.modelStr,
          modelCode: resCar.modelCode,
          seat: resCar.seat,
        });
        localStorage.setItem('carInfo', targetStr);
        localStorage.setItem('baseCarInfo', targetStr);
        localStorage.setItem('modelInfo', modelStr);
        localStorage.setItem('regionCode', order.provinceCode);
        localStorage.setItem('cityCode', order.cityCode);
        initPreData();
        PPBLoading.hide();
      })
      .catch(() => {
        PPBLoading.hide();
      })
  };
  useEffect(() => {
    // PPBLoading.show();
    // return;
    console.log('[quoteinfo]', props.publicautomobile.quoteCache);
    document.title = '报价信息';
    const { location: { query: { orderId = '' } } } = props;
    if (orderId) {
      initDataFromOrder(orderId);
    } else {
      initPreData();
    }
  }, []);

  const labelRenderer = useCallback((type, data) => {
    switch (type) {
      case 'year':
        return data + '年'
      case 'month':
        return data + '月'
      case 'day':
        return data + '日'
      case 'hour':
        return data + '时'
      case 'minute':
        return data + '分'
      case 'second':
        return data + '秒'
      default:
        return data
    }
  }, [])

  const doValidate = () => {
    return new Promise((resolve, reject) => {
      if (!currentModel.modelCode) {
        Toast.show('请选择车型');
        setCarModelsVisible(true);
        return reject();

      }
      personInfoRef.current.validate((error) => {
        if (error) {
          Toast.show(error)
          return reject(error);
        }
        const mainRisk = plans.find(item => item.isMainRisk === 1 && item.checked !== '不投保');
        if (!mainRisk) {
          Toast.show('至少选择一个主险');
          return reject();
        }
        resolve();
      })
    })
  }
  const submit = () => {
    doValidate().then(async() => {
      const personInfoNoStar = await personInfoRef.current.getNoStarVal();
      let mapedData = { ...submitData, ...personInfoNoStar };

      mapedData = utils.mapFieldsToValues(mapedData, {
        syStartDate: 'YYYY-MM-DD HH:mm:ss',
        jqStartDate: 'YYYY-MM-DD HH:mm:ss',
      });


      const provinceCode = localStorage.getItem('regionCode');
      const mapedcarInfoReq = {
        ...carInfoReq,
        provinceCode: provinceCode,
        isTransferFirstYear: carInfoReq.isTransferFirstYear ?? 0,
        notRegister: carInfoReq.notRegister ?? 0,
        seat: currentModel.seat
      };

      let params = {
        ...mapedData,
        carInfoReq: mapedcarInfoReq,
        plans: plans,
        modelCode: currentModel.modelCode,
        modelStr: currentModel.modelStr,
        cityCode: localStorage.cityCode,
        openId: JSON.parse(localStorage.loginData || '{}').openid
      };
      PPBLoading.show();
      generalRequest(params, requestMethodsAutomobile.quoteCommit)
        .then((res) => {
          savePage();
          localStorage.setItem('quoteBaseRes', res.data);
          localStorage.setItem('currentModel', JSON.stringify(currentModel));
          history.push('/PublicAutomobile/quote');
        })
        .finally(() => {
          PPBLoading.hide();
        })
    }).catch(e => { })
  }

  const toSupp = () => {
    savePage();
    history.push(`/PublicAutomobile/supplementCarInfo?${carInfoReq.carLicenseNo ? '' : 'type=new'}`);
  }


  const listArrowProps = {
    arrow: <img style={{ width: '.12rem', height: '.22rem', marginLeft: '.14rem' }} src={require('../images/form-arrow.png')} />
  };

  const switchProps = {
    style: {
      '--width': '.8rem',
      '--height': '.5rem',
      '--border-width': '.02rem',
      '--checked-color': 'linear-gradient(270deg, #0AB88D 0%, #5B8EFF 100%)'
    }
  };
  const inputProps = {
    style: {
      '--color': '#333D4F',
      '--text-align': 'right',
      '--font-size': '.28rem',
    }
  };

  const radioProps = {
    icon: checked =>
      checked ? (
        <img src={require('../images/checked.png')} style={{ width: '.4rem', height: '.4rem' }} />
      ) : (
        <img src={require('../images/normal.png')} style={{ width: '.4rem', height: '.4rem' }} />
      ),
  };



  //交强险起保时间
  const [jqStartDateVisible, setJqStartDateVisible] = useState(false);
  //商业险起保时间
  const [syStartDateVisible, setSyStartDateVisible] = useState(false);

  //显示车型
  const [carModelsVisible, setCarModelsVisible] = useState(false);

  //显示推荐方案
  const [plansVisible, setPlansVisible] = useState(false);

  //选中的推荐方案
  const [currentPlans, setCurrentPlans] = useState({});

  //缓存的车型
  const [cachModel, setCachModel] = useState({});
  const [completed, setCompleted] = useState(false);
  const [success, setSuccess] = useState(false);

  //变换当前方案
  const changeCurrentPlans = (prePlans, defaultValueMap, defaultPlans, defaultAllValueMap) => {
    //传入defaultValueMap代表 除了picker的其他方式变换方案
    const valueMap = defaultValueMap ?? (defaultAllValueMap ?? plansData.planRiskDefaults)?.find(item => item.planId == prePlans.value)?.riskDefaultMap;

    if (valueMap) {
      const changeValue = (plan) => {
        // plan.checked = valueMap[plan.id] ?? plan.checked;
        //附加险没有值默认改为不投保
        plan.checked = valueMap[plan.id] ?? plan.options?.find?.(item => item.optionKey === '0')?.optionValue;
        if (plan.child) {
          plan.child.forEach(childPlan => {
            changeValue(childPlan);
          });
        }
      };
      const forPlans = defaultPlans ?? plansRef.current;
      forPlans.forEach(plan => {
        changeValue(plan);
      })
      setPlans([...forPlans]);
    }
  }

  return <div className={styles.con}>
    <Mask visible={carModelsVisible} onMaskClick={() => {
      setCurrentModel({ ...cachModel });
      setCarModelsVisible(false);
    }}>
      <div className={styles.carModelsCon}>
        <div className={styles.carModelsTitle}>
          <span>选择车型</span>
          <span onClick={() => {
            setCarModelsVisible(false);
          }}>确定</span>
        </div>
        <div className={styles.carModelsContent}>

          {carModels && carModels.map(model => {
            return <div className={styles.carModelsItem} key={model.modelCode} onClick={() => {
              setCurrentModel(model);
              // setCarModelsVisible(false);
            }}>
              <span>{model.modelStr}</span>
              <Radio disabled className={styles.carModelsRadio} {...radioProps} onChange={() => {
                setCurrentModel(model);
              }} checked={model.modelCode == currentModel.modelCode} />
            </div>
          })}
        </div>
      </div>
    </Mask>
    {showBall && <Ball showRing showSuccess success={success} completed={completed} disabled={ballDis} onClick={() => {
      if (completed) showXB();
    }} />}

    <Space direction='vertical' style={{ '--gap': '.2rem', width: '100%' }}>
      <Card
        leftExtra="车辆信息"
        onRightExtraClick={toSupp}
        rightExtra={
          <img
            style={{ width: '.24rem', height: '.3rem' }}
            src={require('../images/edit.png')} />
        } >

        <List.Item extra={carInfoReq.ownerWithStar}>车主</List.Item>
        <List.Item extra={carInfoReq.carLicenseNo || '新车未上牌'}>车牌号</List.Item>
        <List.Item extra={carInfoReq.vinCodeWithStar}>车架号</List.Item>
        <List.Item extra={carInfoReq.registDate}>初登日期</List.Item>
        <List.Item extra={carInfoReq.standardFullName}>品牌型号</List.Item>
        <Line add='.6rem' offset='.3rem' marginTopAndBottom='.2rem' />
        <List.Item {...listArrowProps} extra={
          <span onClick={() => {
            setCachModel({ ...currentModel });
            setCarModelsVisible(true);
          }}
            className={styles.carModelSpan}
            style={{ color: currentModel.modelStr ? '#333D4F' : '#ccd0d8' }}
          >{currentModel.modelStr || '请选择车型'}
          </span>}>
          车型
        </List.Item>
      </Card>
      <PersonInfo data={owner}
        wrappedComponentRef={(inst) => personInfoRef.current = inst}
        onChange={(data) => {
          setOwner({...data})
        }} />
      <Card
        leftExtra={
          <div onClick={() => {
            setPlansVisible(true)
          }}>
            <span>{currentPlans.label ?? '推荐投保方案'}</span>
            <img
              style={{ width: '.2rem', height: '.1rem', marginLeft: '.14rem' }}
              src={require('../images/arrow-down.png')} />
            <Picker
              columns={plansData.plans}
              visible={plansVisible}
              onClose={() => {
                setPlansVisible(false);
              }}
              onConfirm={(value, valueObj) => {
                if (valueObj?.items?.length > 0) {
                  setCurrentPlans(valueObj.items[0]);
                  changeCurrentPlans(valueObj.items[0]);
                }
                setPlansVisible(false);
              }}
            />
          </div>}
      >
        <Plans data={plans} onChange={(newData) => {
          setPlans(newData);
          setCurrentPlans({
            label: '自定义方案'
          })
        }} />
      </Card>
      <Card
        leftExtra="起保日期" >

        <List.Item {...listArrowProps}
          onClick={() => {
            setJqStartDateVisible(true)
          }} extra={
            <DatePicker
              precision='day'
              renderLabel={labelRenderer}
              value={submitData.jqStartDate}
              visible={jqStartDateVisible}
              onConfirm={(value) => {
                setSubmitData((preData) => {
                  return {
                    ...preData,
                    jqStartDate: value
                    // jqStartDate: moment(value).format('YYYY-MM-DD HH:mm')
                  }
                });
                setJqStartDateVisible(false);
              }}
              onClose={() => {
                setJqStartDateVisible(false)
              }}
            >
              {value => <span style={{ color: '#5E6C84' }}>{value ? moment(value).format('YYYY-MM-DD') : '请选择日期'}</span>}
            </DatePicker>
          }>交强险起保日期</List.Item>
        <List.Item {...listArrowProps}
          onClick={() => {
            setSyStartDateVisible(true)
          }} extra={
            <DatePicker
              precision='day'
              renderLabel={labelRenderer}
              visible={syStartDateVisible}
              value={submitData.syStartDate}
              onConfirm={(value) => {
                setSubmitData((preData) => {
                  return {
                    ...preData,
                    // syStartDate: moment(value).format('YYYY-MM-DD HH:mm')
                    syStartDate: value
                  }
                });
                setSyStartDateVisible(false);
              }}
              onClose={() => {
                setSyStartDateVisible(false)
              }}
            >
              {value => {
                return <span style={{ color: '#5E6C84' }}>{value ? moment(value).format('YYYY-MM-DD') : '请选择日期'}</span>
              }}
            </DatePicker>}>商业险起保日期</List.Item>
      </Card>
    </Space>
    <Bottom ref={bottomRef}>
      <div className={styles.submit} onClick={submit}>确认以上信息，去报价</div>
    </Bottom>
  </div>
}

export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(Index)
