/**
 * 产品特性类
 * */
class SpecialProduct {
    constructor(names, code, params) {
        this.names = names;
        this.code = code;
        Object.keys(params).forEach(key => {
            this[key] = params[key]
        })
    }
    is(productName = localStorage.getItem("ppb_visting_productName")) {
        return !!(productName && this.names.some(name => productName.startsWith(name)))
    }
}

/**
 * 特殊产品实例集合类
*/
export default class Products {
    constructor() {
        this.specialProducts = [];
        // 产品默认params
        this.productDefaultParams = {
            fixedPayPrice: null,
            fixedPrice: null,
            infoDetails: null,
            isHasAbaoService: false, // 默认没有
            // 可回溯弹窗
            insuranceTips: {
                title: '消费者权益保障服务',
                content: `<div>
                <p>欢迎投保{{insuranceCompany}}的产品，您即将进入投保流程，请确保本次投保均由投保人本人操作。</p>
                <p>在接下来的投保过程中，请投保人提供真实的投保信息，并根据提示仔细阅读相关文档内容，特别是《保险条款》、《免除保险人责任条款的说明书》、《投保须知》以及《健康告知》等文档的内容。</p>
                <p>为保障客户的权益，本次投保过程将被记录。</p>
                <p>本产品由{{insuranceCompany}}提供，{{salesCompany}}进行销售。点击阅读<span id="pictureNotify">《客户告知书》</span>。</p>
            </div>`,
                submitText: '确定'
            }
        }
    }

    push(names, code, params) {
        const product = new SpecialProduct(names, code, { ...this.productDefaultParams, ...params })
        this.specialProducts.push(product)
        return product;
    }

    // 根据产品名称获取对应获取产品实例
    getSpecialProductExample = (name) => {
        for (let i = 0, len = this.specialProducts.length; i < len; i++) {
            let element = this.specialProducts[i];
            if (element.is(name)) return element;
        }
        return this.productDefaultParams;
    }

    getSpecialProduct = (name) => this.getSpecialProductExample(name) || null;
    // 根据code从specialProducts获取产品实例
    getConfigValue = (configName, { name, noConfigValue = false } = {}) => {
        if (!configName) return false;
        const product = this.getSpecialProduct(name);
        return product ? product[configName] : noConfigValue;
    }
    //  是否有固定详情展示价格
    getSpecialProductFixPriceByName = (name) => this.getConfigValue('fixedPrice')
    //  是否有固定支付价格
    getSpecialProductPayFixPriceByName = (name) => this.getConfigValue('fixedPayPrice')
    getPriceByMonthSuffix = (name) => this.getConfigValue('priceByMonthSuffix')
    // 是否有阿保客服，默认无
    isHasAbaoService = (name) => this.getConfigValue('isHasAbaoService', { noConfigValue: true })
    // 是否有指定的客户告知书，保险公司信息披露等，传入产品infoDetails返回并去重更新返回新的infoDetails
    getInfoDetails = (productInfoDetails = JSON.parse(localStorage.getItem('ppb_infoDetails')), name) => {
        const appointInfoDetails = this.getConfigValue('infoDetails');
        if (!appointInfoDetails) return productInfoDetails;
        // 替换
        const infoDetails = productInfoDetails.map(item => appointInfoDetails.find(i => i.name === item.name) || item);
        // 新增
        infoDetails.push(...appointInfoDetails.filter(item => !infoDetails.find(r => r.name === item.name)))
        return infoDetails;
    }
    // 是否有销售声明 默认车车
    getSalesStatement = (name) => {
        const salesStatement = { salesCompany: '车车保险销售服务有限公司' }
        return this.getConfigValue('salesStatement') || salesStatement;
    }
    // 投保提示
    getInsuranceTips = ({ insuranceCompany = '', salesCompany = '' } = {}, name) => {
        const insuranceTips = this.getConfigValue('insuranceTips');
        const content = insuranceTips.content.replace(new RegExp('{{insuranceCompany}}', 'gm'), insuranceCompany).replace(new RegExp('{{salesCompany}}', 'gm'), salesCompany);// 处理模板字符串
        return { ...insuranceTips, content };
    }
    // 投保年龄周岁 边界天数差值 eg:1960(min) - 2003(max), max/min = 1=>前一天, = -1=>后一天
    getInsuredAgeboundaryDayDiff = (name) => {
        const defaultDiff = { min: -1, max: 1 }
        return this.getConfigValue('insuredAgeboundaryDayDiff') || defaultDiff;
    }
    // 保费试算title
    getPremiumTrialTitle = (premiumTrialTitle, name) => {
        return this.getConfigValue('premiumTrialTitle') || premiumTrialTitle
    }
    // 保费试算职业类别描述
    getPremiumTrialProfessionCategoryDes = (name) => {
        return this.getConfigValue('premiumTrialProfessionCategoryDes') || null
    }
}

