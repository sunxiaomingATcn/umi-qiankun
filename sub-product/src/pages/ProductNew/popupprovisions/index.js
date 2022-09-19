/**
 * title: 保险条款
 */
import React, { Component } from 'react';
import styles from './index.scss';
import Modal from '@/components/modal';
import { Button } from 'antd-mobile';

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: null, page: 1, pages: 0
        }
    }

    showProvisions = (item) => {
        Modal.popup({
            title: item.title,
            content: item.richText ? <div dangerouslySetInnerHTML={{ __html: item.richText }}></div> :
                <div dangerouslySetInnerHTML={{ __html: item.content }}></div>
        })
    };

    cancel() {
        const { onCancel } = this.props;
        onCancel()
    }

    render() {
        const { master, additional, others } = this.props.item;
        const { productRelevantDocumentPreview } = this.props;
        return (
            <div className={styles.container_wrapper}>

                <div className={styles.provisions}>
                    <h2>保险条款</h2>
                    <ul>
                        {
                            master[0] ? master.map((item, index) => {
                                if (item.content && item.content.length > 0) {
                                    return <li key={index}>
                                        <span onClick={() => {
                                            this.showProvisions(item)
                                            // productRelevantDocumentPreview(item)
                                        }}> {item.title}</span>
                                    </li>
                                } else if (item.attachmentUrl && item.attachmentUrl.length > 0) {
                                    return <li key={index}>
                                        <span onClick={() => {
                                            productRelevantDocumentPreview({ ...item, file_name: item.title, url: item.attachmentUrl })
                                        }}> {item.title}</span>
                                    </li>
                                }
                            }) :
                                <div>暂无内容</div>
                        }
                    </ul>
                </div>
                {additional && additional.length > 0 && <div className={styles.provisions}>
                    <h2>附加条款</h2>
                    <ul>
                        {
                            additional[0] ? additional.map((item, index) => {
                                if (item.richText !== null && item.richText && item.richText.length > 0) {
                                    return <li key={index}>
                                        <span onClick={() => {
                                            this.showProvisions(item)
                                        }}> {item.recordName}</span>
                                    </li>
                                } else if (item.filePath && item.filePath.length > 0) {
                                    return <li key={index}>
                                        <span onClick={() => {
                                            productRelevantDocumentPreview({ ...item, file_name: item.recordName, url: item.filePath })
                                        }} > {item.recordName}</span>
                                    </li>
                                }
                            }) :
                                <div>暂无内容</div>
                        }
                    </ul>
                </div>}
                {others && others.length > 0 && <div className={styles.provisions}>
                    <h3>其他条款</h3>
                    <ul>
                        {
                            others[0] ? others.map((item, index) => {
                                if (item.richText !== null && item.richText && item.richText.length > 0) {
                                    return <li key={index}>
                                        <span onClick={() => this.showProvisions(item)}> {item.recordName}</span>
                                    </li>
                                } else if (item.filePath && item.filePath.length > 0) {
                                    return <li key={index}>
                                        <span onClick={() => { productRelevantDocumentPreview({ ...item, file_name: item.recordName, url: item.filePath }) }}> {item.recordName}</span>
                                    </li>
                                }
                            }) :
                                <div>暂无内容</div>
                        }
                    </ul>
                </div>}
                <Button className={styles.closeBtn} type="primary" onClick={() => { this.cancel() }}>关闭</Button>
            </div>
        );
    }
}

export default Index;
