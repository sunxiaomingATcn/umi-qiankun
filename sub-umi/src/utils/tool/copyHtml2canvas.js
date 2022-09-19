import html2canvas from 'html2canvas';

function compressCanvas(base64, w, quality = 0.6) {
    return new Promise((reslove, reject) => {
        var newImage = new Image();
        // var quality = 0.6;    //压缩系数0-1之间
        newImage.src = base64;
        newImage.setAttribute("crossOrigin", 'Anonymous');	//url为外域时需要
        var imgWidth, imgHeight;
        newImage.onload = function () {
            imgWidth = this.width;
            imgHeight = this.height;
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
                quality = 0.6;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            var base64 = canvas.toDataURL("image/jpeg", quality);
            reslove(base64)
        }
        newImage.onerror = function () {
            reject()
        }
    })
}

export default (domId, quality) => {
    if (!domId) return Promise.reject()
    const shareContent = document.getElementById(domId)
    shareContent.scrollTop = shareContent.scrollTop = 0;
    // var copyDom = shareContent.cloneNode(true);
    // copyDom.id = 'copyHtml2canvasDom';
    // copyDom.style.width = shareContent.scrollWidth + "px";
    // copyDom.style.height = shareContent.scrollHeight + "px";
    // copyDom.style.position = "absolute"
    // copyDom.style.left = "-1000px"
    // copyDom.style.top = "0"
    // document.querySelector("body").appendChild(copyDom);
    return html2canvas(shareContent, {
        useCORS: true
    }).then(function (canvas) {
        // document.body.removeChild(copyDom)
        // console.log(canvas.toDataURL())
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        let imgUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        return compressCanvas(imgUrl, 1000, "Productfilling", quality)
    });
}