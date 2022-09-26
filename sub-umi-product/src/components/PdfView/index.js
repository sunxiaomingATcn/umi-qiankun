/**
 * 封装 pdf 预览插件
*/
import React, { Component } from 'react';
import { PDFJS } from 'pdfjs-dist/build/pdf.combined';
import { ActivityIndicator } from 'antd-mobile';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }

    componentDidMount() {
        this.getDocumentPage()
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer)
    }

    getDocumentPage = () => {
        const { data: { path } } = this.props;
        if (!path) return null;
        return PDFJS.getDocument(path)
            .then((pdf) => {
                this.pdfDoc = pdf
                this.setState({
                    pdf,
                    numPages: pdf.numPages
                })
            }).then(() => {
                const { numPages } = this.state;
                if (numPages < 1) return;
                this.renderPage()
            })
    }

    renderPage = () => {
        if (!this.pdfDoc) return;
        const PDFviewContainer = document.getElementById("PDFview");
        const { num = 1, numPages } = this.state;
        this.pdfDoc.getPage(num).then(async page => {
            const canvas = document.createElement('canvas');
            canvas.id = 'canvas' + num;
            // let canvas = document.getElementById('canvas' + num)
            if (!canvas) return;
            let ctx = canvas.getContext('2d')
            // let dpr = window.devicePixelRatio || 1 // 设备像素比
            // let bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1 // 浏览器在渲染canvas之前会用几个像素来来存储画布信息,类似img
            // let ratio = dpr / bsr
            let viewport = page.getViewport(1.5)
            // console.log(num,viewport)
            canvas.width = viewport.width;  // 画布大小,默认值是width:300px,height:150px
            canvas.height = viewport.height;
            canvas.style.maxWidth = '100%' // 画布的框架大小
            // canvas.style.width = viewport.width + 'px' // 画布的框架大小
            // canvas.style.height = viewport.height + 'px'
            let renderContext = {
                canvasContext: ctx,
                viewport: viewport
            }
            await page.render(renderContext)
            const image = convertCanvasToImage(canvas);
            PDFviewContainer && PDFviewContainer.append(image);

            if (numPages > num) {
                this.setState({ num: num + 1 }, () => {
                    const { num: _num } = this.state;
                    this.timer = setTimeout(() => this.renderPage(_num), 500)
                    if (_num >= numPages) this.setState({ loading: false })
                })
            } else {
                this.setState({ loading: false })
            }
        })
    }

    render() {
        return (
            <div>
                <div className="PDFview" id="PDFview" style={{ minHeight: '8rem' }}>
                </div>
                {this.state.loading && <p style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}><ActivityIndicator text="Loading..." /></p>}
            </div>
        );
    }
}

export default index;

// Converts canvas to an image
function convertCanvasToImage(canvas) {
    var image = new Image();
    image.src = canvas.toDataURL("image/png", 0.35);
    image.style.width = '100%';
    return image;
}