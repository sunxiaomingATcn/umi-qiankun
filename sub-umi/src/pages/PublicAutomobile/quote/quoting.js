/**选择保司*/
import { connect } from 'dva';
import React, { useState, useEffect, useCallback } from 'react';
import { createForm } from 'rc-form';
import { List, Radio, Input, Switch, DatePicker, Picker, Toast, Mask, PullToRefresh } from 'antd-mobile-v5';
import styles from './quoting.scss';
import WxSdk from '@/utils/wx-sdk';
import utils from '@/utils/utils';
import moment from 'moment';
import { history } from 'umi';
import PPBLoading from '@/components/Loading/loading.js';
import Ball from '../components/ball';
import Agreement from '../components/agreement';
import * as requestMethodsAutomobile from '@/services/publicAutomobile';
import Confirm from '@/components/ModalConfirm/confirm'
import routerTrack from '@/components/routerTrack';
import Loading from '@/components/Loading/spotLoading';
import CacheUtil from '@/utils/CacheUtil';


const { generalRequest } = utils;

let queryTimer = null;

// function Loading() {
//   return <div className={styles.refreshLoading}>
//     <div className={styles.loader6}>
//       <svg width="38px" height="10px" viewBox="0 0 38 10">
//         <circle fill="#3A3A3A" cx="4" cy="5" r="4" />
//         <circle fill="#3A3A3A" cx="19" cy="5" r="4" />
//         <circle fill="#3A3A3A" cx="34" cy="5" r="4" />
//       </svg>
//     </div>
//   </div>
// }

function Index(props) {
  const [agreement, setAgreement] = useState({});
  const [companys, setCompanys] = useState([
  ]);
  const [userInfo, setUserInfo] = useState({});
  const [quoteCompanys, setQuoteCompanys] = useState([
  ]);
  const [bcCode, setBcCode] = useState('');

  useEffect(() => {
    document.title = '报价列表';
    props.trackStart(localStorage.quoteRes);
    const bId = CacheUtil.getBigDataCarInfo().companyId;
    const rId = CacheUtil.getRenewalCarInfo().companyId;
    setBcCode(rId ?? bId ?? '-999');
    const currentModelStr = localStorage.getItem('currentModel');
    const carModelsStr = localStorage.getItem('carModels');

    const userInfoStr = localStorage.getItem('userInfo');
    setUserInfo(JSON.parse(userInfoStr || '{}'));
    if (currentModelStr && carModelsStr) {
      const CM = JSON.parse(currentModelStr);
      const CMS = JSON.parse(carModelsStr);
      setCarModels(CMS);
      setCurrentModel(CM);
    }
    initData();
    return function cleanUp() {
      if (queryTimer) clearTimeout(queryTimer);
    }
  }, []);
  const initData = () => {
    const quoteCompanysStr = localStorage.getItem('quoteCompanys');
    return new Promise((resolve, reject) => {
      if (quoteCompanysStr) {
        const QC = JSON.parse(quoteCompanysStr)
        generalRequest({ quoteId: localStorage.quoteRes }, requestMethodsAutomobile.quotes)
          .then(res => {
            console.log('[quoteCompanys]', quoteCompanys)
            let hasQuoting = false;
            setCompanys(res.data.map(company => {
              if (company.quoteStatus === 'quoting') hasQuoting = true;
              const quoteCompany = QC.find(item => item.thirdId === company.thirdId);
              if (quoteCompany) {
                return {
                  ...quoteCompany,
                  ...company
                };
              }
              return company;
            }));
            if (hasQuoting) {
              queryTimer = setTimeout(() => {
                //两秒钟查一次
                initData();
              }, 2000);
            }
          })
          .finally(() => {
            resolve();
          })
      } else {
        resolve();
      }
    });
  };
  //车型列表
  const [carModels, setCarModels] = useState([]);

  //选中的车型
  const [currentModel, setCurrentModel] = useState({});

  //待修改车型的公司
  const [preCompany, setPreCompany] = useState({});

  //显示车型
  const [carModelsVisible, setCarModelsVisible] = useState(false);

  const modifyModel = (company) => {
    setPreCompany({ ...company });
    setCarModelsVisible(true);
  };

  const confirmCarModel = () => {
    PPBLoading.show();
    generalRequest({
      ...currentModel,
      quoteId: localStorage.quoteRes,
      thirdId: preCompany.thirdId
    }, requestMethodsAutomobile.byModel)
      .then(res => {
        initData();
      })
      .finally(() => {
        PPBLoading.hide();
      })
  };

  const radioProps = {
    icon: checked =>
      checked ? (
        <img src={require('../images/checked.png')} style={{ width: '.4rem', height: '.4rem' }} />
      ) : (
        <img src={require('../images/normal.png')} style={{ width: '.4rem', height: '.4rem' }} />
      ),
  };


  let success = 0, fail = 0, ing = 0, alertMessage = '';
  companys.forEach(company => {
    switch (company.quoteStatus) {
      case 'quoteSuccess':
        success++;
        break;
      case 'quoting':
        ing++;
        break;
      case 'quoteFail':
        fail++;
        break;
    }
  });
  alertMessage = `${ing} 家保险公司正在报价...`;
  if (success > 0) {
    alertMessage = `${success} 家保险公司成功报价，${ing} 家保险公司正在报价...`;
  }
  if (ing === 0) {
    alertMessage = `${success} 家保险公司成功报价`
  }

  const showAgreement = (type) => {
    setAgreement({
      type: type,
      show: true
    })
  }
  return <>
    <Agreement visible={agreement.show} type={agreement.type} onClose={() => {
      setAgreement({
        ...agreement,
        show: false
      })
    }} />
    <PullToRefresh
      headHeight={50}
      pullingText={<Loading />}
      canReleaseText={<Loading />}
      refreshingText={<Loading />}
      completeText={<Loading />}
      onRefresh={initData}>

      <div className={styles.con}>
        {success >= 2 && <Ball up="PK" down="对比" upSize=".28rem" onClick={() => {
          history.push('/PublicAutomobile/quote/pk');
        }} />}

        <Mask visible={carModelsVisible} onMaskClick={() => {
          setCarModelsVisible(false);
        }}>
          <div className={styles.carModelsCon}>
            <div className={styles.carModelsTitle}>
              <span>选择车型</span>
              <span onClick={() => {
                confirmCarModel();
                setCarModelsVisible(false);
              }}>确定</span>
            </div>
            <div className={styles.carModelsContent}>

              {carModels && carModels.map(model => {
                return <div className={styles.carModelsItem} key={model.modelCode} onClick={() => {
                  setCurrentModel(model);
                }}>
                  <span>{model.modelStr}</span>
                  <Radio disabled className={styles.carModelsRadio} {...radioProps} checked={model.modelCode == currentModel.modelCode} />
                </div>
              })}
            </div>
          </div>
        </Mask>
        <img onClick={() => {
          Toast.show(alertMessage)
        }} style={{ width: '100%', position: 'absolute', top: '0' }} src={require('../images/quotingbg.png')} />
        <div className={styles.alert} >
          <img src={require('../images/quoting.png')} />
          <span>{alertMessage}</span>
        </div>
        <div className={styles.companysCon}>
          {
            companys && companys.map((company, index) => {
              // company.reason = '提醒：网络连接失败，请稍后重试；未到可报价时间，或已在其他保司投保；报价车型错误，请确认车型；网络连接失败，请稍后重试；未到可报价时间，或已在其他保司投保；水电费老师发的链接是否就是到了福建师范计算机的房间睡懒觉法力水晶法力水晶大风大浪开发。'
              // company.renewal = true;
              // company.quoteStatus = 'quoteSuccess';
              return <div className={styles.company} key={index} onClick={() => {

                company.quoteStatus == 'quoteSuccess' && Confirm.show({
                  title: '您即将进入投保流程',
                  content: <div>
                    请仔细阅读<span style={{ color: '#437DFF' }}><span onClick={() => showAgreement('bxtk')}>《保险条款》</span><span onClick={() => showAgreement('tbxz')}>《投保须知》</span><span onClick={() => showAgreement('khgzs')}>《客户告知书》</span></span>及其他相关内容。本产品由您选中保司承保，由{userInfo.mainDeptName}代理销售并提供销售服务。为保障您的权益，我们将会安全记录您的操作。
                  </div>,
                  confirmText: '知道了',
                  onConfirm: () => {
                    history.push('/PublicAutomobile/quote/quoteDetail?id=' + company.quoteResultId);
                  }
                })
              }}>
                {company.bcCode == bcCode &&
                  <img className={styles.xu} src={require('../images/xu.png')} />
                }
                <div className={styles.left}>
                  <div className={styles.leftTop}>
                    <div className={styles.logo}>
                      <img src={company.logo} />
                    </div>
                    <div className={styles.mid}>
                      <span>{company.name}</span>
                      <span>{company.remark || '暂无备注'}</span>
                    </div>
                  </div>

                  {
                    company.reason &&
                    <div className={styles.reason}>
                      <img src={require('../images/warn.png')} />
                      <span>{company.reason}</span>
                    </div>
                  }

                  {/* {
                  company.updateModel &&
                  <div onClick={() => {
                    modifyModel(company);
                  }} className={styles.modifyModel}>修改车型</div>
                } */}

                </div>
                <div className={styles.right}>
                  {company.quoteStatus == 'quoteSuccess' &&
                    <div className={styles.success}>
                      <span>￥{company.premium ?? '3103.14'}</span>
                      <img src={require('../images/form-arrow.png')} />
                    </div>
                  }
                  {company.quoteStatus == 'quoteFail' &&
                    <div className={styles.fail}>
                      <span>报价失败</span>
                    </div>
                  }
                  {company.quoteStatus == 'quoting' &&
                    <div className={styles.ing}>
                      <svg width=".4rem" height=".4rem" viewBox="0 0 44 44">
                        <path fill="#5B8EFF"
                          d="M42,23.5 C41.2,23.5 40.5,22.8 40.5,22 C40.5,11.8 32.2,3.5 22,3.5 C21.2,3.5 20.5,2.8 20.5,2 C20.5,1.2 21.2,0.5 22,0.5 C33.9,0.5 43.5,10.1 43.5,22 C43.5,22.8 42.8,23.5 42,23.5 Z M22,43.5 C10.1,43.5 0.5,33.9 0.5,22 C0.5,21.2 1.2,20.5 2,20.5 C2.8,20.5 3.5,21.2 3.5,22 C3.5,32.2 11.8,40.5 22,40.5 C22.8,40.5 23.5,41.2 23.5,42 C23.5,42.8 22.8,43.5 22,43.5 Z" />
                      </svg>
                    </div>
                  }
                </div>
              </div>
            })
          }
        </div>
      </div>
    </PullToRefresh>
  </>
}
const FormIndex = createForm()(Index);
const routerTrackIndex = routerTrack({ id: 'pageQuoting', autoStart: false })(FormIndex);

export default connect(({ publicautomobile, publichome }) => ({ publicautomobile, publichome }))(
  routerTrackIndex,
);
