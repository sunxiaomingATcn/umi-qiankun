import Products from './Products';

const products = new Products();

export const {
  getConfigValue: getFixValue, // 根据push时候参数名获取值
  getSpecialProductFixPriceByName: fixPrice,
  getSpecialProductPayFixPriceByName: payFixPrice,
  getPriceByMonthSuffix,
  isHasAbaoService,
  getInfoDetails,
  getSalesStatement,
  getInsuranceTips,
  getInsuredAgeboundaryDayDiff,
  getPremiumTrialTitle,
  getPremiumTrialProfessionCategoryDes,
} = products;

/**
 * abao产品
 * */
export const Jdal = products.push(
  ['臻爱无限医疗保险2020版-个人基本计划', '臻爱无限医疗保险2020版-个人卓越计划'],
  'zawx',
  { fixedPrice: '首月1元', fixedPayPrice: '1.00' }
)


/**
 * pengpaibao产品
 * */
// 中元‘泰元保’百万医疗
export const RB_TYB = products.push(
  ['泰元保'],
  'rb_tyb',
  {
    priceByMonthSuffix: '/月',
    salesStatement: {
      salesCompany: '中元保险经纪有限公司'
    },
    infoDetails: [{
      name: 'pictureNotify',
      title: '客户告知书',
      insured: true, // 文件带到投保页
      value: {
        filePath: 'https://pengpaibao-src.oss-cn-beijing.aliyuncs.com/prod/1626940677945znirS.pdf'
      }
    }]
  }
)

// 瑞再企商 瑞智保·定风波意外险
export const RZ_RZB = products.push(
  ['瑞智保'],
  'RZ_RZB',
  {
    insuredAgeboundaryDayDiff: {
      max: -3,
      min: -4,
    },
    isHasAbaoService: true,
    premiumTrialTitle: '保费试算', // 保费试算弹窗标题
    premiumTrialProfessionCategoryDes: '！承保的被保险人不包括【职业类别表】中职业等级为3-6类职业或拒保职业人员',// 保费试算职业类别描述
    insuranceTips: {
      title: '投保流程提示',
      content: `<div><div>尊敬的客户：</div><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;您即将进入投保流程，请仔细阅读保险条款。本保险产品由【瑞再企商保险有限公司】承保，由车车保险销售服务有限公司提供保险中介服务。</p><p>投保前请您仔细阅读<a id="pictureNotify">《客户告知书》</a>、《投保须知》、《保费表》、《保险条款》、《免责说明》、《职业类别申明》、《增值服务手册》、《个人信息保护政策》、《被保险人同意声明》、《瑞再企商职业类别表（2022版）》等内容。</p>点击“确定”开始投保，您在销售页面的操作将被依法记录和保存。</div>`,
      submitText: '确定'
    },// 可回溯弹窗
  }
)

// 众惠疫保通
export const ZH_ZHYBT = products.push(
  ['全民疫保通（经典版）'],
  'ZH_QMYBT',
  {
    insurePremiumTrialHidden: true, //投保保费试算隐藏
    insuranceType: 1,// 非车险
    additionalDescribe: [
      { name: '保障时间', value: '3个月' },
      { name: '等待期', value: '新型冠状病毒肺炎身故保险责任、新型冠状病毒肺炎强制隔离保险责任等待期5天' }
    ]
  }
)
