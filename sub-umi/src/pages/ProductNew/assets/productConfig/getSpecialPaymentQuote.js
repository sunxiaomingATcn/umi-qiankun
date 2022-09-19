import { getPriceByMonthSuffix } from './judgeProductFeature';
/**
 * 计算价格展示 => 首月*元，次月*元 / ￥* return DOM
 * quoteInfo： 算费结果 {}
 * quoteRestrictGene： Not required 参与算费因子id&值 {restrictGene:'',name:'',value:''} 需要展示月交固定价格时传否则不需要
 * */
export default (
  quoteInfo,
  { restrictGenes, quoteRestrictGene } = {}
) => {
  const isPaymentByMonth = quoteRestrictGene && getPaymentrRestrictGeneValue(restrictGenes, quoteRestrictGene) === '月交' ? 1 : 0;
  return (getPriceByMonthSuffix() && isPaymentByMonth) ?
    <div className="product_insured_amount product_insured_fix_amount">
      <p><span>￥</span>{`${quoteInfo && quoteInfo.premium}`}<span>{getPriceByMonthSuffix()}</span></p>
    </div> :
    <div className="product_insured_amount product_insured_quote_amount">
      <span>￥</span>
      {quoteInfo !== null && quoteInfo.premium}
    </div>
}

// 被保险人因子id
export const getInsurantBirthRestrictGeneId = function (quoteRestrictGene) {
  const restrictGene = quoteRestrictGene && quoteRestrictGene.find(restrictGene => restrictGene.name === '被保险人出生日期')
  return restrictGene && restrictGene.restrictGene;
}

// 核定载人数因子id
export const getInsurantSeatRestrictGeneId = function (quoteRestrictGene) {
  const restrictGene = quoteRestrictGene && quoteRestrictGene.find(restrictGene => restrictGene.name === '核定载人数')
  return restrictGene && restrictGene.restrictGene;
}

// 报价因子 缴费方式值value
export const getPaymentrRestrictGeneValue = function (restrictGenes, quoteRestrictGene) {
  const restrictGene = restrictGenes && restrictGenes.find(restrictGene => restrictGene.name === '交费方式')
  const restrictGeneId = restrictGene && restrictGene.id;
  console.log(restrictGene)
  return (quoteRestrictGene.find(item => item.restrictGene == restrictGeneId) || {}).value;
}

// 获取产品id
export const getProductId = () => localStorage.getItem('ppb_product_id')

// 投保页被保人身份证改变触发计算保费
export const transformIdentityCard = function (value) {
  let birthday = null, sex = null;
  // sex 0未知  1男  2女
  if (value.length === 15) {
    birthday = `19${value.substr(6, 2)}-${value.substr(8, 2)}-${value.substr(10, 2)}`
    sex = (value.substr(14, 1) % 2) || 2
  }
  if (value.length === 18) {
    birthday = `${value.substr(6, 4)}-${value.substr(10, 2)}-${value.substr(12, 2)}`
    sex = (value.substr(16, 1) % 2) || 2
  }
  var birthDate = new Date(birthday);
  var nowDateTime = new Date();
  var age = nowDateTime.getFullYear() - birthDate.getFullYear();
  if (nowDateTime.getMonth() < birthDate.getMonth() || (nowDateTime.getMonth() == birthDate.getMonth() && nowDateTime.getDate() < birthDate.getDate())) {
    age--;
  }
  return { birthday, sex, age };
}
