/**
 * title: 保险条款
 */
import React, { Component } from 'react';
import styles from './index.scss';
import Modal from '@/components/modal';

class Index extends Component {
    componentDidMount() {
    }

    componentWillUnmount() {
    }
    showProvisions = (item) => {
        Modal.popup({
            title: item.title || item.recordName,
            content: item.richText ? <div dangerouslySetInnerHTML={{ __html: item.richText }}></div> :
                <div style={{ padding: '10px 0' }} dangerouslySetInnerHTML={{ __html: item.content }}></div>
        })
    };

    render() {
        const { master, additional, others } = JSON.parse(this.props.location.query.data);
        // console.log(JSON.parse(this.props.location.query.data));
        return (
            <div className={styles.container_wrapper}>
                <div className={styles.provisions}>
                    <h2>保险条款</h2>
                    <ul>
                        {
                            master[0] ? master.map((item, index) => {
                                if (item.content && item.content.length > 0) {
                                    return <li key={index}>
                                        <span onClick={() => this.showProvisions(item)}> {item.title && item.title.split(" ").map(c => <p>{c}</p>)}</span>
                                    </li>
                                } else if (item.attachmentUrl && item.attachmentUrl.length > 0) {
                                    return <li key={index}>
                                        <a href={item.attachmentUrl} target='_black' alt=''> {item.title && item.title.split(" ").map(c => <p>{c}</p>)}</a>
                                    </li>
                                }
                            }) :
                                <div>暂无内容</div>
                        }
                    </ul>
                </div>
                {additional && additional.length > 0 && <div className={styles.provisions}>
                    <h3>附加条款</h3>
                    <ul>
                        {
                            additional[0] ? additional.map((item, index) => {
                                if (item.richText !== null && item.richText && item.richText.length > 0) {
                                    return <li key={index}>
                                        <span onClick={() => this.showProvisions(item)}> {item.recordName}</span>
                                    </li>
                                } else if (item.filePath && item.filePath.length > 0) {
                                    return <li key={index}>
                                        <a href={item.filePath} target='_black' alt=''> {item.recordName}</a>
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
                                        <a href={item.filePath} target='_black' alt=''> {item.recordName}</a>
                                    </li>
                                }
                            }) :
                                <div>暂无内容</div>
                        }
                    </ul>
                </div>}
            </div>
        );
    }
}

export default Index;
