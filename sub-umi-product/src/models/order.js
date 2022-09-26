import * as requestMethod from "@/services/order";
import { Toast } from 'antd-mobile';
import { getCustomerToken } from '@/utils/tool/customer';
import ShareGuide from '@/components/ShareGuide';

export default {
  namespace: 'commonOrder',
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
        return response;
      } else {
        Toast.fail(`${response.msg}`);
      }
    },
    * queryRenewalList({ payload }, { call, put }) {
      const response = yield call(requestMethod.queryRenewalList, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'saveUniversally',
          payload: { purchaseData: response.data }
        });
        return response;
      } else {
        Toast.fail(`${response.msg}`);
      }
    },
    * clearOrderList({ payload }, { call, put }) {
      yield put({
        type: 'saveUniversally',
        payload: { purchaseData: {} }
      });
    },
    * queryDetail({ payload, role = 'customer', toast = true }, { call, put }) {
      yield put({
        type: 'saveUniversally',
        payload: { detail: {} }
      });
      // 订单详情 role:customer 客户权限; role:agent 代理人权限
      // 客户token
      const token = getCustomerToken();
      if (role === 'customer') payload['blade-auth'] = token;
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
    * queryPolicyDetail({ payload, role = 'customer', toast = true }, { call, put }) {
      yield put({
        type: 'saveUniversally',
        payload: { detail: {} }
      });
      // 订单详情 role:customer 客户权限; role:agent 代理人权限
      // 客户token
      const token = getCustomerToken();
      if (role === 'customer') payload['blade-auth'] = token;
      const response = yield call(requestMethod.queryPolicyDetail, payload);
      if (response && response.code === 0) {
        yield put({
          type: 'saveUniversally',
          payload: { detail: response.payload }
        });
        toast && Toast.hide();
        return response;
      } else {
        Toast.fail(`${response.msg}`);
      }
    },
    * queryOrderDetail({ payload, role = 'customer', toast = true }, { call, put }) {
      yield put({
        type: 'saveUniversally',
        payload: { detail: {} }
      });
      // 订单详情 role:customer 客户权限; role:agent 代理人权限
      // 客户token
      const token = getCustomerToken();
      if (role === 'customer') payload['blade-auth'] = token;
      const response = yield call(requestMethod.queryOrderDetail, payload);
      if (response && response.code === 0) {
        yield put({
          type: 'saveUniversally',
          payload: { detail: response.payload }
        });
        toast && Toast.hide();
        return response;
      } else {
        Toast.fail(`${response.msg}`);
      }
    },
    // 核保成功投保确认页面 & 待支付 => 拉起支付
    * getPaymentLink({ payload }, { call, put }) {
      const response = yield call(requestMethod.getPaymentLink, payload);
      if (response && response.code === 0) {
        Toast.hide();
        // window.location.href = response.payload;
        return response.payload;
      } else {
        Toast.fail(`${response.message}`);
      }
    },
    *queryRenewalDetail({ payload }, { call, put }) {
      yield put({
        type: 'saveUniversally',
        payload: { detail: {} }
      });
      const response = yield call(requestMethod.queryRenewalDetail, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'saveUniversally',
          payload: { detail: response.data }
        });
        return response;
      } else {
        Toast.fail(`${response.msg}`);
      }
    },
    // 代理人人身险保单详情
    *queryAgentPolicyDetail({ payload }, { call, put }) {
      const response = yield call(requestMethod.queryAgentPolicyDetail, { policyId: payload.id });
      if (response && response.code === 200) {
        yield put({
          type: 'saveUniversally',
          payload: { detail: response.data }
        });
        return response;
      } else {
        Toast.fail(`${response.msg}`);
      }
    },
    *removeOrder({ payload }, { call, put }) {
      const response = yield call(requestMethod.removeOrder, payload);
      if (response && response.code === 200) {
        return response;
      } else {
        Toast.fail(`${response.msg}`);
      }
    },
    *closeOrder({ payload }, { call, put }) {
      const response = yield call(requestMethod.closeOrder, payload);
      if (response && response.code === 200) {
        return response;
      } else {
        Toast.fail(`${response.msg}`);
      }
    },
  },
  reducers: {
    saveUniversally(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        // 关闭微信分享引导
        ShareGuide.close()
      });
    },
  },
};
