import QRCode from "qrcode";

export default (url) => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(url, function (err, base64) {
      // console.log(err, base64)
      resolve(base64)
    })
  })
}