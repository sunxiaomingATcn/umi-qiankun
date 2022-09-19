/**
 * 身份证图片上传预览 兼容微信环境wxjssdk
 * 返回base64
*/
import React, { Component } from 'react';
import wx from 'weixin';
import styles from './index.less';

const idObverse = require('./assets/id-obverse.png'); //正面默认背景
const idReverseSide = require('./assets/id-reverse-side.png'); // 反面默认背景

function compress(base64String, w = 1000, quality = 0.6) {
  var getMimeType = function (urlData) {
    var arr = urlData.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    // return mime.replace("image/", "");
    return mime;
  };
  var newImage = new Image();
  var imgWidth, imgHeight;

  var promise = new Promise(resolve => newImage.onload = resolve);
  newImage.src = base64String;
  return promise.then(() => {
    imgWidth = newImage.width;
    imgHeight = newImage.height;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    if (Math.max(imgWidth, imgHeight) > w) {
      if (imgWidth > imgHeight) {
        canvas.width = w;
        canvas.height = w * imgHeight / imgWidth;
      } else {
        canvas.height = w;
        canvas.width = w * imgWidth / imgHeight;
      }
    } else {
      canvas.width = imgWidth;
      canvas.height = imgHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(newImage, 0, 0, canvas.width, canvas.height);
    var base64 = canvas.toDataURL(getMimeType(base64String), quality);
    console.log(base64);
    return base64;
  });
}

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      previewImages: [],
      checkWxApiOk: true
    };
  }

  componentDidMount() {

  }

  wxChooseImage = () => {
    const { onChange } = this.props;
    wx && wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        const localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
        localIds.forEach(localId => {
          wx.getLocalImgData({
            localId, // 图片的localID
            success: (res) => {
              const localData = res.localData; // localData是图片的base64数据，可以用img标签显示
              let imageBase64 = '';
              if (localData.indexOf('data:image') == 0) {
                imageBase64 = localData;
              } else {
                imageBase64 = 'data:image/jpeg;base64,' + localData.replace(/\n/g, '');
              }
              this.setState({ previewImages: [imageBase64] })
              compress(imageBase64).then(bas64 => {
                onChange && onChange(bas64)
              })
            }
          });
        });
      }
    })
  }

  h5ChooseImage = e => {
    const { onChange } = this.props;
    const files = [e.target.files[0]];
    const reader = new FileReader();
    const _this = this;
    reader.onload = function () {
      _this.setState({
        files,
        previewImages: [this.result]
      });
      compress(this.result).then(bas64 => {
        onChange && onChange(bas64)
      })
    }
    reader.readAsDataURL(files[0])
  }

  render() {
    const { previewImages } = this.state;
    const { type = 'idObverse', checkWxApiOk } = this.props;

    return (
      <div
        className={
          [styles.imageUploadContainer,
          previewImages == 0 ? styles.unUpload : styles.uploaded].join(" ")
        }
        style={{
          backgroundImage: previewImages == 0 ? `url(${type === 'idObverse' ? idObverse : idReverseSide})` : `url(${previewImages[0]})`
        }}
      >
        {
          checkWxApiOk ?
            <div className={styles.wexinUploadBtn} onClick={this.wxChooseImage}></div> :
            <input type="file" id={`${type}_file`} onChange={this.h5ChooseImage} accept="image/*" />
        }
      </div>
    );
  }
}

export default index;