import React, { Component } from 'react';
import styles from './input.scss';
import { DatePicker, Picker, Toast, Modal as Amodal } from 'antd-mobile';
import Item from './item';
import { connect } from 'dva';
import CanvasDraw from "react-canvas-draw";
import utils from "@/utils/utils";
import ArtVerifyCode from '@/components/VerifyCode/Code';
import Captcha from '@/components/Captcha/index';
import DropdownC from '@/components/Dropdown';

// import Job from './job';
/**
 * storyID=1545 使用新职业分类组件jobFx 注释原职业组件job
 * 切换回job：
 * 1.import Job from './job';
 *   //import Job from './jobFx';
 * 2.handleProfession = () => {
        return dispatch({
            type: 'common/getProfession',
            // type: 'common/getFxProfession',
 * */
import Job from './jobFx';
import Modal from "@/components/modal";
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';

const oriMailArr = ['@qq.com', '@126.com', '@163.com', '@139.com', '@sina.com', '@hotmail.com', '@189.com', '@gmail.com', '@foxmail.com'];

@connect(({ common, insuredNew }) => ({
    common,
    insuredNew
}))


class Input extends Component {
    signCanvas = React.createRef();
    state = {
        value: null,
        verificationCode: null,
        singleValue: this.props.item.defaultValue ? [this.props.item.defaultValue] : undefined,
        disabled: false,
        codeText: '获取验证码',
        phone: '',
        item: null,
        checked: false,
        dateDisabled: false,
        jobName: null,
        jobId: null,
        signatureShow: false,
        lines: null
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        const { item, jobName } = nextProps;
        const params = {};
        if (jobName != null && jobName) {
            params.jobName = String(jobName)
        }
        if (JSON.stringify(item) !== JSON.stringify(prevState.item)) {
            params.item = item;
        }
        return params;
    }

    identitytest(e) {
        var strBirthday = ''
        strBirthday = e.target.value.substr(6, 4) + "/" + e.target.value.substr(10, 2) + "/" + e.target.value.substr(12, 2);
        var birthDate = new Date(strBirthday);
        var nowDateTime = new Date();
        var age = nowDateTime.getFullYear() - birthDate.getFullYear();
        //再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
        if (nowDateTime.getMonth() < birthDate.getMonth() || (nowDateTime.getMonth() == birthDate.getMonth() && nowDateTime.getDate() < birthDate.getDate())) {
            age--;
        }
        return age
    }

    inputChange = (e, id = null, name = null) => {
        let payload = {}
        const { insuredNew: { applicantInfoPassport, insurantInfoPassport } } = this.props;
        if (id && id == "applicantInfo" && name == "identity") {
            let regex = new RegExp(this.getIdentityReg(id));
            if (!applicantInfoPassport) {
                if (regex.test(e.target.value)) {
                    let age = this.identitytest(e)
                    if (age >= 18) {
                        payload = {
                            signature1: true,
                            index: 1
                        }
                    } else {
                        payload = {
                            signature1: false,
                            index: 1
                        }
                    }
                } else {
                    payload = {
                        signature1: false,
                        index: 1
                    }
                }
            } else {
                payload = {
                    signature1: true,
                    index: 1
                }
            }
            this.props.dispatch({
                type: "insuredNew/editSignature",
                payload
            })

        } else if (id && id == "insurantInfo" && name == "identity") {
            let regex = new RegExp(this.getIdentityReg(id));
            if (!insurantInfoPassport) {
                if (regex.test(e.target.value)) {
                    let age = this.identitytest(e)
                    if (age >= 18) {
                        payload = {
                            signature2: true,
                            index: 2
                        }
                    } else {
                        payload = {
                            signature2: false,
                            index: 2
                        }
                    }
                } else {
                    payload = {
                        signature2: false,
                        index: 2
                    }
                }
            } else {
                payload = {
                    signature2: true,
                    index: 2
                }
            }

            this.props.dispatch({
                type: "insuredNew/editSignature",
                payload
            })
        }

        const newItem = cloneDeep(this.state.item);
        newItem.defaultValue = e.target.value;
        this.setState({
            value: e.target.value,
            item: newItem
        })
    };

    /**
     * end
     * emial begin
    */
    onEmailChange = (e) => {
        const value = e.target.value || '';
        const [email, suffix] = value.split('@');
        const emailMenuArr = value ?
            !suffix ? oriMailArr.map((item) => email + item) : oriMailArr.filter((item) => item.includes(suffix)).map((item) => email + item) : []
        // 没有emailMenuArr 不展示邮箱列表
        this.setState({
            emailDropVisible: !(emailMenuArr == false),
            emailMenuArr
        })
    }

    onEmailOnblur = (e) => {
        setTimeout(() => {
            this.setState({
                emailDropVisible: false,
                emailMenuArr: [],
            });
        }, 50)
    }

    onMailSelected = (value) => {
        this.props.form.setFieldsValue({
            [`${this.props.id}.${this.state.item.apiName}`]: value
        })
    }
    /**
     * emial end
    */
    inputCodeChange = (e) => {
        this.setState({
            verificationCode: e.target.value
        })
    };

    checkCode = (rule, value, callback) => {
        if (!/^\d{6}$/.test(this.state.verificationCode)) {
            callback('请输入正确6位验证码');
        } else {
            callback();
        }
        callback();
    };

    checkData = (name, regex) => {
        let key = String(name).split(".")
        if (!(this.state.value || this.props.form.getFieldsValue([name]))) {
            Toast.fail('请输入手机号码', 2);
            return false
        }
        if (!new RegExp(regex).test(this.state.value || this.props.form.getFieldsValue([name])[key[0]][key[1]])) {
            Toast.fail('请输入正确的手机号', 2);
            return false
        }
        return true;
    };

    setTime = () => {
        let countdown = 60;
        this.setState({ codeText: countdown + 's获取' });
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (countdown === 0) {
                this.setState({
                    codeText: '重新获取',
                    isWait: false,
                    disabled: false
                });
                clearInterval(this.timer);
            } else {
                countdown--;
                this.setState({
                    codeText: countdown + 's获取',
                    disabled: true
                });
            }
        }, 1000);
    };

    getCodeClick = (e, name, regex) => {
        e.preventDefault();
        const { value } = this.state;
        const { dispatch, inputOnblur } = this.props;
        inputOnblur(null, { name: "获取验证码" }, "click", this)
        let key = String(name).split(".");
        if (this.state.isWait) {
            return false
        }
        if (!this.checkData(name, regex)) return false;
        this.setState({ isWait: true, disabled: true });
        dispatch({
            type: 'insuredNew/sendValidation',
            payload: {
                mobile: value || this.props.form.getFieldsValue([name])[key[0]][key[1]]
            }
        }).then((data) => {
            if (data.code === 200) {
                let channel = localStorage.getItem('channel')
                utils.collectBaiduHm(`投保信息填写页_按钮_获取手机验证码_${localStorage.getItem('product_id')}_${channel ? channel : ""}`, "click1")
                Toast.success('验证码发送成功', 2);
                // 接口成功发送验证码并倒计时
                this.setTime()
            } else {
                this.setState({ isWait: false, disabled: false });
            }
        })
    };

    getIdentityReg = (id) => {
        const { form: { getFieldValue } } = this.props,
            identityType = getFieldValue(`${id}.identityType`);
        return this.props.regexItem[0].attributelabels.filter(item => {
            return item.value == identityType[0];
        })[0].regex;
    };

    changeBlur = (rule, value, callback) => {
        let u = navigator.userAgent;
        let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        if (isIOS) {
            setTimeout(() => {
                const scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
                window.scrollTo(0, Math.max(scrollHeight - 1, 0))
            }, 200)
        }
        callback();
    };

    longTermBox = () => {
        return (
            <div
                style={{ display: 'flex', alignItems: 'center', lineHeight: '0.5rem' }}
                className={styles.longTermCheckboxContainer}
                onClick={(e) => this.handleLongTerm(e)}
            >
                <input className={styles.longTermCheckbox} name='longTerm' type='checkbox' readOnly checked={this.state.dateDisabled} /><span className={styles.longTermCheckboxStyle}></span>
                <span>长期</span>
            </div>
        )
    };

    handleLongTerm = (e) => {
        e.stopPropagation();
        const { id, inputOnblur, item, form: { setFieldsValue, getFieldsValue } } = this.props;
        const { apiName } = this.state.item;
        const { dateDisabled } = this.state;
        inputOnblur({ target: { value: "长期" } }, item, "change", this)
        this.setState({
            value: null,
            dateDisabled: !dateDisabled
        }, () => {
            setFieldsValue({
                [`${id}.${apiName}`]: this.state.value ? this.state.value : undefined
            });
            this.props.dispatch({
                type: "insuredNew/SaveidentityPeriod",
                payload: {
                    [`${id}`]: this.state.dateDisabled ? "长期" : null
                }
            })
        })

    };


    dateChange = (date, name) => {
        const { id, form: { setFieldsValue } } = this.props;
        const { apiName } = this.state.item;
        setFieldsValue({
            [`${id}.${apiName}`]: date
        });
        this.setState({ value: date }, () => {
            this.props.inputOnblur(null, null, null, null, null, name)
        });
        // initialValue: this.state.value ? new Date(moment(this.state.value).format()) : undefined,
    };

    getArea = () => {
        return JSON.parse(localStorage.getItem('Area'));
    };

    /**
     * storyID=1545
     * 复兴职业分类表更新
    */
    getJobs = async () => {
        const profession = localStorage.getItem('Profession');
        const title = '查询职业类别';
        // const Jobs = profession ? JSON.parse(profession) : await this.handleProfession();
        // const Jobs = await this.handleProfession();
        // END
        const content = this.formatJob();
        this.Modal = Modal.popup({
            title,
            content,
            padding: true
        });
    };

    /**
     * storyID=1545
     * 复兴职业分类表更新
    */
    handleProfession = () => {
        Toast.loading('Loading...', 0);
        const { dispatch } = this.props;
        return dispatch({
            // type: 'common/getProfession',
            type: 'common/getFxProfession',
        }).then(res => {
            Toast.hide()
            if (res && res.code === 0) {
                localStorage.setItem('Profession', JSON.stringify(res.payload));
                return res.payload
            } else {
                return false;
            }
        });
    };

    // handleArea = () => {
    //     const {dispatch} = this.props;
    //     return dispatch({
    //         type: 'common/getArea',
    //     }).then(res => {
    //         if (res && res.code === 0) {
    //             localStorage.setItem('Area', JSON.stringify(res.payload));
    //             return res.payload
    //         } else {
    //             return false;
    //         }
    //     });
    // };


    jobClick = (key, name) => {
        const { id, form: { setFieldsValue } } = this.props;
        const { apiName } = this.state.item;
        let payload = {}
        // this.props.inputOnblur({ target: { value: name } }, this.props.item, "change", this)
        this.setState({
            jobName: name,
            jobId: key
        });
        if (id == 'applicantInfo') {
            payload.applicantInfoProfessionStr = name
        } else if (id == 'insurantInfo') {
            payload.insurantInfoProfessionStr = name
        }
        this.props.dispatch({
            type: "insuredNew/editDate",
            payload: {
                ...payload
            }
        })
        setFieldsValue({
            [`${id}.${apiName}`]: key
        });
        this.props.inputOnblur({ target: { label: name } }, null, null, null, null, `${id}.${apiName}`)
        this.Modal();
    };

    isRenewalPayClick(e, name, item, id, apiName) {
        this.identityTypeClick(e, item, id)
        this.props.inputOnblur(e, null, null, null, null, apiName)
        if (item.name == "职业") {
            let payload = {}
            let label = item.attributelabels.filter((item) => { return item.value == e[0] })[0].label
            if (id == 'applicantInfo') {
                payload.applicantInfoProfessionStr = label
            } else if (id == 'insurantInfo') {
                payload.insurantInfoProfessionStr = label
            }
            this.props.dispatch({
                type: "insuredNew/editDate",
                payload: {
                    ...payload
                }
            })
        }
        if (name == "isRenewalPay") {
            let payload = {}
            if (e[0] == 1) {
                payload.isRenewalPay = true
            }
            else {
                payload.isRenewalPay = false
            }
            this.props.dispatch({
                type: "insuredNew/SaveisRenewalPay",
                payload
            })
        }
    }
    identityTypeClick(e, item, id) {
        let payload = {}
        let regex = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/
        let value = this.props.form.getFieldValue(`${id}.identity`)
        let lable = item.attributelabels.filter(val => val.value == e[0])
        if (item.name == "证件类型" && lable == '户口本') {
            if (id == "applicantInfo") {
                payload = {
                    Dateflag1: false,
                    applicantInfoPassport: false,
                    signature1: false,
                    index: 1
                }
                localStorage.setItem(`${localStorage.getItem(`product_id`)}_applicantInfoPassport`, payload.applicantInfoPassport)
                if (value && regex.test(value)) {
                    let e = { target: { value: value } }
                    let age = this.identitytest(e)
                    payload.signature1 = age >= 18 ? true : false
                }

            } else if (id == "insurantInfo") {
                payload = {
                    Dateflag2: false,
                    insurantInfoPassport: false,
                    signature2: false,
                    index: 2
                }
                localStorage.setItem(`${localStorage.getItem(`product_id`)}_insurantInfoPassport`, payload.insurantInfoPassport)
                if (value && regex.test(value)) {
                    let e = { target: { value: value } }
                    let age = this.identitytest(e)
                    payload.signature2 = age >= 18 ? true : false
                }
            }
        } else if (item.name == "证件类型" && lable == '身份证') {
            if (id == "applicantInfo") {
                payload = {
                    Dateflag1: true,
                    applicantInfoPassport: false,
                    signature1: false,
                    index: 1
                }
                localStorage.setItem(`${localStorage.getItem(`product_id`)}_applicantInfoPassport`, payload.applicantInfoPassport)
                if (value && regex.test(value)) {
                    let e = { target: { value: value } }
                    let age = this.identitytest(e)
                    payload.signature1 = age >= 18 ? true : false
                }
            } else if (id == "insurantInfo") {
                payload = {
                    Dateflag2: true,
                    insurantInfoPassport: false,
                    signature2: false,
                    index: 2
                }
                localStorage.setItem(`${localStorage.getItem(`product_id`)}_insurantInfoPassport`, payload.insurantInfoPassport)
                if (value && regex.test(value)) {
                    let e = { target: { value: value } }
                    let age = this.identitytest(e)
                    payload.signature2 = age >= 18 ? true : false
                }
            }
        }
        else if (item.name == "证件类型" && lable == '外国护照') {
            if (id == "applicantInfo") {
                payload = {
                    applicantInfoPassport: true,
                    Dateflag1: true,
                    signature1: true,
                    index: 1
                }
                localStorage.setItem(`${localStorage.getItem(`product_id`)}_applicantInfoPassport`, payload.applicantInfoPassport)
            } else if (id == "insurantInfo") {
                payload = {
                    insurantInfoPassport: true,
                    Dateflag2: true,
                    signature2: true,
                    index: 2
                }
                localStorage.setItem(`${localStorage.getItem(`product_id`)}_insurantInfoPassport`, payload.insurantInfoPassport)
            }
        }
        this.props.dispatch({
            type: "insuredNew/editSignature",
            payload
        })
        this.props.dispatch({
            type: "insuredNew/editdate",
            payload
        })
    }


    formatJob(jobs) {
        const { dispatch, insuredNew: { insured: { payload: { vendorCode } } } } = this.props;
        const { firstIndex, secondIndex } = this.state;
        return <Job jobs={jobs}
            firstIndex={firstIndex}
            secondIndex={secondIndex}
            jobClick={this.jobClick}
            dispatch={dispatch}
            vendorCode={vendorCode}
        />;
    }

    rewriteClick() {
        if (this.state.lines == null) {
            Toast.info("您还没有签名哦")
        } else {
            this.signCanvas.current.clear();
            this.props.form.setFieldsValue({
                [`${this.props.id}.${this.state.item.apiName}`]: ""
            })
        }
    }

    submitClick() {
        if (this.state.lines == null) {
            Toast.info("签名不可为空")
        } else {
            let x = []
            let y = []
            this.state.lines.lines.forEach((item, index) => {
                item.points.forEach((itm, indx) => {
                    x.push(Math.round(itm.x))
                    y.push(Math.round(itm.y))
                })
            })
            x = Array.from(new Set(x))
            y = Array.from(new Set(y))
            if (x.length > this.refs["signature"].clientWidth * 0.2 && y.length > this.refs["signature"].clientHeight * 0.2) {
                const signImg = this.signCanvas.current.canvas.drawing.toDataURL('image/png');
                this.props.form.setFieldsValue({
                    [`${this.props.id}.${this.state.item.apiName}`]: signImg
                })
                this.setState({
                    signatureShow: false,
                    lines: null
                }, () => {
                    window.removeEventListener('touchmove', this.stopScroll, { passive: false });
                })
            } else {
                Toast.info("签名过于简单")
            }

        }
    }

    signatureChange(e) {
        this.setState({
            lines: e
        })
    }

    areaClick(e, reg, name) {
        let AreaStr = ''
        let Area = JSON.parse(localStorage.getItem('Area'));
        const { id } = this.props;
        let payload = {}
        Area.forEach((item, index) => {
            if (item.value == e[0]) {
                AreaStr += item.label
                item.children.forEach((itm, ind) => {
                    if (itm.value == e[1]) {
                        AreaStr += itm.label
                        itm.children.forEach((i, d) => {
                            if (i.value == e[2]) {
                                AreaStr += i.label
                            }
                        })
                    }
                })
            }
        })
        this.props.inputOnblur({ target: { value: AreaStr } }, this.props.item, "change", this, reg, name)
    }

    // 计算保障起止日期
    getsafeguardDate = () => {
        if (localStorage.ppb_visting_productName == '机动车延长保修保险UAC' || localStorage.ppb_visting_productName == '人保驾乘意外险产品EAU') {
            return {
                startDate: moment().add(1, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                endDate: moment().add(1, 'years').endOf('day').format('YYYY-MM-DD HH:mm:ss')
            }
        } else {
            return {
                startDate: moment().add(3, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                endDate: moment().add(1, 'years').add(2, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss')
            }
        }
    }

    searchResult = (name) => {
        let ppb_quote_restrictGenes = JSON.parse(localStorage.ppb_quote_restrictGenes)
        let restrict_genes = JSON.parse(localStorage.restrict_genes)
        let id = restrict_genes.filter((item, index) => item.name == name)[0].id
        let result = ppb_quote_restrictGenes.filter((item, index) => item.restrictGene == id)
        return result && result.length ? result[0].value : ''
    }

    /**
     * 处理时间控件约定值
     * 参数date => string类型 =>直接 new Date
     *             数组类型[arg1,arg2] => arg1 moment方法,arg2 方法参数
    */
    formatCalculationDate = date => {
      return date ? new Date(Array.isArray(date) ? moment()[date?.[0]]?.(date[1])?.format() : date) : undefined
    }

    /**
     * 根据其他项的值获取是否必填
     * */
    getRequireFromPre = (item) => {
      const { requiredPre, required } = item;
      if (requiredPre?.apiName) {
        const { getFieldValue } = this.props.form;
        const preValue = getFieldValue(requiredPre?.apiName);
        const required = !!(requiredPre?.optionsToRequird?.[preValue]);
        item.required = required; // 直接赋值到item.required，用于显示必填required的红色*
        return required;
      }
      return required === false ? false : true;
    }

    inputInit() {
        const { getFieldProps, getFieldError, getFieldDecorator, getFieldsValue, getFieldValue } = this.props.form;
        const { item, disabled, codeText, dateDisabled } = this.state;
        let { name, defaultRemind, apiName, regex, errorRemind } = item;
        const { insuredNew: { applicantInfoPassport, insurantInfoPassport } } = this.props;
        const { id, inputOnblur } = this.props;
        let errors = getFieldError(`${id}.${apiName}`);
        let isCar300UAC = localStorage.ppb_visting_productName == '机动车延长保修保险UAC' || localStorage.ppb_visting_productName == '人保驾乘意外险产品EAU'
        let minDate = new Date(moment([1949, 9, 1]).format())
        let value = item.defaultValue
        let singleValue = item.defaultValue ? [item.defaultValue] : undefined
        let type = item.type
        if (isCar300UAC) {
            switch (apiName) {
                case 'seat':
                    singleValue = [Number(this.searchResult(item.name).slice(0, 1))]
                    break;
                default:
                    break;

            }
        }
        if (localStorage.ppb_visting_productName == '机动车延长保修保险UAC') {
            let carInfo = JSON.parse(localStorage.carInfo)
            switch (apiName) {
                case 'guaranteeScope':
                    value = this.searchResult('保障计划')
                    break;
                case 'extendedWarrantyKilometers':
                    value = '3万公里'
                    break;
                case 'carLicenseNo':
                    type = 6
                    value = carInfo.licensePlateNo
                    break;
                case 'vinCode':
                    type = 6
                    value = carInfo.vinNo
                    break;
                case 'c':
                    value = this.searchResult(item.name)
                    if (carInfo.individualPrice < 7 && value == '6万') {
                        value = '3万'
                        this.props.getQueryQuoteByPrice(value)
                    }
                    break;
                case 'engineNo':
                    type = 6
                    value = carInfo.engineNo
                    break;
                case 'standardFullName':
                    type = 6
                    value = carInfo.brandName + carInfo.modelName
                    break;
                case 'registDate':
                    type = 6
                    value = carInfo.enrollDate
                    this.props.getQueryQuoteByRegistDate(value)
                    break;
                case 'fairMarketPrice':
                    type = 6
                    value = carInfo.individualPrice
                    let countPrice = '3.5-7万'
                    if (value > 7 && value <= 10) {
                        countPrice = '7-10万'
                    } else if (value > 10 && value <= 15) {
                        countPrice = '10-15万'
                    }
                    this.props.getQueryQuoteByCarPrice(countPrice)
                    break;
                case 'carProperty':
                    type = 6
                    value = '非营运'
                    break;
                case 'currentMileage':
                    type = 6
                    value = carInfo.currentMileage
                    break;
                default:
                    break;
            }
        }
        let input;
        // 0：下拉 1：日历 2：日历+下拉框 3：文本输入框 4：地区 5：职业 6：只读展示  7：保险起期  8：保险止期
        // if (apiName == 'job') type = 5 //test
        switch (type) {
            case 0:
                if (apiName !== 'cardType' && apiName !== 'fiscalResidentIdentity') {
                    input = (<div className={styles.picker}>
                        <Picker
                            {...getFieldProps(`${id}.${apiName}`, {
                                initialValue: singleValue,
                                rules: [{
                                    required: item.required === false ? false : true,
                                    message: `请选择${name}`
                                }]
                            })}
                            data={[item.attributelabels]}
                            title={name}
                            cascade={false}
                            disabled={isCar300UAC && (apiName == 'a' || apiName == 'c')}
                            extra="请选择"
                            onOk={(e) => { this.isRenewalPayClick(e, apiName, item, id, `${id}.${apiName}`) }}
                        >
                            <Item arrow="horizontal" errors={errors}>{name}</Item>
                        </Picker>
                    </div>);
                } else if (apiName === 'fiscalResidentIdentity') {
                    input = (
                        (getFieldDecorator(`${id}.${apiName}`, {
                            initialValue: '1',
                        })(<div className={styles.picker}>
                            <Item arrow="horizontal"
                                extraDom={'仅为中国税收居民'}
                                domStyle={{ marginRight: 0 }}
                                errors={errors}>{name}</Item>
                        </div>))
                    )
                } else {
                    input = (
                        (getFieldDecorator(`${id}.${apiName}`, {
                            initialValue: '1',
                            rules: [
                                {
                                    required: true,
                                    pattern: new RegExp(regex),
                                    message: errorRemind
                                }
                            ]
                        })(<div className={styles.picker}>
                            <Item arrow="horizontal"
                                extraDom={'身份证'}
                                domStyle={{ marginRight: 0 }}
                                errors={errors}>{name}</Item>
                        </div>))
                    )
                }

                break;
            case 1:
                if (apiName !== 'valEndDate') {
                    input = <div className={styles.picker}>
                        <DatePicker
                            {...getFieldProps(`${id}.${apiName}`, {
                                initialValue: this.state.value ? new Date(moment(this.state.value).format()) : undefined,
                                rules: [{
                                    required: true,
                                    message: `请选择${name}`
                                }]
                            })}
                            mode="date"
                            maxDate={new Date()}
                            minDate={minDate}
                            title={name}
                            disabled={dateDisabled}
                            extra="请选择"
                            onChange={(date) => this.dateChange(date, `${id}.${apiName}`)}
                        >
                            <Item
                                errors={errors}
                            >{name}</Item>
                        </DatePicker>
                    </div>;
                } else {
                    input = <div className={styles.picker}>
                        <DatePicker
                            {...getFieldProps(`${id}.${apiName}`, {
                                rules: [{
                                    required: !dateDisabled,
                                    message: `请选择${name}`
                                }]
                            })}
                            mode="date"
                            minDate={new Date(moment().add(1, 'days').format())}
                            maxDate={new Date(moment().add(99, 'years').format())}
                            title={name}
                            disabled={dateDisabled}
                            extra="请选择"
                            onChange={(date) => this.dateChange(date, `${id}.${apiName}`)}
                            onOk={(e) => { this.identityTypeClick(e, item, id) }}
                        >
                            <Item arrow="horizontal"
                                errors={errors}
                                extraStyle={{ color: dateDisabled ? '#999' : '' }}
                                extraDom={this.longTermBox()}
                                domStyle={{ marginRight: 0, marginLeft: '0.2rem', }}>{name}</Item>
                        </DatePicker>
                    </div>;
                }
                break;
            case 2:
            /**
             * 日期控件，带默认值，最大值，最小值
            */
            input = <div className={styles.picker}>
              <DatePicker
                {...getFieldProps(`${id}.${apiName}`, {
                  initialValue: item.defaultDate ? this.formatCalculationDate(item.defaultDate) : undefined,
                  rules: [{
                    required: item.required === false ? false : true,
                    message: `请选择${name}`
                  }]
                })}
                minDate={this.formatCalculationDate(item.minDate)}
                maxDate={this.formatCalculationDate(item.maxDate)}
                title={name}
                disabled={dateDisabled}
                mode="date"
                extra="请选择"
                onChange={(date) => this.dateChange(date, `${id}.${apiName}`)}
              >
                <Item
                  errors={errors}
                >{name}</Item>
              </DatePicker>
            </div>;
            break;
            case 3:
                if (apiName === 'mobile' && id === 'applicantInfo') {
                    console.log("closeMobileValid", item)
                    const codeErrors = getFieldError(`verificationCode`);
                    input = [
                        <div className={`${styles.container}`}>
                            <div className='flex-r-bc'>
                                <span className={`${styles.label}`}>{name}</span>
                                <div className={[styles.mobile_input, 'flex-r-bc'].join(' ')}>
                                    {
                                        (getFieldDecorator(`${id}.${apiName}`, {
                                            initialValue: this.state.value,
                                            validateTrigger: 'onBlur',
                                            rules: [
                                                {
                                                    required: true,
                                                    pattern: new RegExp(regex),
                                                    message: errorRemind
                                                },
                                                this.changeBlur
                                            ]
                                        })(
                                            <input
                                                type='text'
                                                onChange={(e) => this.inputChange(e)}
                                                placeholder='请输入手机号'
                                                onBlur={(e) => { inputOnblur(e, item, "input", this, regex, `${id}.${apiName}`) }}
                                            />
                                        ))
                                    }
                                    {item.closeMobileValid ? <div>
                                        {getFieldDecorator(`closeMobileValid`, {
                                            initialValue: true,
                                            rules: [{ required: false }]
                                        })(<div></div>)}
                                    </div> : <>
                                        <div className={styles.line} />
                                        <div className={[styles.send, disabled ? styles.disabled : undefined].join(' ')}
                                            onClick={(e) => this.getCodeClick(e, `${id}.${apiName}`, regex)}>{codeText}</div>
                                    </>
                                    }
                                    {/* <ArtVerifyCode
                                        phone={this.state.value || this.props.form.getFieldsValue([`${id}.${apiName}`])[id][apiName]}
                                        captcha={this.state.captcha}
                                        color="#172B4D"
                                        border={false}
                                        onRef={(ref) => this.refVerifyCode = ref}
                                        dispatch={this.props.dispatch}
                                        getCodeClick={() => this.setState({ showCaptcha: true })}
                                        sendValidationSuccess={() => this.setState({ showCaptcha: false, captcha: undefined })}
                                        sendValidationFail={() => this.refCaptcha && this.refCaptcha.getCaptcha()}
                                    /> */}
                                    <Amodal
                                        visible={this.state.showCaptcha}
                                        transparent
                                        maskClosable={false}
                                        closable
                                        className="cus_modal"
                                        onClose={() => this.setState({ showCaptcha: false })}
                                        title="请输入验证码"
                                    >
                                        <div className="captchaContainer">
                                            <div className="captcha">
                                                <input
                                                    clear
                                                    type='text'
                                                    placeholder=''
                                                    onChange={({ target: { value: captcha } }) => this.setState({ captcha })}
                                                />
                                            </div>
                                            <div className="codetips">请输入下图中的字符，不区分大小写</div>
                                            <div className="captchaimg"><Captcha onRef={(ref) => this.refCaptcha = ref} /></div>
                                            <div className="getCode" onClick={() => this.refVerifyCode && this.refVerifyCode.sendCode()}>确 定</div>
                                        </div>
                                    </Amodal>
                                </div>
                            </div>
                            <div className={styles.errors}> {(errors) ? errors.join(',') : null}</div>
                        </div>,
                        !item.closeMobileValid &&
                        <div>
                            {
                                (getFieldDecorator(`verificationCode`, {
                                    initialValue: this.state.verificationCode,
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入验证码'
                                        },
                                        this.checkCode,
                                        this.changeBlur
                                    ],
                                    trigger: 'onBlur'
                                })(<div className={`${styles.container}`}>
                                    <div className='flex-r-bc'>
                                        <span className={`${styles.label}`}>验证码</span>
                                        <input type='text'
                                            onChange={(e) => this.inputCodeChange(e)}
                                            placeholder='请输入验证码'
                                            maxLength='6'
                                            onBlur={(e) => { inputOnblur(e, { name: "验证码" }, "input", this, regex, `${id}.${apiName}`) }}
                                        />
                                    </div>
                                    <div className={styles.errors}> {(codeErrors) ? codeErrors.join(',') : null}</div>
                                </div>))
                            }
                        </div>

                    ]
                } else if (apiName === 'email') {
                    input = <div className={`${styles.container}`}>
                        <div className='flex-r-bc'>
                            <span className={`${styles.label}`}>{name}</span>
                            <DropdownC menuArr={this.state.emailMenuArr} visible={this.state.emailDropVisible} onMenuSelect={this.onMailSelected}>
                                {
                                    (getFieldDecorator(`${id}.${apiName}`, {
                                        validateTrigger: 'onBlur',
                                        rules: [
                                            {
                                                required: item.required === false ? false : true,
                                                pattern: new RegExp(regex),
                                                message: errorRemind ? errorRemind : defaultRemind
                                            },
                                            this.changeBlur
                                        ]
                                    })(
                                        <input type='text'
                                            onChange={(e) => {
                                                this.inputChange(e);
                                                this.onEmailChange(e);
                                            }}
                                            placeholder={defaultRemind}
                                            // value={regex}
                                            onBlur={(e) => {
                                                setTimeout(() => {
                                                    const value = getFieldValue(`${id}.${apiName}`)
                                                    inputOnblur({ target: { value } }, item, "input", this, regex, `${id}.${apiName}`);
                                                }, 100)
                                                // inputOnblur(e, item, "input", this, regex, `${id}.${apiName}`);
                                                this.onEmailOnblur(e);
                                            }}
                                        />
                                    ))
                                }
                            </DropdownC>

                        </div>
                        <div className={styles.errors}> {(errors) ? errors.join(',') : null}</div>
                    </div>
                } else if (apiName === 'identity') {
                    regex = this.getIdentityReg(id);
                    if ((id == 'applicantInfo' && apiName == 'identity' && applicantInfoPassport) || (id == 'insurantInfo' && apiName == 'identity' && insurantInfoPassport)) {
                        regex = '^[a-zA-z0-9]{6,20}$'
                    }
                    if (isCar300UAC) regex = this.getIdentityReg(id)
                    input = <div className={`${styles.container}`}>
                        <div className='flex-r-bc'>
                            <span className={`${styles.label}`}>{name}</span>
                            {
                                (getFieldDecorator(`${id}.${apiName}`, {
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        {
                                            required: true,
                                            pattern: new RegExp(regex),
                                            message: errorRemind ? errorRemind : defaultRemind
                                        },
                                        this.changeBlur
                                    ]
                                })(
                                    <input type='text'
                                        onChange={(e) => this.inputChange(e, id, apiName)}
                                        placeholder={defaultRemind}
                                        onBlur={(e) => { inputOnblur(e, item, "input", this, regex, `${id}.${apiName}`) }}
                                    />
                                ))
                            }
                        </div>
                        <div className={styles.errors}> {(errors) ? errors.join(',') : null}</div>
                    </div>

                } else {
                    input = <div className={`${styles.container}`}>
                        <div className='flex-r-bc'>
                            <span className={`${styles.label}`}>{name}</span>
                            {
                                (getFieldDecorator(`${id}.${apiName}`, {
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        {
                                            required: this.getRequireFromPre(item),
                                            pattern: new RegExp(regex),
                                            message: errorRemind ? errorRemind : defaultRemind
                                        },
                                        this.changeBlur
                                    ]
                                })(
                                    <input type='text'
                                        onChange={(e) => this.inputChange(e, id, apiName)}
                                        placeholder={defaultRemind}
                                        // value={regex}
                                        disabled={(isCar300UAC && (apiName == 'b'))}
                                        onBlur={(e) => {
                                            let value = e.target.value
                                            if ((apiName == 'carLicenseNo' || apiName == 'vinCode' || apiName == 'engineNo') && value) {
                                                let reg = new RegExp(regex)
                                                if (reg.test(value))
                                                    setTimeout(() => {
                                                        this.props.form.setFieldsValue({
                                                            [`${id}.${apiName}`]: value.toUpperCase()
                                                        })
                                                    }, 100);

                                            }
                                            inputOnblur(e, item, "input", this, regex, `${id}.${apiName}`)
                                        }
                                        }
                                    />
                                ))
                            }
                        </div>
                        <div className={styles.errors}> {(errors) ? errors.join(',') : null}</div>
                    </div>
                }
                break;
            case 4:
                input = (<div className={styles.picker}>
                    <Picker
                        {...getFieldProps(`${id}.${apiName}`, {
                            rules: [{
                                required: item.required === false ? false : true,
                                message: `请选择${name}`
                            }]
                        })}
                        extra="请选择"
                        data={this.getArea()}
                        title={name}
                        onOk={e => { this.areaClick(e, null, `${id}.${apiName}`) }}
                        onDismiss={e => console.log('dismiss', e)}
                    >
                        <Item arrow="horizontal" errors={errors}>{name}</Item>
                    </Picker>
                </div>);
                break;
            case 5:
                input =
                    <div className={styles.picker}>
                        <Picker
                            {...getFieldProps(`${id}.${apiName}`, {
                                initialValue: this.state.jobId,
                                rules: [{
                                    required: item.required === false ? false : true,
                                    message: `请选择${name}`
                                }]
                            })}
                            extra={this.state.jobName}
                            disabled>
                            <Item onClick={this.getJobs} errors={errors}>{name}</Item>
                        </Picker>
                    </div>;
                break;
            case 6:
                input = <Item {...getFieldProps(`${id}.${apiName}`, {
                    initialValue: value,
                })} arrow="horizontal" extraDom={value} readonly={true}>{name}</Item>
                break;
            case 7:
                input = <Item
                    arrow="horizontal"
                    extraDom={this.getsafeguardDate().startDate}
                    readonly={true}
                    {...getFieldProps(`${id}.${apiName}`, { initialValue: this.getsafeguardDate().startDate })}
                >{name}</Item>
                break;
            case 8:
                input = <Item
                    arrow="horizontal"
                    extraDom={this.getsafeguardDate().endDate}
                    readonly={true}
                    {...getFieldProps(`${id}.${apiName}`, { initialValue: this.getsafeguardDate().endDate })}
                >{name}</Item>
                break;
            case 99:
                input = (<div
                    {...getFieldProps(`${id}.${apiName}`, {
                        rules: [{
                            required: true,
                            message: `请输入${name}`
                        }]
                    })}
                    extra="请选择"
                >
                    <div className={styles.signature}>
                        <Item errors={errors}>{name}</Item>
                        <p onClick={() => { this.signatureShowClick(true) }}>{getFieldsValue([`${id}.${apiName}`])[id][apiName] ? "重新签名" : "立即签名"}</p>
                    </div>
                </div>);
                break;
            default: input = <div>无此类型</div>
        }
        // 判断必填添加* 且接受input数组以处理投保人手机号&验证码
        const item_required = item.required != false && ![6, 7, 8].includes(Number(item.type))
        const template_item = Array.isArray(input) ? input : [input]
        return template_item.filter(item => item).map(input => <div className={[styles.insured_item, item_required ? styles.insured_item_required : ""].join(' ')}>{item_required && <span className={styles.required}>*</span>}{input}</div>);
    }

    stopScroll = (e) => {
        e.preventDefault();
    }

    signatureShowClick(bol) {
        this.props.form.setFieldsValue({
            [`${this.props.id}.${this.state.item.apiName}`]: ""
        })
        window.addEventListener('touchmove', this.stopScroll, { passive: false });
        this.setState({
            signatureShow: bol
        })
    }

    render() {
        return (
            <React.Fragment>
                {this.inputInit()}
                {
                    this.state.signatureShow ? <div className={styles.signaturePopup}>
                        <div className={styles.middsignaturePopup}>
                            <div className={styles.mask}></div>
                            <div className={styles.Popup}>
                                <p className={styles.top}>请在下方方框内签名 </p>
                                <img onClick={() => { this.signatureShowClick(false) }} src={require("../../images/close.png")}></img>
                                <div className={styles.signature} ref="signature">
                                    <CanvasDraw
                                        ref={this.signCanvas}
                                        brushColor="#000"
                                        brushRadius={1.5}
                                        lazyRadius={5}
                                        canvasWidth="5.4rem"
                                        canvasHeight="3.1rem"
                                        hideGrid={true}
                                        hideInterface={true}
                                        style={{ background: "#F4F5F6" }}
                                        onChange={(e) => { this.signatureChange(e) }}
                                    />
                                </div>
                                <p className={styles.bottom}>本人同意投保并确认保险金额</p>
                                <div className={styles.btn}>
                                    <div className={styles.rewrite} onClick={() => { this.rewriteClick() }}>重写</div>
                                    <div className={styles.submit} onClick={() => { this.submitClick() }}>提交</div>
                                </div>
                            </div>
                        </div>
                    </div> : ""
                }
            </React.Fragment>
        );
    }
}

export default Input;
