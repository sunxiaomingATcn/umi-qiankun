import * as requestMethod from "@/services/carOrder";
import { Toast } from 'antd-mobile';
import { getCustomerToken } from '@/utils/tool/customer';

export default {
  namespace: 'carOrder',
  state: {
    purchaseData: {},
    detail: {}
  },
  effects: {
    * queryList({ payload }, { call, put }) {
      const response = yield call(requestMethod.queryList, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'saveUniversally',
          payload: { purchaseData: response.data }
        });
      } else {
        Toast.fail(response ? `${response.msg}` : '请求失败');
      }
      return response;
    },
    * queryDetail({ payload, role = 'customer', toast = true }, { call, put }) {
      yield put({
        type: 'saveUniversally',
        payload: { detail: {} }
      });
      // 订单详情 role:customer 客户权限; role:agent 代理人权限
      // 客户token
      const token = getCustomerToken();
      if (role === 'customer' && token) payload['blade-auth'] = token;
      const response = yield call(requestMethod.queryDetail, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'saveUniversally',
          payload: { detail: response.data }
        });
        toast && Toast.hide();
        return response;
      } else {
        Toast.fail(`${response.msg}`);
      }
    },
    *closeOrder({ payload }, { call, put }) {
      const response = yield call(requestMethod.closeOrder, payload);
      if (response && response.code !== 200) {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *removeOrder({ payload }, { call, put }) {
      const response = yield call(requestMethod.removeOrder, payload);
      if (response && response.code !== 200) {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *getPayMethods({ payload }, { call, put }) {
      const response = yield call(requestMethod.getPayMethods, payload);
      if (response && response.code !== 200) {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *getPayQRcode({ payload }, { call, put }) {
      const response = yield call(requestMethod.getPayQRcode, payload);
      if (response && response.code !== 200) {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *getPayStatus({ payload }, { call, put }) {
      const response = yield call(requestMethod.getPayStatus, payload);
      if (response && response.code !== 200) {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *sendCode({ payload }, { call, put }) {
      const response = yield call(requestMethod.sendCode, payload);
      if (response && response.code === 200) {
        Toast.success(`${response.msg || '发送成功'}`);
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *validCode({ payload }, { call, put }) {
      const response = yield call(requestMethod.validCode, payload);
      if (response && response.code !== 200) {
        Toast.fail(`${response.msg}`);
      } else {
      }
      return response;
    },
    *getElectronic({ payload }, { call, put }) {
      const response = yield call(requestMethod.getElectronic, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'saveUniversally',
          payload: { electronic: response.data }
        });
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    * queryPolicyDetail({ payload }, { call, put }) {
      const response = yield call(requestMethod.queryPolicyDetail, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'saveUniversally',
          payload: { policyDetail: response.data }
        });
        return response;
      } else {
        Toast.fail(`${response.msg}`);
      }
    },
  },
  reducers: {
    saveUniversally(state, { payload }) {
      console.log("payload", payload)
      return {
        ...state,
        ...payload
      };
    },
  }
};
