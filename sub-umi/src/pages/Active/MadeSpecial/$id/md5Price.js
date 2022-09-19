/**
 * 家庭定制价格map 
 * {key:{amount:0, wxShareData:{}}, search, channel, activeLink ...}
 * */

const md5Map = {
    // '578eb0cfaba23bee': { amount: 0, wxShareData: { title: '【0元】抢1v1家庭保障定制服务！', desc: '阿保保险，为您提供专业又贴心的保险一站式服务' } },
    '11c15364a6ec2397': { amount: 0.01, wxShareData: {} },
    // 'd236ba4ff940e074': { amount: 1, wxShareData: { title: '家庭保险方案定制', desc: '限时福利，仅需1元！', imgUrl: '/wx/images/1yuan.png' } },
    // '1c8f7d33dd86a94b': { amount: 9.9, wxShareData: { title: '【9.9元】预约1v1家庭保障定制服务', desc: '阿保保险，为您提供专业又贴心的保险一站式服务' } },
    'e457ddef7f2c4f25': { amount: 199 },
}

// query => only channel wxShare
function getQueryString() {
    const reg = /([\?\&])channel=([^\&]+)/i;
    const r = window.location.hash.match(reg) || window.location.search.match(reg);
    return r && unescape(r[0]).replace("&", "?") || "";
}

function getQueryStringAll() {
    const r = window.location.hash;
    const search = r.split("?")
    return search && search[1] && `?${search[1].replace(/([\?\&]){0,1}code=([^\&]+)/g, "")}` || ""
}

for (let key in md5Map) {
    const pathname = (route = "") => (`/active/madeSpecial/${key}${route}${getQueryStringAll()}`)
    md5Map[key] = {
        ...md5Map[key],
        search: getQueryStringAll(),
        channel: getQueryString().substring(9),
        activeLink: pathname(),
        paybackLink: pathname("/payback"),
        specialPayBackLink: `/active/madeSpecial/${key}/payback`,
        formLink: pathname("/form"),
        formResLink: pathname("/form/result"),
        wxShareData: {
            ...md5Map[key].wxShareData,
            link: `${window.location.origin}/#${pathname()}`
        }
    }
}

export default (param) => {
    return md5Map[param] || {};
}
