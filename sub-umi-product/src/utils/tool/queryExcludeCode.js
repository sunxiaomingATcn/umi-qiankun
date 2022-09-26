import { stringify, parse } from 'qs';

/**
 * query对象或者querystring过滤code返回search
 * @params query {a:1,b:2}
 * @return ?a=1&b=2 || ''
*/
function getQueryStringExcludeCode(param) {
    const query = typeof param === 'object' ? param : parse(param.replace("?",""))
    const target = stringify(Object.keys(query).filter(k => k !== 'code' && k !== 'state').reduce((target, k) => ({ ...target, [k]: query[k] }), {}));
    return target ? `?${target}` : "";
}

export default getQueryStringExcludeCode