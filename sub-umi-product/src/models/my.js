import * as requestMethod from '@/services/my';
import { Toast } from 'antd-mobile';

export default {
  namespace: 'my',
  state: {
    insured: null,
  },
  effects: {
    *submitSuggestion({ payload }, { call, put }) {
      const response = yield call(requestMethod.submitSuggestion, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *entry_statistic({ payload }, { call, put }) {
      const response = yield call(requestMethod.entry_statistic, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *team_relation({ payload }, { call, put }) {
      const response = yield call(requestMethod.team_relation, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *teamRankList({ payload }, { call, put }) {
      const response = yield call(requestMethod.teamRankList, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *carTeamRankList({ payload }, { call, put }) {
      const response = yield call(requestMethod.carTeamRankList, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *orderList({ payload }, { call, put }) {
      const response = yield call(requestMethod.orderList, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *updateImage({ payload }, { call, put }) {
      const response = yield call(requestMethod.updateImage, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *changeMobile({ payload }, { call, put }) {
      const response = yield call(requestMethod.changeMobile, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *beforeCheck({ payload }, { call, put }) {
      const response = yield call(requestMethod.beforeCheck, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *inviteFriend({ payload }, { call, put }) {
      const response = yield call(requestMethod.inviteFriend, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *tenants({ payload }, { call, put }) {
      const response = yield call(requestMethod.tenants, payload);
      if (response && response.code === 200) {
      } else {
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
    *carPersonal({ payload }, { call, put }) {
      const response = yield call(requestMethod.carPersonal, payload);
      if (response && response.code === 200) {
      } else if (response && response.code === 400) {
        
      }else{
        Toast.fail(`${response.msg}`);
      }
      return response;
    },
  },
  reducers: {
    GetInsuredData(state, action) {
      return {
        ...state,
        insured: action.payload,
      };
    },
    saveSubmitInsured(state, action) {
      return {
        ...state,
        insured: action.payload,
      };
    },
  },
};
