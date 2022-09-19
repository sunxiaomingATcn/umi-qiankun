
// 存储客户权限
export const setCustomerToken = (token = '') => {
  localStorage.setItem("customer-blade-auth", token)
}

// 获取客户token
export const getCustomerToken = (token) => {
  return localStorage.getItem("customer-blade-auth", token)
}