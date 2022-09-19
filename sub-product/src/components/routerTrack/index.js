import React, { Component, Fragment } from 'react';
import { history } from 'umi';
import { Prompt } from 'umi';
import { Toast } from 'antd-mobile';
import TrackBacks from '@/utils/trackBacks';
import PPBLoading from '@/components/Loading/loading.js';


function RouterChangePrompt({ id, resetuuid = false, autoStart = true, autoStop = false } = {}) {
  return function (WrappedComponent) {
    return class extends Component {
      state = {
        hasPrompt: true,
        _track: { id, resetuuid, autoStart, autoStop }
      }

      stops = [] // 回溯上传回调promise List

      componentDidMount() {
        const { _track: { autoStart, autoStop } } = this.state;
        autoStart && this.start();
        autoStop && this.autoStop();
      }

      componentWillUnmount() {
        // Toast.hide();
        PPBLoading.hide();
        clearTimeout(this.timer)
      }
      /**
       * 向子组件提供，可指定uuid
       * uuid :true, false, uuid
      */
      start = (uuid) => {
        const { _track } = this.state;
        _track && TrackBacks.chebaoyi.start(_track.id, uuid !== undefined ? uuid : _track.resetuuid)
      }

      /**
       * 上传可回溯
       * 该方法向子组件传递,供子组件跳转外链调用
       * loading 是否loading, 默认true
       * */
      stop = (loading = true) => {
        // loading && Toast.loading('Loading...', 0)
        loading && PPBLoading.show();
        const _promise = new Promise((resolve, reject) => {
          TrackBacks.chebaoyi.stop((response) => {
            response && response.code === 200 ? resolve(response) : reject(response && response.msg)
          })
        })
        this.stops.push(_promise);
        return _promise;
      }

      autoStop = () => {
        const { _track: { autoStop } } = this.state;
        this.timer = setTimeout(() => {
          this.stop(false);
          this.start(false);
          this.autoStop();
        }, autoStop * 1000)
      }

      /**
       * 路由劫持 回溯成功后跳转
      */
      beforeRouteEach = (location, action) => {
        this.stop(true);
        // 返回释放
        if (action === 'POP') return true;
        Promise.all(this.stops)
          .then(_responses => {
            console.log("TrackBacks Promise", _responses)
            this.setState({ hasPrompt: false })
            switch (action) {
              case 'PUSH':
                history.push({ ...location })
                break;
              case 'REPLACE':
                history.replace({ ...location })
                break;
            }
          })
          .catch((msg) => {
            Toast.fail(msg || '回溯失败')
          })
        return false;
      }

      render() {
        const { hasPrompt } = this.state;
        return (
          <Fragment>
            <Prompt
              when={hasPrompt}
              message={this.beforeRouteEach}
            />
            <WrappedComponent
              {...this.props}
              trackStart={this.start}
              trackStop={this.stop}
            />
          </Fragment>
        )
      }
    }
  }
}


export default RouterChangePrompt;
