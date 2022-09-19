import React, { Component } from 'react';
import { connect } from 'dva'
import styles from './index.scss'
import { InputItem, Icon } from 'antd-mobile'
import { createForm } from 'rc-form';
import Utils from '@/utils/utils';

const mobileRule = {
    required: true,
    pattern: /^1[3456789]\d{9}$/,
    message: "请输入正确的手机号码",
    transform: value => trim(value)
}

const nameRule = {
    required: true,
    min: 2,
    max: 50,
    message: "请输入正确的姓名",
    transform: value => trim(value)
}

const trimReg = /^\s+|\s+$/g;

function trim(str) {
    return str.replace(trimReg, '');
}

@connect(({ customized }) => ({
    customized,
}))
class Index extends Component {
    state = {
        complete: false
    }

    componentDidMount() {
        const { form: { setFieldsValue } } = this.props;
        const { customized: { mobile, name } } = this.props;

        const { amount, channel } = this.props;
        Utils.collectBaiduHm(`1v1_${amount}_${channel}_表单基本信息`, "open")

        if (mobile) {
            setFieldsValue({ mobile: mobile, name })
        } else {
            setFieldsValue({ name })
        }

        if (mobile && name) {
            this.setState({ complete: true })
        }
    }

    inputChange = () => {
        Promise.resolve().then(_ => {
            const { pattern: mobilePattern } = mobileRule;
            const { min, max } = nameRule;
            const values = this.props.form.getFieldsValue();
            const nameLen = values.name ? trim(values.name).length : 0;
            //console.log(values)
            if (mobilePattern.test(trim(values.mobile)) && min <= nameLen && max >= nameLen) {
                this.setState({ complete: true })
            } else {
                this.setState({ complete: false })
            }
        })
    }

    // 失去焦点去空格
    inputBlur = (keys, v) => {
        const { form: { setFieldsValue, validateFields } } = this.props;

        if (trimReg.test(v)) {
            Promise.resolve().then(_ => {
                setFieldsValue({ [keys]: trim(v) })
                validateFields([keys])// 赋值后再次校验
            })
        }
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    next = () => {
        this.props.form.validateFields((error, value) => {
            if (error) return;
            const { nextPage } = this.props;
            if (nextPage) {
                nextPage()
            }
            value.name = trim(value.name)
            const { dispatch } = this.props;
            dispatch({
                type: "customized/contact",
                payload: {
                    ...value
                }
            })
        })
    }

    render() {
        const { complete } = this.state;
        const { data } = this.props;
        const { getFieldProps, getFieldError } = this.props.form;
        return (
            <div className={styles.contentBox}>
                <div className={styles.header}>
                    <h3>您的联系方式？</h3>
                    <p>便于沟通，提供服务</p>
                </div>
                <div className={styles.contactsForm}>
                    <div className={styles.formItem}>
                        <span>您的手机号</span>
                        <InputItem
                            {...getFieldProps("mobile",
                                {
                                    initialValue: data.mobile || localStorage.getItem("customizedInitPhone"),
                                    onChange: this.inputChange,
                                    onBlur: (v) => {
                                        this.inputBlur("mobile", v)
                                    },
                                    validate: [
                                        {
                                            trigger: "onBlur",
                                            rules: [mobileRule],
                                        },
                                    ],
                                }
                            )}
                            className={getFieldError('mobile') ? styles.errorInput : ""}
                            type='text'
                            clear={true}
                            maxLength={11}
                            placeholder='请优先填写微信绑定的手机号'
                        />
                        <p className={styles.errorTips}>{getFieldError('mobile')}</p>
                    </div>
                    <div className={styles.formItem}>
                        <span>您的姓名</span>
                        <InputItem
                            {...getFieldProps("name",
                                {
                                    onChange: this.inputChange,
                                    onBlur: (v) => {
                                        this.inputBlur("name", v)
                                    },
                                    validate: [
                                        {
                                            trigger: "onBlur",
                                            rules: [nameRule],
                                        }
                                    ]
                                }
                            )}
                            className={getFieldError('name') ? styles.errorInput : ""}
                            type='text'
                            clear={true}
                            placeholder='请输入您的姓名'
                        />
                        <p className={styles.errorTips}>{getFieldError('name')}</p>
                    </div>
                </div>
                <div className={styles.footer}>
                    {complete ?
                        <button className={styles.nextPage} onClick={this.next}><span>我填好了</span><Icon type="right" />
                        </button> : null}
                </div>
            </div>
        )
    }
}

export default createForm()(Index);
