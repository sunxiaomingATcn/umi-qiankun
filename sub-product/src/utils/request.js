import fetch from 'dva/fetch';
import { Toast } from 'antd-mobile-v5';
import { Toast as ToastOld } from 'antd-mobile';
import { history } from 'umi';
import hash from 'hash.js';
import { Base64 } from 'js-base64';
import { clientId, clientSecret } from '../defaultSettings';
import PPBLoading from '@/components/Loading/loading.js';

const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};

let isRefreshing = false;
let subscribers = [];
const GET_TOKEN_URL = "/blade-auth/login";
/**
  * 把请求的token 失效的函数放到 subscribers
  * @param callback 请求的token 失效的函数
  */
 function addSubscriber(callback) {
    subscribers.push(callback);
  }

  /**
    * 重新执行token 失效的函数
    */
  function onAccessTokenFetched() {
    subscribers.forEach((callback) => {
      callback();
    });
    subscribers = [];
  }

  function getRefreshToken(){
    let loginDataStr = localStorage.getItem('loginData');
    if(!loginDataStr)return ''
    return JSON.parse(loginDataStr).refreshToken;
  }


  function setToken(newToken,newRefreshToken,newTokenType){
    let loginDataStr = localStorage.getItem('loginData');
    let loginData = {};
    if(loginDataStr){
        loginData = JSON.parse(loginDataStr);
    }
    loginData.accessToken = newToken;
    loginData.refreshToken = newRefreshToken;
    loginData.tokenType = newTokenType;
    localStorage.setItem('loginData',JSON.stringify(loginData));
  }

  /**
    * 刷新token
    * @returns {Promise<Response | never>}
    */
  function flushToken() {
    const formData = new FormData();
    formData.append("loginType", "refresh_token")
    formData.append('refreshToken', getRefreshToken())
    return fetch(GET_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        // 'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Basic ${Base64.encode(`${clientId}:${clientSecret}`)}`
      },
      body: formData
    })
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }else{
          PPBLoading.hide();
          isRefreshing = false;
          // history.push('PublicLogin')
          Toast.show('刷新token失效');
          return new Promise((resolve, reject) => {
            reject(`刷新token失败:${response.status}`)
          });
        }
      })
      .then(json => {
        const { success } = json;
        if (success) {
          return json;
        } else {
          PPBLoading.hide();
          isRefreshing = false;
          // history.push('/PublicLogin')
          Toast.show('刷新token失效');
          return new Promise((resolve, reject) => {
            reject(`刷新token失败:${json.message}`)
          });
        }
      })
      .then(json => {
        const { data: { refreshToken, tokenType, accessToken } } = json;
        setToken(accessToken,refreshToken,tokenType);
        onAccessTokenFetched();
        isRefreshing = false;
      })
  }


const checkStatus = (response, url, options) => {
    let refreshToken = getRefreshToken();
    if (response.status === 401 && refreshToken) {

      let p = new Promise((resolve) => {
        addSubscriber(() => {
          resolve(request(url, options))
        });
      });
      if (!isRefreshing) {
        isRefreshing = true;
        flushToken()
          .catch(error => {
            console.log(error);
          });
      }
      return p;
    }

    if (response.status >= 200 && response.status < 300 || response.status === 400) {
        return response;
    }

    const errortext = codeMessage[response.status] || response.statusText;
    // Toast.show(`请求错误 ${response.status}: ${response.url},${errortext}`);
    ToastOld.hide();
    Toast.show('服务异常，请稍后再试');
    const error = new Error(errortext);
    error.name = response.status;
    error.response = response;
    throw error;

};

const cachedSave = (response, hashcode) => {
    /**
     * Clone a response data and store it in sessionStorage
     * Does not support data other than json, Cache only json
     */
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.match(/application\/json/i)) {
        // All data is saved as text
        response
            .clone()
            .text()
            .then(content => {
                sessionStorage.setItem(hashcode, content);
                sessionStorage.setItem(`${hashcode}:timestamp`, Date.now());
            });
    }
    return response;
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, option) {
    const options = {
        expirys: false,
        ...option,
    };
    /**
     * Produce fingerprints based on url and parameters
     * Maybe url has the same parameters
     */
    const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');
    const hashcode = hash
        .sha256()
        .update(fingerprint)
        .digest('hex');




    const defaultOptions = {
        // credentials: 'include',
        headers: {
            Authorization: `Basic ${Base64.encode(`${clientId}:${clientSecret}`)}`,
        }
    };
    const newOptions = { ...defaultOptions, ...options };

    const loginDataStr = localStorage.getItem('loginData');
    let token = '';
    if(loginDataStr){
        const loginData = JSON.parse(loginDataStr);
        token = `${loginData.tokenType} ${loginData.accessToken}`;
        newOptions.headers['Blade-Auth'] = token;
    }
    console.log(newOptions.headers,1)
    if (
        newOptions.method === 'POST' ||
        newOptions.method === 'PUT' ||
        newOptions.method === 'DELETE'
    ) {
        if (!(newOptions.body instanceof FormData)) {
            newOptions.headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                ...newOptions.headers,
            };
            if(typeof(newOptions.body) !== 'string'){
              newOptions.body = JSON.stringify(newOptions.body);
            }
        } else {
            // newOptions.body is FormData
            newOptions.headers = {
                Accept: 'application/json',
                ...newOptions.headers
            };
            console.log(newOptions.headers,2)
        }
    } else if (newOptions.method === 'fileUpload') {
        newOptions.method = 'POST';
        const dataParament = newOptions.body;
        const keyName = newOptions.keyName;
        console.log("dataParament ==", dataParament)//你可以在这里查看你要传的文件对象
        let fileData = new FormData();
        if (newOptions.body.length) {
            // 这里可以包装多文件
            for (let i = 0; i < dataParament.length; i++) {
                fileData.append(keyName, dataParament[i].originFileObj)
            }
        }
        dataParament.forEach((item, index) => {
            if (item !== 'files' && dataParament[item]) {
                // 除了文件之外的 其他参数 用这个循环加到fileData中
                fileData.append(index, dataParament[item])
            }
        });
        newOptions.body = fileData
    }

    const expirys = options.expirys && 60;
    // options.expirys !== false, return the cache,
    if (options.expirys !== false) {
        const cached = sessionStorage.getItem(hashcode);
        const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
        if (cached !== null && whenCached !== null) {
            const age = (Date.now() - whenCached) / 1000;
            if (age < expirys) {
                const response = new Response(new Blob([cached]));
                return response.json();
            }
            sessionStorage.removeItem(hashcode);
            sessionStorage.removeItem(`${hashcode}:timestamp`);
        }
    }
    return fetch(url, newOptions)
        .then((response) => {
          return checkStatus(response, url, newOptions);
        })
        // .then(response => cachedSave(response, hashcode))
        .then(response => {
          if (options.responseType === 'blob') {
            if (response && response.status === 200) {
              return response.blob()
            }
            if (response && response.status === 400){
              return response.json()
            }
              const errortext = codeMessage[response.status] || response.statusText;
              const error = new Error(errortext);
              error.name = response.status;
              throw error;
          }

          if(typeof(response.json) === 'function'){
            return response.json()
          }
          return response
        })
        .catch(e => {

            const { name: status, response } = e;
            // if(status === 422){
            //     message.error(`有产品不能删除`);
            //     location.href = response.headers.get('Location');
            //     return ;
            // }
            // environment should not be used
            // if (status === 403) {
            //     history.push('/home');
            //     return;
            // }
            // if (status <= 504 && status > 500) {
            //     history.push('/home');
            //     return;
            // }
            if (status >= 404 && status < 422) {
                // history.push('/home');
            }
        });
}
