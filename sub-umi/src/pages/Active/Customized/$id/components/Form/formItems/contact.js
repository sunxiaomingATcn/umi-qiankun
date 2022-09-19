import React, { Component } from 'react';
import { connect } from 'dva'
import styles from './index.scss'
import { InputItem, Icon } from 'antd-mobile'
import { createForm } from 'rc-form';
import Utils from '@/utils/utils';
import { history } from 'umi';

const nameRule = {
    required: true,
    min: 1,
    max: 50,
    message: "请输入姓名",
    transform: value => trim(value)
}

const trimReg = /^\s+|\s+$/g;

function trim(str) {
    return str.replace(trimReg, '');
}

@connect(({ customizedV3 }) => ({
    customizedV3,
}))
class Index extends Component {
    state = {
        complete: false,
        errorflag:false,
        tipflag:true
    }

    componentDidMount() {
        console.log(this.props)
        const { form: { setFieldsValue } } = this.props;
        const { customizedV3: { mobile, name } } = this.props;

        const { amount, channel } = this.props;
        Utils.collectBaiduHm(`1v1_v3.0_${amount}_${channel}_表单1-怎么称呼您`, "open")

        if (name) {
            setFieldsValue({  name })
        }

        if ( name) {
            this.setState({ complete: true })
        }
    }

    inputChange = () => {
        Promise.resolve().then(_ => {
            const { min, max } = nameRule;
            const values = this.props.form.getFieldsValue();
            const nameLen = values.name ? trim(values.name).length : 0;
            //console.log(values)
            if ( min <= nameLen && max >= nameLen) {
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
        this.setState({
            errorflag:true,
            tipflag:true
        })
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
                type: "customizedV3/contact",
                payload: {
                    ...value
                }
            })
        })
    }

    inputfous(){
        this.setState({
            errorflag:false,
            tipflag:false
        })
    }

    render() {
        const { complete } = this.state;
        const { data } = this.props;
        const { getFieldProps, getFieldError } = this.props.form;
        console.log(this.props,123)
        return (
            <div className={styles.contentBox}>
                <div className={styles.header}>
                    <h3>怎么称呼您？</h3>
                    <p>便于沟通，提供服务</p>
                </div>
                <div className={styles.contactsForm}>
                    <div className={styles.formItem}>
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
                            type='text'
                            placeholder={this.state.tipflag?'请输入您的姓名':""}
                            onFocus={()=>{this.inputfous()}}
                        />
                        {this.state.errorflag&&<p className={styles.errorTips}>{getFieldError('name')}</p>}
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
