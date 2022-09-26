/**
 * @expand 添加正则表达式校验:
 *      regMap add regName：{reg， nullMessage， errMessage}, reg and errMessage not required
 * @use（三种使用方式）
 *      1.@return reg => thisModule.mobile
 *      2.@return errMessage =>thisModule.handleVerification(regName, value)
 *      3.@return errMessage =>thisModule.handleVerifications({regName:value ...})
 * */
const regMap = {
    //中文
    chinese: {
        reg: /^[\u4e00-\u9fa5]{1,15}$/,
        nullMessage: '请输入您的姓名',
        errMessage: '请输入正确姓名'
    },
    // 手机号
    mobile: {
        reg: /^1[3456789]\d{9}$/,
        nullMessage: '请输入手机号码',
        errMessage: '请输入正确手机号'
    },
    mobile1: {
        reg: /^1[3456789]\d{9}$/,
        nullMessage: '手机号码不能为空',
        errMessage: '手机号码格式不正确'
    },
    // 六位数字验证码
    validationCode6: {
        reg: /^\d{6}$/,
        nullMessage: '请输入验证码',
        errMessage: '请输入正确6位验证码'
    },
    // 图形验证码
    validationCaptcha: {
        reg: /^[\S]+$/,
        nullMessage: '请输入图形验证码',
        errMessage: '请输入正确图形验证码'
    },
    // 只定义nullMessage，只校验非空
    name: {
        nullMessage: '请输入姓名',
    },
    birthday: {
        nullMessage: '请选择出生日期'
    },
    IdCardNo1518: {
        reg: /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
        nullMessage: '请输入身份证号',
        errMessage: '请输入正确的身份证号'
    }
}
/**
 * @return reg
 * */
const regs = Object.keys(regMap)
    .map(regName => ({ [regName]: regMap[regName].reg }))
    .reduce((reg1, reg2) => ({ ...reg1, ...reg2 }));

/**
 * @param regName, value
 * @return null err return errMessage, else return null
 * */
const handleVerification = (...rest) => {
    const [regName, str] = rest;
    if (rest.length < 2) {
        console.error(`请传入校验规则名称和校验值`)
        return null;
    };
    if (!regMap[regName]) {
        console.error(`未添加${regName}的校验规则`)
        return null;
    }
    return str ? regMap[regName].errMessage ? regMap[regName].reg.test(str) ? null : regMap[regName].errMessage : null : regMap[regName].nullMessage
}

/**
 * @param {regName:value...}
 * @return if err return first errMessage, else return null
 * */
const handleVerifications = (regs) => {
    for (const regName in regs) {
        if (handleVerification(regName, regs[regName])) {
            return handleVerification(regName, regs[regName]);
        }
    }
    return null;
}

export default {
    ...regs,
    regMap,
    handleVerification,
    handleVerifications
}
