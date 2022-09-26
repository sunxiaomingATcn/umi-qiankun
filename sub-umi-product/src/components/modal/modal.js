import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './modal.scss';


export default class Modal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: props.isOpen || false,
            visible: true,
        };
    }


    close = () => {
        this.setState({
            isOpen: false
        });
    };

    onOkClick = () => {
        this.props.onOk();
        this.close();
    };

    // 点击取消的回调函数
    onCancelClick = () => {
        this.props.onCancel();
        this.close();
    };


    render() {
        const {title, children, okText, cancelText, type, url, padding} = this.props;
        return (
            <React.Fragment>
                {this.state.isOpen && (<div className={`${styles.modal_container}`}>
                    <div className='pop-mask' onClick={this.close}></div>
                    {type !== 'popup' ? <div className={styles.modal_body}>
                            {title && <div className={styles.modal_title}>{title}</div>}
                            <div className={styles.modal_content}>{children}</div>
                            <div className={styles.modal_footer}>
                                {okText && <button className={styles.ok_btn} onClick={this.onOkClick}>{okText}</button>}
                                {
                                    cancelText ? <button className={styles.cancel_btn}
                                                         onClick={this.onCancelClick}>{cancelText}</button> :
                                        <button className={styles.cancel_btn}
                                                onClick={this.close}>{cancelText ? cancelText : okText ? '取消' : '知道啦'}</button>
                                }
                            </div>
                        </div> :
                        <div className={styles.modal_popup_body}>
                            {title && <div className={styles.modal_popup_title}>
                                {title}<span onClick={this.close}></span>
                            </div>}
                            {url ? <div className={styles.modal_content} ref={ref => this.doc = ref}>
                                    <iframe
                                        title='ss'
                                        style={{width: '100%', height: this.state.iFrameHeight, overflow: 'visible'}}
                                        ref="iframe"
                                        src={url}
                                        width="100%"
                                        height="100%"
                                        scrolling="yes"
                                        frameBorder="0"
                                    />
                                </div> :
                                <div className={[styles.modal_content,padding?styles.padding_none:undefined].join(' ')} >{children}</div>}
                        </div>
                    }
                </div>)}
            </React.Fragment>
        );
    }
}

Modal.propTypes = {
    isOpen: PropTypes.bool,
    title: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    className: PropTypes.string,
    maskClosable: PropTypes.bool,
    onCancel: PropTypes.func,
    onOk: PropTypes.func,
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    type: PropTypes.oneOf(['alert', 'confirm', 'error', 'popup'])
};

Modal.defaultProps = {
    isOpen: true,
    className: '',
    maskClosable: true,
    onCancel: () => {
    },
    onOk: () => {
    },
    okText: '',
    cancelText: '',
    type: 'alert'
};
