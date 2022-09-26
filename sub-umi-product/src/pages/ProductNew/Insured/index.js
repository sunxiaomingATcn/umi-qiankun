/**
 * title: 投保信息填写
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import Input from '../components/InsureInput/Input';
import { ActivityIndicator, Toast, Picker, Button } from 'antd-mobile';
import { createForm } from 'rc-form';
import ModalPopup from '@/components/modal/Popup';
import { history } from 'umi';
import moment from 'moment';
import WxSDK from "@/utils/wx-sdk";
import getSpecialPaymentQuote,
{
    getInsurantBirthRestrictGeneId,
    transformIdentityCard,
    getInsurantSeatRestrictGeneId
} from '../assets/productConfig/getSpecialPaymentQuote';
import FileRead from '../components/FileRead';
import TracBacks from '@/utils/trackBacks';
import routerTrack from '@/components/routerTrack';
import styles from './index.scss';
import iosnohistory from '@/utils/tool/iosnohistory';
import recoveryInsured, { saveInsured } from '../assets/recoveryInsured';;

let id = 1;
const defaultSecond = 0; // 阅读条款默认倒计时

const Item = props => (
    <div
        onClick={props.onClick}
        className={styles.item_wrapper}
    >
        <div className={styles.item}>
            <div className={[styles.item_children].join(' ')}>{props.children}</div>
            <div className={styles.item_extra}>{props.extra}</div>
        </div>
    </div>
);

@routerTrack({ id: 'page30', autoStop: 30 })
@connect(({ login, insuredNew, loading, common, productNew }) => ({
    login,
    insuredNew,
    common,
    productNew,
    loading: loading.effects['insuredNew/insureInfo', 'common/getArea']
}))

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            insuredTemplate: null,
            loading: true,
            beneficiaryList: [],
            beneficiaryItem: null,
            haveRead: false,
            paymentDeclaration: true,
            insurantType: null,
            beneficiaryType: null,
            renewInsuranceDeclaration: true,
            recoveryflag: false,
            jobName: null,
            isRenewalPay: false,
            insured_read_document: [],
            clauseReadSecond: defaultSecond,
            modalPopupConfig: {
                visible: false,
                file: {}
            },
            quoteRestrictGenes: []
        }
        // 被保人是他人时 投保人不展示以下因子
        this.applicantAndinsurantCommonApiNames = ["count", "isHaveSocial", "profession", "height", "weight"];
        this.recovery = recoveryInsured.bind(this)
        this.saveInsured = saveInsured.bind(this)
    }

    componentDidMount() {
        new WxSDK().hideAllNonBaseMenuItem();
        this.initTemplate();
        this.getQuoteRestrictGenes();
    };

    componentWillUnmount() {
    }

    /**
     * init 模板
    */
    initTemplate = () => {
        const { dispatch, location: { query: { quoteRecordId: quoteId, id: productId } } } = this.props;
        // if (productId != localStorage.getItem("ppb_product_id")) {
        //     Toast.fail("投保流程有误,请返回产品详情页面重新投保", 10)
        //     return;
        // }
        Toast.loading('Loading...', 0)
        dispatch({
            type: 'insuredNew/insureInfo',
            payload: {
                id: productId,
                quoteId
            }
        }).then(res => {
            const { code, payload, message } = res;
            if (code === 0) {
                Toast.hide();
                // 处理模板
                const insuredTemplate = payload;
                let beneficiaryItem = null,
                    beneficiaryList = [];
                if (insuredTemplate && insuredTemplate.attrModules) {
                    insuredTemplate.attrModules.forEach(item => {
                        // 排序
                        item.productAttributes.sort((a, b) => a.sort - b.sort);
                        // 处理受益人
                        if (item.moduleId == 30) {
                            beneficiaryItem = item.productAttributes;
                            beneficiaryList.push({ id: ++id, beneficiaryItem });
                        }
                        item.show = true;
                    })
                }
                // 处理投保阅读文档
                const insured_read_document = payload.relevantDocument.map(item => ({ ...item, name: item.name && item.name.includes('.') ? item.name.substring(0, item.name.lastIndexOf(".")) : item.name }))
                this.setState({
                    insured_read_document,
                    beneficiaryList,
                    beneficiaryItem,
                    beneficiaryIndex: [payload.beneficiaryType && payload.beneficiaryType.defaultValue],
                    insuredTemplate,
                    insurantType: payload && payload.insurantType ? payload.insurantType : { defaultValue: 1 },
                    beneficiaryType: payload.beneficiaryType,
                    recoveryflag: localStorage.getItem(`${payload.productId}_productDate`),
                    type: res.payload && res.payload.type ? res.payload.type : undefined
                }, () => {
                    sessionStorage.setItem(`insured_read_document_${payload.productId}`, JSON.stringify(insured_read_document))
                });

                dispatch({
                    type: 'common/getArea',
                    payload: { vendorCode: payload.vendorCode }
                }).then(res => {
                    if (res && res.code === 0) {
                        localStorage.setItem('Area', JSON.stringify(res.payload));
                    }
                });
            } else {
                Toast.fail(message);
                window.history.back();
            }
        });
    }

    /**
     * init 报价id获取报价因子&结果
    */
    getQuoteRestrictGenes = () => {
        const { quoteRecordId } = this.props.location.query;
        const { dispatch } = this.props;
        return dispatch({
            type: 'productNew/queryQuoteDetail',
            payload: {
                id: quoteRecordId
            }
        }).then(res => {
            if (res && res.code === 0) {
                this.setState({
                    quoteRestrictGenes: res.payload.restrictGenes,
                    quoteDom: getSpecialPaymentQuote({ premium: res.payload.premium })// 获取展示价格dom
                });
            }
        })
    }
    /**
     * =============================================== 身份证change计算保费 begin ===============================================
     * 被保人类型本人(1) => 投保人身份证change计算
     * 被保人类型其他=>被保人 身份证change计算
     */
    calculationPremium = (e, name, regex) => {
        if (!e) return;
        if (name === 'moPolicyExtInfo.seat') {
            this.getQueryQuoteBySeat(e)
        } else {
            const { insurantType: { defaultValue } = {} } = this.state;
            if ((name === 'applicantInfo.identity' && defaultValue == '1') || (name === 'insurantInfo.identity' && defaultValue == '2')) {
                const identity = e.target.value;
                const reg = new RegExp(regex);
                if (reg.test(identity)) {
                    const { birthday } = transformIdentityCard(identity);
                    this.getQueryQuoteByBirth(birthday)
                }
            }
        }
    }
    // 投保页面 算费
    getQuote = async (quoteRestrictGene = this.state.quoteRestrictGenes) => {
        const { query: { id } } = this.props.location;
        // 参与算费的缴费方式值的类型
        const { dispatch } = this.props;
        this.quote = dispatch({
            type: 'productNew/queryQuote',
            payload: {
                id,
                info: quoteRestrictGene,
            },
            insured: true
        }).then(res => {
            if (res && res.code == 0) {
                // 算费结果展示dom
                this.setState({
                    quoteInfo: res.payload,
                    quoteDom: getSpecialPaymentQuote({ premium: res.payload.premium })
                })
            }
        })
        await this.quote;
    }
    // 根据填写被保人生日算费
    getQueryQuoteByBirth = async (birthday) => {
        const { insuredTemplate: { productId } = {} } = this.state;
        const quoteRestrictGene = this.state.quoteRestrictGenes;
        const insurantBirthRestrictGeneId = getInsurantBirthRestrictGeneId(quoteRestrictGene);
        localStorage.setItem(`ppb_insured_quote_insurantBirth_${productId}`, birthday)
        const insurantBirthRestrictGene = quoteRestrictGene.find(item => item.restrictGene == insurantBirthRestrictGeneId)
        if (insurantBirthRestrictGene) insurantBirthRestrictGene.value = birthday;
        this.getQuote(quoteRestrictGene)
    };
    // 根据填写核定载人数算费
    getQueryQuoteBySeat = async (value) => {
        const { insuredTemplate: { productId } = {} } = this.state;
        const quoteRestrictGene = this.state.quoteRestrictGenes;
        const insurantBirthRestrictGeneId = getInsurantSeatRestrictGeneId(quoteRestrictGene);
        const insurantBirthRestrictGene = quoteRestrictGene.find(item => item.restrictGene == insurantBirthRestrictGeneId)
        if (insurantBirthRestrictGene) insurantBirthRestrictGene.value = value + '座';
        this.getQuote(quoteRestrictGene)
    };
    // 根据保额算费
    getQueryQuoteByPrice = async (value) => {
        const quoteRestrictGene = this.state.quoteRestrictGenes
        const result = quoteRestrictGene.find(item => item.name == '保额');
        const insurantPriceRestrictGene = quoteRestrictGene.find(item => item.restrictGene == result.restrictGene)
        if (insurantPriceRestrictGene) insurantPriceRestrictGene.value = value
        this.getQuote(quoteRestrictGene)
    };
    // 根据二手车成交价
    getQueryQuoteByCarPrice = async (value) => {
        const quoteRestrictGene = this.state.quoteRestrictGenes
        const result = quoteRestrictGene.find(item => item.name == '二手车成交价（万元）');
        const insurantCarPriceRestrictGene = quoteRestrictGene.find(item => item.restrictGene == result.restrictGene)
        if (insurantCarPriceRestrictGene) insurantCarPriceRestrictGene.value = value
        this.getQuote(quoteRestrictGene)
    };
    // 根据初等日期
    getQueryQuoteByRegistDate = async (value) => {
        const quoteRestrictGene = this.state.quoteRestrictGenes
        const result = quoteRestrictGene.find(item => item.name == '初登日期');
        const insurantCarRegistDateRestrictGene = quoteRestrictGene.find(item => item.restrictGene == result.restrictGene)
        if (insurantCarRegistDateRestrictGene) insurantCarRegistDateRestrictGene.value = value
        this.getQuote(quoteRestrictGene)
    };

    // 保存报价 获取报价id
    saveQuote = async () => {
        await this.quote;
        const { dispatch, productNew: { quoteRecord: { id, quoteCode: savedQuoteCode } } } = this.props;
        const { quoteInfo } = this.state;
        if (!quoteInfo) return Promise.reject();
        const allowedInsure = this.checkQuote();
        if (!allowedInsure) return Promise.reject();
        // 未重新算费不需要重新保存报价直接返回当前报价id
        if (savedQuoteCode == quoteInfo.quoteCode) return Promise.resolve({ payload: { id, quoteCode: savedQuoteCode } })
        return dispatch({
            type: 'productNew/saveQuote',
            payload: {
                quoteCode: quoteInfo.quoteCode,
                parm: localStorage.getItem("state_parm")
            }
        })
    }
    // 用于恢复表单时恢复报价
    getInsuredQuotation = async () => {
        const { props: { form: { getFieldsValue } }, state: { insurantType: { defaultValue: insurantTypeValue } = {} } } = await this;
        const value = getFieldsValue();
        const insurant = insurantTypeValue == 1 ? value.applicantInfo : value.insurantInfo
        if (insurant && insurant.identity) {
            const { birthday } = transformIdentityCard(insurant.identity);
            if (birthday) this.getQueryQuoteByBirth(birthday)
        }
    }
    /**
     * =============================================== 身份证change计算保费 end ===============================================
    */

    collapseOnChange = (moduleApiName) => {
        const { insuredTemplate } = this.state;
        insuredTemplate.attrModules.forEach(item => {
            if (item.moduleApiName == moduleApiName) {
                item.show = !item.show;
            }
        });
        this.setState({
            insuredTemplate
        })
    };

    tracks(payload) {
        this.props.dispatch({
            type: "insuredNew/tracks",
            payload,
        })
    }

    inputOnblur = (e, item, action, _this, regex, name) => {
        //  计算保费
        this.calculationPremium(e, name, regex);
        // 暂存
        this.saveInsured(e, item, action, _this, regex, name);
    }

    addBeneficiary = () => {
        const { beneficiaryList, beneficiaryItem } = this.state;
        let newBeneficiaryList = JSON.parse(JSON.stringify(beneficiaryList));
        if (newBeneficiaryList.length < 4) {
            newBeneficiaryList.push({ id: ++id, beneficiaryItem });
            localStorage.setItem(`${localStorage.getItem('product_id')}_newBeneficiaryList`, JSON.stringify(newBeneficiaryList))
            this.setState({ beneficiaryList: newBeneficiaryList });
        }
    };

    checkDeclaration() {
        const { haveRead, insured_read_document } = this.state;
        let flag = true;
        if (!haveRead) {
            Toast.info(`请确认您已阅读${insured_read_document && insured_read_document.map(i => `《${i.name}》`).join('')}，并已勾选同意上述协议约定`, 3);
            flag = false
        }
        return flag;
    };

    formatInputValue(value) {
        if (Object.prototype.toString.call(value).slice(8, -1) === 'Array' && value.length === 1) {
            return isNaN(value[0]) ? value[0] : +value[0];
        } else if (Object.prototype.toString.call(value).slice(8, -1) === 'Date') {
            return moment(value).format('YYYY-MM-DD');
        } else {
            return value
        }
    }

    // 确认投保
    submitInsure = async (data) => {
        const { dispatch, login: { token } } = this.props;
        const { purchaseOrderId, type } = this.state;
        this.saveQuote().then(async res => {
            // 投保参数：报价id
            if (!res || !res.payload) return;
            const { id: quoteRecordId } = res.payload;
            const iseeBiz = await TracBacks.zhongyuan.getIseeBiz();
            let obj = {}
            let carInfo = JSON.parse(localStorage.getItem('carInfo'))
            if (localStorage.ppb_visting_productName === '机动车延长保修保险UAC') {
                data.moPolicyExtInfo.fairMarketPrice = data.moPolicyExtInfo.fairMarketPrice * 10000
                data.moPolicyExtInfo.brand_id = carInfo.brandId
                data.moPolicyExtInfo.series_name = carInfo.seriesName
                data.moPolicyExtInfo.model_name = carInfo.modelName
                data.moPolicyExtInfo.model_id = carInfo.modelId
            }
            if (type)
                obj.type = type
            dispatch({
                type: 'insuredNew/submitInsure',
                payload: {
                    params: {
                        ...data,
                        ...obj,
                        purchaseOrderId,
                        iseeBiz,
                        tracebackCode: localStorage.getItem('uuid'), // 车车可回溯唯一标识
                        quoteRecordId, // 报价id
                    },
                    token
                }
            }).then(res => {
                res && Toast.hide();
                const { id: productId } = this.props.location.query;
                if (res && res.code === 0) {
                    if (localStorage.ppb_visting_productName === '机动车延长保修保险UAC') {
                        let imgPathsList = [
                            {
                                category_id: '40',
                                pic_path: localStorage.drivingLicenseUrl,
                            },
                            {
                                category_id: '0',
                                pic_path: localStorage.carUrl,
                            },
                            {
                                category_id: '31',
                                pic_path: localStorage.mileageUrl,
                            },
                        ]
                        dispatch({
                            type: 'productNew/sendOrder',
                            payload: {
                                brand_id: carInfo.brandId,
                                brand_name: data.moPolicyExtInfo.standardFullName,
                                series_nam: carInfo.seriesName,
                                imgPathsList: imgPathsList,
                                vin: data.moPolicyExtInfo.vinNo,
                                car_number: data.moPolicyExtInfo.carLicenseNo,
                                mile_age: data.moPolicyExtInfo.currentMileage,
                                reg_date: data.moPolicyExtInfo.registDate,
                                switch_from_service: carInfo.useCharacter,
                                engine_no: data.moPolicyExtInfo.engineNo,
                                model_code: carInfo.modelId,
                                policyId: res.payload.id,
                            }
                        }).then(response => {
                            if (response && response.success) {
                                history.push({
                                    pathname: '/ProductNew/UAC/order',
                                    query: {
                                        id: productId,
                                        purchaseOrderId: res.payload.id,
                                        quoteRecordId,
                                        plan: res.payload.plan
                                    }
                                })
                            }
                        })
                    } else {
                        // 投保确认页
                        history.push({
                            pathname: '/productnew/insured/confirm',
                            query: {
                                id: productId,
                                purchaseOrderId: res.payload.id,
                                quoteRecordId,
                                plan: res.payload.plan,
                                type, // type；1=>非车险，type：2 人身险
                            }
                        })
                    }

                } else {
                    if (res && res.code == 1005) {
                        // 身份证上传 瑞再暂时不需要
                        // history.push({
                        //     pathname: '/productnew/insured/upload',
                        //     query: {
                        //         id: productId,
                        //         purchaseOrderId: res.payload.id,
                        //     }
                        // })
                        res && Toast.info(res.message, 2);
                    } else {
                        res && Toast.info(res.message, 2);
                    }
                    if (res && res.payload) {
                        const purchaseOrderId = res.payload.id;
                        this.setState({ purchaseOrderId })
                    }

                }
            });
        })
    };

    verifyBeneficiary(beneficiariesInfo) {
        let num = 0;
        beneficiariesInfo.forEach(ele => {
            num = num + (+ele.benefit);
        });
        if (num !== 100) {
            Toast.info('所有受益人受益比率之和应为100', 2);
            return false;
        }
        return true;
    }

    // 检查报价 0不能投保
    checkQuote = () => {
        const { quoteInfo } = this.state;
        // console.log(449, quoteInfo, this.props)
        if (quoteInfo && Number(quoteInfo.premium) === 0) {
            Toast.fail('被保险人出生日期有误');
            return false;
        }
        return true;
    }

    onSubmit = (e) => {
        e.preventDefault();
        // this.saveHtml2canvas();
        if (!this.checkDeclaration()) return false;
        Toast.loading('Loading...', 0);
        setTimeout(() => {
            this.props.form.validateFields(async (error, values) => {
                console.log("values", values)
                const { location, insuredNew: { applicantInfoProfessionStr, insurantInfoProfessionStr } } = this.props;

                if (error) {
                    Toast.info('请完整填写投保信息', 2);
                    window.scroll(0, 0);
                    return;
                }
                this.inputOnblur(null, { name: "立即投保" }, "click", this)
                // const loginSuccess = await this.onLogin();
                // if (!loginSuccess) return;
                let beneficiariesInfo = [];
                for (let item in values) {
                    if (typeof values[item] === 'object') {
                        for (let ele in values[item]) {
                            values[item][ele] = this.formatInputValue(values[item][ele]);
                        }
                    }
                    if (item.startsWith('beneficiary')) {
                        beneficiariesInfo.push(values[item]);
                        delete values[item];
                        values.beneficiariesInfo = beneficiariesInfo;
                    }
                    if (item === 'applicantInfo' || item === 'insurantInfo') {
                        if (values[item].living) {
                            if (!Array.isArray(values[item].living)) {
                                values[item].living = [values[item].living, '', ''];
                            }
                            if (values[item].living.length == 2) {
                                const living = [...values[item].living]
                                living.splice(1, 0, '');
                                values[item].living = living;
                            }
                        }
                    }
                }
                if (beneficiariesInfo.length > 0 && !this.verifyBeneficiary(beneficiariesInfo)) return false;
                let trackScreenshots = []
                if (values.applicantInfo)
                    values.applicantInfo.identityPeriod = this.props.insuredNew.applicantInfo
                if (values.insurantInfo)
                    values.insurantInfo.identityPeriod = this.props.insuredNew.insurantInfo
                values.applicantInfo.professionStr = applicantInfoProfessionStr
                if (values && values.insurantInfo)
                    values.insurantInfo.professionStr = insurantInfoProfessionStr
                const { insurantType, beneficiaryType } = this.state;
                const { id, quoteRecordId, userWorkId, tenantId, insureNum } = this.props.location.query;
                let EAUFlag = localStorage.ppb_visting_productName == '人保驾乘意外险产品EAU'
                let payload = {
                    productId: id,// 产品ID
                    quoteRecordId: quoteRecordId, // 报价id
                    insureNum,
                    preOrder: true,
                    beneficiaryType: beneficiaryType ? beneficiaryType.defaultValue : null,
                    insurantType: insurantType && insurantType.defaultValue && !EAUFlag ? insurantType.defaultValue : 1,
                    tenantId,
                    userWorkId,
                    ...values
                };
                payload.trackScreenshots = trackScreenshots
                await this.submitInsure(payload)
            });
        }, 500)
    };
    /**
     * =============================================== 阅读文件 begin ===============================================
    */
    showFile = (file) => {
        this.clauseReadcountDown();
        this.setState({
            modalPopupConfig: {
                visible: true,
                title: file.name,
                content: <FileRead file={file} />
            }
        })
    }

    /**
     * 文件阅读 begin
     * 打开下一个必读文件
    */
    readNextDocument = async () => {
        if (this.getFirstUnreadDocument()) {
            await this.needReadFileClick(this.getFirstUnreadDocument());
            this.setState({ haveRead: this.getFirstUnreadDocument() ? false : true })
        }
    }
    // 关闭文件弹窗
    closeFileModal = () => {
        this.setState({ modalPopupConfig: { visible: false } }, () => {
            this.setState({ clauseReadSecond: defaultSecond })
            setTimeout(() => {
                this.readNextDocument()
            }, 300)
        });
        this.timer && clearInterval(this.timer)
    }
    // 条款阅读倒计时
    clauseReadcountDown = () => {
        let clauseReadSecond = defaultSecond;
        if (clauseReadSecond) clauseReadSecond--;
        this.timer = setInterval(() => {
            if (clauseReadSecond <= 0) clearInterval(this.timer);
            this.setState({ clauseReadSecond })
            clauseReadSecond--;
        }, 1000);
    }
    // 每个文件都阅读后自动勾选
    readAlAutoChecked = () => {
        const { insured_read_document } = this.state;
        if (insured_read_document && insured_read_document.every(file => file.beenread)) this.setState({ haveRead: true });
    }
    // 文件点击
    needReadFileClick(item) {
        // 文件已阅读标识
        item.beenread = true;
        this.readAlAutoChecked();
        // isReadingFile 当前正在阅读文件 isReadingFile.readBtnClicked 当前正在阅读文件点击状态
        this.setState({ isReadingFile: item })
        this.showFile(item)
    }
    // 获取第一个强制阅读文件
    getFirstUnreadDocument = () => {
        const { insured_read_document } = this.state;
        return insured_read_document && insured_read_document.find(file => !file.beenread && file.compulsoryReading);
    }
    //  我已阅读点击
    checkdClick = async () => {
        if (this.getFirstUnreadDocument()) {
            // Toast.info('请点击阅读每个文档及条款', 3)
            await this.needReadFileClick(this.getFirstUnreadDocument());
            // 所有都查看后自动勾选
            this.setState({ haveRead: this.getFirstUnreadDocument() ? false : true })
        } else {
            this.inputOnblur(null, { name: "我已认真阅读并同意" }, "click", this, null, null)
            this.setState({ haveRead: !this.state.haveRead })
        }
    }
    /**
     * =============================================== 文件阅读end ===============================================
    */

    onBeneficiaryChange = (value) => {
        this.setState({
            showBeneficiary: value == '0' ? false : true
        });
    };

    del = (index) => {
        this.setState({
            beneficiaryList: this.state.beneficiaryList.filter((_, i) => i !== index)
        })
    };

    changeIndex = (value, key, itm) => {
        if (value[0] == 2) {
            itm.productAttributes.forEach((i, ind) => {
                if (i.attributelabels) {
                    // this.defautTracks(i, false)
                }
            })
        }
        if (key == "beneficiaryType") {
            let item = this.state.beneficiaryType
            const c = item.attributelabels.find(i => i.value == value[0]);
            if (!c) return;
            // this.tracks([{ operateType: 13, msg: `选择项=${item.name}，选择结果=${c.label}`, productId: localStorage.getItem("product_id") }])
        } else {
            let item = this.state.insurantType;
            const c = item.attributelabels.find(i => i.value == value[0]);
            if (!c) return;
            // this.tracks([{ operateType: 13, msg: `选择项=${item.name}，选择结果=${c.label}`, productId: localStorage.getItem("product_id") }])
        }
        localStorage.setItem(`${this.state.insuredTemplate.productId}_defaultValue_${key}`, value)
        if (key == "insurantType" && localStorage.getItem(`${localStorage.getItem('product_id')}_insurantInfoPassport`) && value == 1) {
            localStorage.removeItem(`${localStorage.getItem('product_id')}_insurantInfoPassport`)
            this.props.dispatch({
                type: "insuredNew/editdate",
                payload: {
                    insurantInfoPassport: false,
                    signature2: false,
                }
            })
        }
        const item = this.state[key];
        item.defaultValue = value[0];
        this.setState({ [key]: item }, key == 'insurantType' ? this.getInsuredQuotation : () => { })
    };

    identitytest(e) {
        if (/^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(e)) {
            var strBirthday = ''
            strBirthday = e.substr(6, 4) + "/" + e.substr(10, 2) + "/" + e.substr(12, 2);
            var birthDate = new Date(strBirthday);
            var nowDateTime = new Date();
            var age = nowDateTime.getFullYear() - birthDate.getFullYear();
            //再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
            if (nowDateTime.getMonth() < birthDate.getMonth() || (nowDateTime.getMonth() == birthDate.getMonth() && nowDateTime.getDate() < birthDate.getDate())) {
                age--;
            }
            return age
        } else {
            return 0
        }
    }

    render() {
        const {
            insuredTemplate,
            haveRead,
            beneficiaryList,
            insurantType,
            beneficiaryType,
            recoveryflag,
            quoteDom,
            insured_read_document,
            modalPopupConfig
        } = this.state,
            { form, form: { getFieldValue }, insuredNew: { Dateflag1, Dateflag2, signature1, signature2, applicantInfoPassport, insurantInfoPassport } } = this.props;

        let insurantTypeIsOthers = insurantType && insurantType.defaultValue == 2 ? true : false;

        return (
            <div className={styles.container_wrapper} id="contaner" style={{ paddingBottom: `${iosnohistory() ? 1.8 : 1.2}rem` }}>
                {
                    recoveryflag && <div className={styles.recovery}>
                        <p>点击恢复上一次填写内容</p>
                        <div onClick={() => { this.recovery(false) }} className={styles.noneed}>不需要</div>
                        <div onClick={() => { this.recovery(true) }} className={styles.need}>恢复</div>
                    </div>
                }
                {
                    insuredTemplate && <div className={styles.content}>
                        {
                            insuredTemplate.attrModules && insuredTemplate.attrModules.map(item => {
                                if (item.moduleApiName === 'beneficiariesInfo') {
                                    return <div className={styles.insured_input_wrapper} key={item.moduleApiName}>
                                        {
                                            <div>
                                                <Picker
                                                    data={[beneficiaryType.attributelabels]}
                                                    title='受益人信息'
                                                    cascade={false}
                                                    value={[beneficiaryType.defaultValue]}
                                                    onOk={v => this.changeIndex(v, 'beneficiaryType', item)}
                                                >
                                                    <Item>{item.name}</Item>
                                                </Picker>
                                                {
                                                    beneficiaryType.defaultValue === 3 && <div
                                                        className={[styles.insured_item_wrapper].join(' ')}>
                                                        {
                                                            beneficiaryList.map((ele, index) => {
                                                                return <div key={ele.id}
                                                                    className={styles.beneficiary_container}>
                                                                    <div
                                                                        className={[styles.beneficiary_Item_title, 'flex-r-bc'].join(' ')}
                                                                    >
                                                                        <span>受益人{index + 1}</span>
                                                                        {beneficiaryList.length > 1 &&
                                                                            <i className={styles.del}
                                                                                onClick={() => this.del(index)}>删除</i>}
                                                                    </div>
                                                                    <div>
                                                                        {
                                                                            ele.beneficiaryItem.map((element, aa) => {
                                                                                if (element.apiName !== 'identity') {
                                                                                    return <Input key={aa}
                                                                                        item={element}
                                                                                        form={form}
                                                                                        id={`beneficiary${index}`}
                                                                                        inputOnblur={this.inputOnblur}
                                                                                    />
                                                                                } else {
                                                                                    return <Input key={aa}
                                                                                        item={element}
                                                                                        form={form}
                                                                                        regexItem={ele.beneficiaryItem.filter(value => {
                                                                                            return value.apiName === 'identityType'
                                                                                        })}
                                                                                        id={`beneficiary${index}`}
                                                                                        inputOnblur={this.inputOnblur}
                                                                                    />

                                                                                }
                                                                            })
                                                                        }
                                                                    </div>
                                                                </div>
                                                            })
                                                        }
                                                        {insuredTemplate && beneficiaryList.length < insuredTemplate.beneficiaryLimit &&
                                                            <div className={styles.addBeneficiary}
                                                                onClick={this.addBeneficiary}>
                                                                <div className={styles.addBeneficiaryBac}></div>
                                                                <span className={styles.beneficiaryContent}>新增受益人</span>
                                                            </div>}
                                                    </div>

                                                }
                                            </div>
                                        }
                                    </div>
                                } else if (item.moduleApiName === 'insurantInfo') {
                                    return <div className={styles.insured_input_wrapper} key={item.moduleApiName}>
                                        {
                                            <div>
                                                <Picker
                                                    data={insurantType ? [insurantType.attributelabels] : []}
                                                    title='被保险人'
                                                    cascade={false}
                                                    value={insurantType ? [insurantType.defaultValue] : undefined}
                                                    onOk={v => this.changeIndex(v, 'insurantType', item)}
                                                >
                                                    <Item>{item.name}</Item>
                                                </Picker>
                                                {
                                                    insurantType && (insurantType.defaultValue === 2) &&
                                                    <div
                                                        className={[styles.insured_item_wrapper, item.show ? undefined : styles.hide].join(' ')}>
                                                        {
                                                            item.productAttributes.map((ele, idx) => {
                                                                if (ele.apiName !== 'identity') {
                                                                    if (signature2 && ele.name == "电子签名") {
                                                                        return <Input key={idx}
                                                                            item={ele}
                                                                            form={form}
                                                                            id={item.moduleApiName}
                                                                            inputOnblur={this.inputOnblur}
                                                                        />
                                                                    } else if (!signature2 && ele.name == "电子签名") {
                                                                        return null
                                                                    } else if (!Dateflag2 && ele.name == "证件有效期至") {
                                                                        return null
                                                                    } else if (!insurantInfoPassport && (ele.name == "出生日期" || ele.name == "性别")) {
                                                                        return null
                                                                    } else {
                                                                        return <Input key={idx}
                                                                            jobName={this.state[`${item.moduleApiName}_profession_label`] || ''}
                                                                            item={ele}
                                                                            form={form}
                                                                            id={item.moduleApiName}
                                                                            inputOnblur={this.inputOnblur}
                                                                        />
                                                                    }
                                                                } else {
                                                                    return <Input key={idx}
                                                                        item={ele}
                                                                        regexItem={item.productAttributes.filter(value => {
                                                                            return value.apiName === 'identityType'
                                                                        })}
                                                                        form={form}
                                                                        id={item.moduleApiName}
                                                                        inputOnblur={this.inputOnblur}
                                                                    />
                                                                }
                                                            })
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                } else {
                                    return (<div className={styles.insured_input_wrapper} key={item.moduleApiName}>
                                        <div>
                                            <h3 className={[styles.insured_title, 'flex-r-bc'].join(' ')}>
                                                {item.name}
                                                <img src={require('@/assets/icon/arrow-grey.svg')} alt=""
                                                    className={item.show ? styles.show : undefined}
                                                    onClick={() => this.collapseOnChange(item.moduleApiName)} />
                                            </h3>
                                            <div
                                                className={[styles.insured_item_wrapper, item.show ? undefined : styles.hide].join(' ')}>
                                                {
                                                    item.productAttributes.map((ele, idx) => {
                                                        if (ele.apiName == 'identity') {
                                                            return <Input key={idx}
                                                                item={ele}
                                                                regexItem={
                                                                    item.productAttributes.filter(value => {
                                                                        return value.apiName === 'identityType'
                                                                    })}
                                                                form={form}
                                                                id={item.moduleApiName}
                                                                inputOnblur={this.inputOnblur}
                                                            />
                                                        } else {
                                                            if (item.moduleApiName == "applicantInfo") {
                                                                if (insurantTypeIsOthers && this.applicantAndinsurantCommonApiNames.includes(ele.apiName)) return null
                                                                if (!applicantInfoPassport && ["birthday", "gender"].includes(ele.apiName)) return null
                                                            }
                                                            if (item.moduleApiName == "renewalFeeInfo") {
                                                                // 非自动续保时 隐藏renewalPayAccount等
                                                                if (getFieldValue('renewalFeeInfo.isRenewalPay') == 2 &&
                                                                    ["renewalPayAccount", "renewalPayBank", "renewalPayCardholder"].includes(ele.apiName)) return null
                                                            }
                                                            if (!signature1 && ele.name == "电子签名") return null
                                                            if (!Dateflag1 && ele.name == "证件有效期至") return null
                                                            return <Input key={idx}
                                                                jobName={this.state[`${item.moduleApiName}_profession_label`] || ''}
                                                                item={ele}
                                                                form={form}
                                                                id={item.moduleApiName}
                                                                inputOnblur={this.inputOnblur}
                                                                getQueryQuoteByPrice={this.getQueryQuoteByPrice}
                                                                getQueryQuoteByCarPrice={this.getQueryQuoteByCarPrice}
                                                                getQueryQuoteByRegistDate={this.getQueryQuoteByRegistDate}
                                                            />
                                                        }
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>)
                                }
                            })
                        }
                        <div className={[styles.insured_input_wrapper, styles.statement].join(' ')}>
                            <div
                                className={[styles.check_btn, haveRead ? styles.checked : ''].join(' ')}
                                onClick={() => { this.checkdClick() }} />
                            <div className={styles.declarationWrapper}>
                                本人已认真阅读
                                {
                                    insured_read_document && insured_read_document.map((item) => {
                                        return <span key={item.name}
                                            onClick={() => this.needReadFileClick(item)}
                                        >
                                            《{item.name}》
                                        </span>
                                    })
                                }，已经全面了解并接受相关内容，并全部同意
                            </div>
                        </div>
                    </div>
                }

                {insuredTemplate && <div className={styles.footer} style={{ height: `${iosnohistory() ? 1.8 : 1.2}rem` }}>
                    <div className={styles.footerContent}>
                        {quoteDom}
                        <div className={[styles.btn_flex].join(' ')}>
                            <button disabled={!haveRead} onClick={this.onSubmit}>立即投保</button>
                        </div>
                    </div>
                </div>}
                <ModalPopup
                    popup
                    maskClosable={false}
                    closable={false}
                    animationType="slide-up"
                    visible={modalPopupConfig.visible}
                    title={modalPopupConfig.title}
                    onClose={this.closeFileModal}
                >
                    <div className={styles.modalFileContainer}>
                        <div style={{ textAlign: 'left', padding: '.2rem', height: '8rem', overflowY: 'auto' }}>
                            {modalPopupConfig.content}
                        </div>
                        <Button
                            // disabled={!(isReadingFile && isReadingFile.readBtnClicked) && !!clauseReadSecond}
                            onClick={() => {
                                // isReadingFile.readBtnClicked = true;
                                this.closeFileModal();
                            }}
                            type="primary"
                            className={styles.modalFileReadedBtn}
                        >
                            投保人本人已逐项阅读
                        </Button>
                    </div>
                </ModalPopup>
            </div>
        );
    }
}

export default createForm()(Index);
