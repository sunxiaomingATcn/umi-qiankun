/**
 * pdf第一页
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
        const { num = 1 } = this.state;
        this.pdfDoc.getPage(num).then(async page => {
            const canvas = document.createElement('canvas');
            canvas.id = 'canvas' + num;
            if (!canvas) return;
            let ctx = canvas.getContext('2d')
            let viewport = page.getViewport(1.5)
            canvas.width = viewport.width;  // 画布大小,默认值是width:300px,height:150px
            canvas.height = viewport.height;
            canvas.style.maxWidth = '100%' // 画布的框架大小
            let renderContext = {
                canvasContext: ctx,
                viewport: viewport
            }
            await page.render(renderContext)
            PDFviewContainer && PDFviewContainer.append(canvas);
            this.setState({ loading: false })
        })
    }

    render() {
        return (
            <div className="PDFview" id="PDFview">
                {this.state.loading && <p style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}><ActivityIndicator text="Loading..." /></p>}
            </div>
        );
    }
}

export default index;