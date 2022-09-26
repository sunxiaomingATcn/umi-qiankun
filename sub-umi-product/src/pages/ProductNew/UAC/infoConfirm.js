/**
 * title: 车辆信息确认
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import TracBacks from '@/utils/trackBacks';
import styles from './assets/css/index.less';
import { history } from 'umi';
import { Toast, InputItem, DatePicker, List } from 'antd-mobile';
import moment from 'moment';
import { createForm } from 'rc-form';
import routerTrack from '@/components/routerTrack';


const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault(),
  };
}
let maxDate = new Date(
  moment().format('YYYY-MM-DD'),
);
let minDate = new Date(
  moment()
    .add(2, 'days')
    .subtract(96, 'months')
    .format('YYYY-MM-DD'),
);
let Months72 = new Date(
  moment()
    .add(1, 'days')
    .subtract(72, 'months')
    .format('YYYY-MM-DD'),
);
@routerTrack({ id: 'page12' })
@connect(({ login, productNew, loading }) => ({
  login,
  productNew,
  loading: loading.effects,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // TracBacks.chebaoyi.start('page10', true);
    const { dispatch } = this.props;
    Toast.loading('Loading...', 0);
    dispatch({
      type: 'productNew/ocrVehicleLicenseFront',
      payload: {
        encodeFile: localStorage.drivingLicense.split('base64,')[1],
      },
    }).then(res => {
      Toast.hide();
      if (res && res.code == 200) {
        this.setState({ detail: res.data });
      }else{
        Toast.info("识别行驶证失败")
      }
    });
  }

  handSubmit = () => {
    Toast.loading('Loading...', 0);
    const { query } = this.props.location;
    const { detail } = this.state;
    const { dispatch } = this.props;
    this.props.form.validateFields((error, values) => {
      console.log(values, 'values');
      if (!error) {
        if (detail && detail.useCharacter != '非营运') {
          Toast.info('非营运车辆才可投保!', 3);
          return;
        }
        if (
          moment(values.enrollDate) > moment(maxDate) ||
          moment(values.enrollDate) < moment(minDate)
        ) {
          Toast.info('此车辆暂不支持投保此产品');
          return;
        }
        let carInfo = { ...values };
        carInfo.enrollDate = moment(values.enrollDate).format('YYYY-MM-DD');
        carInfo.regDate = moment(values.regDate).format('YYYY-MM-DD');
        dispatch({
          type: 'productNew/getIdentifyModelByVIN',
          payload: {
            vin: carInfo.vinNo,
          },
        }).then(res => {
          if (res && res.status == 1) {
            carInfo = { ...carInfo, ...res.data };
            dispatch({
              type: 'productNew/getEvalPriceByVIN',
              payload: {
                vin: carInfo.vinNo,
                carNo: carInfo.licensePlateNo,
                regDate: carInfo.enrollDate,
                mileAge: Number(carInfo.currentMileage),
              },
            }).then(result => {
              if (result && result.status == 1) {
                Toast.hide();
                carInfo = { ...carInfo, ...result.data };
                dispatch({
                  type: 'productNew/getCarModelInfo',
                  payload: {
                    modelId: carInfo.modelId,
                  },
                }).then(response => {
                  if (response && response.status == 1) {
                    let flag = true;
                    carInfo = { ...carInfo, ...response.data };

                    let carNameList = ['丰田', '本田', '日产', '马自达'];
                    const {
                      condition,
                      individualPrice,
                      vehicleType,
                      isGreen,
                      isParallel,
                      enrollDate,
                      brandName,
                      currentMileage,
                    } = carInfo;
                    if (condition !== 'good' && condition !== 'excellent') {
                      flag = false;
                    } else if (
                      (condition == 'good' || condition !== 'excellent') &&
                      (individualPrice < 3.5 || individualPrice > 15)
                    ) {
                      flag = false;
                    } else if (vehicleType == 2) {
                      flag = false;
                    } else if (isGreen === '1' || isParallel === '1') {
                      flag = false;
                    } else if (
                      (moment(enrollDate) <= moment(Months72)||moment(enrollDate,'YYYY-MM-DD').isSame(moment(Months72,'YYYY-MM-DD'),'day')) &&
                     ( moment(enrollDate) >= moment(minDate)||moment(enrollDate,'YYYY-MM-DD').isSame(moment(minDate,'YYYY-MM-DD'),'day'))
                    ) {
                      if (!carNameList.includes(brandName)) {
                        flag = false;
                      }
                      if (currentMileage > 180000) {
                        flag = false;
                      }
                    } else if (
                      (moment(enrollDate) >= moment(minDate)||moment(enrollDate,'YYYY-MM-DD').isSame(moment(minDate,'YYYY-MM-DD'),'day')) &&
                      moment(enrollDate) > moment(Months72)
                    ) {
                      if (currentMileage > 150000) {
                        flag = false;
                      }
                    }
                    if (!flag) {
                      Toast.info('您的车辆暂不支持投保此产品');
                    } else {
                      history.push({
                        pathname: '/ProductNew/insured',
                        query: query,
                      });
                    }
                    localStorage.setItem('carInfo', JSON.stringify(carInfo));
                  }
                });
              }
            });
          }
        });
      } else {
        Toast.hide();
      }
    });
  };

  errorToast = () => {
    Toast.info('此车辆暂不支持投保此产品');
  };

  render() {
    const { detail } = this.state;
    const {
      getFieldProps,
      getFieldError,
      getFieldDecorator,
      getFieldsValue,
      getFieldValue,
    } = this.props.form;
    // this.getMaxDate();
    let errors = getFieldError(`vinNo`);
    return (
      <div className={styles.infoConfirm}>
        <div className={styles.infoItem}>
          <InputItem
            {...getFieldProps(`vinNo`, {
              initialValue: detail && detail.vinNo,
              rules: [
                {
                  required: true,
                  message: `请输入车架号`,
                },
                {
                  pattern: /^[A-HJ-NPR-Z\\da-hj-np-z0-9]{17}$/,
                  message: `请输入正确的车架号`,
                },
              ],
            })}
            type="text"
            placeholder="请输入车架号"
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
          >
            车架号
          </InputItem>
          <div className={styles.error}>{getFieldError(`vinNo`) && getFieldError(`vinNo`)[0]}</div>
        </div>
        <div className={styles.infoItem}>
          <InputItem
            {...getFieldProps(`licensePlateNo`, {
              initialValue: detail && detail.licensePlateNo,
              rules: [
                {
                  required: true,
                  message: `请输入车牌号`,
                },
                {
                  required: true,
                  pattern: /^[京,津,渝,沪,冀,晋,辽,吉,黑,苏,浙,皖,闽,赣,鲁,豫,鄂,湘,粤,琼,川,贵,云,陕,甘,青,蒙,桂,宁,新,藏][ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqretuvwxyz][0-9ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqretuvwxyz]{5,6}$/,
                  message: `请输入正确的车牌号`,
                },
              ],
            })}
            type="text"
            placeholder="请输入车牌号"
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
          >
            车牌号
          </InputItem>
          <div className={styles.error}>
            {getFieldError(`licensePlateNo`) && getFieldError(`licensePlateNo`)[0]}
          </div>
        </div>
        <div className={styles.infoItem}>
          <InputItem
            {...getFieldProps(`engineNo`, {
              initialValue: detail && detail.engineNo,
              rules: [
                {
                  required: true,
                  message: `请输入发动机号`,
                },
                {
                  required: true,
                  pattern: /^[0-9A-Za-z]{1,}$/,
                  message: `请输入正确的发动机号`,
                },
              ],
            })}
            type="text"
            placeholder="请输入发动机号"
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
          >
            发动机号
          </InputItem>
          <div className={styles.error}>
            {getFieldError(`engineNo`) && getFieldError(`engineNo`)[0]}
          </div>
        </div>
        <div className={styles.infoItem}>
          <InputItem
            {...getFieldProps(`useCharacter`, {
              initialValue: detail && detail.useCharacter,
            })}
            type="number"
            placeholder="请输入使用性质"
            disabled
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
          >
            使用性质
          </InputItem>
          <div className={styles.error}>
            {getFieldError(`useCharacter`) && getFieldError(`useCharacter`)[0]}
          </div>
        </div>
        <div className={styles.picker}>
          <DatePicker
            {...getFieldProps(`enrollDate`, {
              initialValue: detail && new Date(detail.enrollDate),
              rules: [
                {
                  required: true,
                  message: `请选择初登日期`,
                },
              ],
            })}
            mode="date"
            title=""
            className={styles.a}
            minDate={minDate}
            maxDate={maxDate}
          >
            <List.Item arrow="horizontal">初登日期</List.Item>
          </DatePicker>
          <div className={styles.error}>
            {getFieldError(`enrollDate`) && getFieldError(`enrollDate`)[0]}
          </div>
        </div>
        <div className={styles.infoItem}>
          <InputItem
            {...getFieldProps(`currentMileage`, {
              initialValue: detail && detail.currentMileage,
              rules: [
                {
                  required: true,
                  message: `请输入当前里程数`,
                },
              ],
            })}
            extra="km"
            type="text"
            placeholder="请输入当前里程数"
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
          >
            当前里程数
          </InputItem>
          <div className={styles.error}>
            {getFieldError(`currentMileage`) && getFieldError(`currentMileage`)[0]}
          </div>
        </div>
        <button
          onClick={() => {
            this.handSubmit();
          }}
        >
          确认无误，去投保
        </button>
      </div>
    );
  }
}

export default createForm()(Index);
