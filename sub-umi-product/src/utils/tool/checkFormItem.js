/**
 * eg: const errs = getFormsErr({ [type]: value }, this.state.errs)
*/
import RegEx from '@/utils/RegEx';

export const idCardCheckCode = (value) => {
    if (value.length < 18) return null;
    const coefficient = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    // 除11取余的结果对应的校验位（最后一位）的值
    const checkDigitMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    var sum = coefficient.reduce((p, c, index) => {
        return p + c * value[index]
    }, 0)
    return checkDigitMap[sum % 11]
}

function checkFormItem(type, value) {
    let result = null;
    switch (type) {
        case 'name':
            result = !value || !value.length ? '请输入姓名' : null;
            break;
        case 'IdCardNo1518':
        case 'identity':
            result = RegEx.handleVerification('IdCardNo1518', value);
            if (!result && idCardCheckCode(value) !== value[17]) {
                result = RegEx.regMap['IdCardNo1518'].errMessage;
            }
            break;
        case 'mobile':
            result = RegEx.handleVerification('mobile', value);
            break;
        case 'validationCode':
            result = RegEx.handleVerification('validationCode6', value)
    };
    return result;
}

export default function getFormsErr(values = {}, errs = {}) {
    const _errs = Object.keys(values).reduce((p, ckey) => {
        const err = checkFormItem(ckey, values[ckey])
        return err ? { ...p, [ckey]: err } : JSON.parse(JSON.stringify({ ...p, [ckey]: undefined }))
    }, errs)
    return Object.keys(_errs).length ? _errs : null
}
