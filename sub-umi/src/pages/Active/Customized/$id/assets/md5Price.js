/**
 * 家庭定制价格map 
 * {key:{amount:0, wxShareData:{}}, search, channel, activeLink ...}
 * */
import { stringify, parse } from 'qs';

const md5Map = {
    '578eb0cfaba23bee': { amount: 0, wxShareData: { title: '【0元】抢1v1家庭保障定制服务！', desc: '阿保保险，为您提供专业又贴心的保险一站式服务' } },
    '11c15364a6ec2397': { amount: 0.01, wxShareData: {} },
    'd236ba4ff940e074': { amount: 1, wxShareData: { title: '家庭保险方案定制', desc: '限时福利，仅需1元！', imgUrl: '/wx/images/1yuan.png' } },
    '746903b903f2af54': { amount: 4.9, wxShareData: { title: '【限时秒杀4.9元】定制保险方案', desc: '百里挑一选产品，放心又省心！保障全面，节省保费高达50%，阿保为您打造极致高性价比方案！' } },
    '1c8f7d33dd86a94b': { amount: 9.9, wxShareData: { title: '【9.9元】预约1v1家庭保障定制服务', desc: '阿保保险，为您提供专业又贴心的保险一站式服务' } }
}

// query过滤微信授权code & 支付回调状态state
function getQueryStringExcludeCode() {
    const r = window.location.hash;
    const search = (r.split("?") || [])[1];
    if (!search) return "";
    const query = parse(search);
    const target = stringify(Object.keys(query).filter(k => k !== 'code' && k !== 'state').reduce((target, k) => ({ ...target, [k]: query[k] }), {}));
    return target ? `?${target}` : "";
}

function getQueryByKey(key) {
    return parse((window.location.hash.split("?") || [])[1])[key] || ""
}

for (let key in md5Map) {
    const pathname = (route = "") => (`/active/customized/${key}${route}`)
    const channel = getQueryByKey('channel').trim();
    const crmAdviserId = getQueryByKey('crmAdviserId').toLocaleLowerCase().trim();
    const crmCustomerId = getQueryByKey('crmCustomerId').trim();
    md5Map[key] = {
        ...md5Map[key],
        channel,
        crmAdviserId,
        crmCustomerId,
        search: getQueryStringExcludeCode(),
        activeLink: pathname(),
        authorizedback: pathname("/authback"),// 授权回调中间页
        paybackLink: pathname("/payback"),
        wxShareData: {
            ...md5Map[key].wxShareData,
            link: `${window.location.origin}/#${pathname()}${getQueryStringExcludeCode()}`
        }
    }
}

export default (param) => {
    return md5Map[param] || {};
}
