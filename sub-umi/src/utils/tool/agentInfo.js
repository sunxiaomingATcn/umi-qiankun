// 默认导出获取代理人id方法
const getUserWorkId = () => {
  const agent = getAgentInfo();
  return agent.userId || '';
}
export default getUserWorkId;

// 获取代理人信息
export const getAgentInfo = () => {
  return JSON.parse(localStorage.getItem("loginData") || "{}");
}

// 代理人产品列表打开产品详情
export const getProductLink = (dispatch, productId, channelType='') => {
  if (channelType === 4) {
    // 预售
    return Promise.reject('presale');
  } else {
    // 本地获取代理人用户信息
    const userWorkId = getUserWorkId();
    const { tenantId } = getAgentInfo();
    return dispatch({
      type: 'home/jumpLink',
      payload: {
        id: productId,
        userWorkId,
        tenant: tenantId
      }
    }).then(payload => {
      if (payload && payload.url) {
        window.location.href = payload.url;
      }
    })
  }
}