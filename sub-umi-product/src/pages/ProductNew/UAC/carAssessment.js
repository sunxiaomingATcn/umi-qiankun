/**
 * title: 车辆评估
 */
import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { connect } from 'dva';
import TracBacks from '@/utils/trackBacks';
import styles from './assets/css/index.less';
import { history } from 'umi';
import request from '@/utils/request';
import { getCustomerToken } from '@/utils/tool/customer';
import routerTrack from '@/components/routerTrack';


function compress(base64String, w = 1000, quality = 0.6) {
  var getMimeType = function(urlData) {
    var arr = urlData.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    // return mime.replace("image/", "");
    return mime;
  };
  var newImage = new Image();
  var imgWidth, imgHeight;

  var promise = new Promise(resolve => (newImage.onload = resolve));
  newImage.src = base64String;
  return promise.then(() => {
    imgWidth = newImage.width;
    imgHeight = newImage.height;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    if (Math.max(imgWidth, imgHeight) > w) {
      if (imgWidth > imgHeight) {
        canvas.width = w;
        canvas.height = (w * imgHeight) / imgWidth;
      } else {
        canvas.height = w;
        canvas.width = (w * imgWidth) / imgHeight;
      }
    } else {
      canvas.width = imgWidth;
      canvas.height = imgHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(newImage, 0, 0, canvas.width, canvas.height);
    var base64 = canvas.toDataURL(getMimeType(base64String), quality);
    return base64;
  });
}
@routerTrack({ id: 'page11' })
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
  }

  h5ChooseImage = (e, key) => {
    const { onChange, dispatch } = this.props;
    const files = [e.target.files[0]];
    const reader = new FileReader();
    const _this = this;
    const formData = new FormData();
    formData.append('file', files[0]);
    dispatch({
      type: 'productNew/uploadFiles',
      payload: formData,
    }).then(res => {
      if (res && res.code == 200) {
        request(
          `/blade-resource/oss/endpoint/file-link?fileName=${res.data.osskey}${`&blade-auth=${getCustomerToken()}`}`,
        ).then(result => {
          if (result.data) {
            localStorage.setItem(`${key}Url`, result.data);
          }
        });
      }
    });
    reader.onload = function() {
      _this.setState({
        files,
        previewImages: [this.result],
      });
      compress(this.result).then(bas64 => {
        _this.setState({ [key]: bas64 });
        onChange && onChange(bas64);
      });
    };
    reader.readAsDataURL(files[0]);
  };

  handSubmit = () => {
    Toast.loading('Loading...', 0);
    const { drivingLicense, car, mileage } = this.state;
    const {
      dispatch,
      location: { query },
    } = this.props;
    if (!drivingLicense) {
      Toast.fail('请上传行驶证照片', 2);
      return;
    }
    if (!car) {
      Toast.fail('请上传车辆正面照', 2);
      return;
    }
    if (!mileage) {
      Toast.fail('请上传当前里程数', 2);
      return;
    }
    localStorage.setItem('drivingLicense', drivingLicense);
    localStorage.setItem('car', car);
    localStorage.setItem('mileage', mileage);
    Toast.hide();
    history.push({
      pathname: '/ProductNew/UAC/infoConfirm',
      query: query,
    });
  };

  render() {
    const { drivingLicense, car, mileage } = this.state;
    return (
      <div className={styles.carAssessment}>
        <div className={styles.item}>
          <p>行驶证照片</p>
          <label for="drivingLicense">
            <div className={`${styles.drivingLicense} ${styles.common}`}>
              <img src={require('./assets/images/camear.png')} />
              {drivingLicense && <img className={styles.resultImg} src={drivingLicense} />}
            </div>
          </label>
          <input
            className={styles.hidden}
            type="file"
            id={`drivingLicense`}
            onChange={e => {
              this.h5ChooseImage(e, 'drivingLicense');
            }}
            accept="image/*"
          />
          <div className={styles.desc}>上传行驶证照片，自动识别录入信息</div>
          <div className={styles.line} />
        </div>
        <div className={styles.item}>
          <p>车辆正面照</p>
          <label for="car">
            <div className={`${styles.car} ${styles.common}`}>
              <img src={require('./assets/images/camear.png')} />
              {car && <img className={styles.resultImg} src={car} />}
            </div>
          </label>
          <input
            className={styles.hidden}
            type="file"
            id={`car`}
            onChange={e => {
              this.h5ChooseImage(e, 'car');
            }}
            accept="image/*"
          />
          <div className={styles.desc}>请上传车辆正面照</div>
          <div className={styles.line} />
        </div>
        <div className={styles.item}>
          <p>当前里程数</p>
          <label for="mileage">
            <div className={`${styles.mileage} ${styles.common}`}>
              <img src={require('./assets/images/camear.png')} />
              {mileage && <img className={styles.resultImg} src={mileage} />}
            </div>
          </label>
          <input
            className={styles.hidden}
            type="file"
            id={`mileage`}
            onChange={e => {
              this.h5ChooseImage(e, 'mileage');
            }}
            accept="image/*"
            capture="camear"
          />
          <div className={styles.desc}>请上传里程表照片</div>
        </div>
        <button
          onClick={() => {
            this.handSubmit();
          }}
        >
          下一步
        </button>
      </div>
    );
  }
}

export default Index;
