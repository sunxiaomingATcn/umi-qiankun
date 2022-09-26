// 详情 object translation namestring
export const renderIdentityVO = (identityVO = {}) => {
    return <span>{identityVO.name}，{identityVO.value}</span>
}

export const renderSafeguardPeriodVO = (safeguardPeriodVO = {}) => {
    return <span>{safeguardPeriodVO.name}</span>
}

export const renderPaymentPeriodVO = (paymentPeriodVO = {}) => {
    return (paymentPeriodVO.type === 'BY_ONE_TIME' || (paymentPeriodVO.desc && paymentPeriodVO.desc.includes("*"))) ?
        paymentPeriodVO.name : `${paymentPeriodVO.desc},${paymentPeriodVO.name}`
}