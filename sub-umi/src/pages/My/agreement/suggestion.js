/**
 * title: 意见反馈
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Toast, ActivityIndicator, Button } from 'antd-mobile';
import styles from './suggestion.scss';
import { history } from 'umi';
import { Fragment } from 'react';

@connect(({ my }) => ({
  my,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 200,
      suggestionValue: '',
    };
  }

  componentDidMount() {}

  suggestionChange(value) {
    if (value && value.length >= 200) {
      this.setState({
        suggestionValue: value.slice(0, 200),
        count: 0,
      });
    } else {
      this.setState({
        suggestionValue: value,
        count: 200 - value.length,
      });
    }
  }

  submit() {
    const { suggestionValue } = this.state;
    const { dispatch } = this.props;
    if (!suggestionValue) {
      Toast.fail('请输入内容');
      return;
    }
    dispatch({
      type: 'my/submitSuggestion',
      payload: {
        feedbackContent: suggestionValue,
      },
    }).then(res => {
      if (res && res.code == 200) {
        Toast.success('提交成功');
        history.goBack();
      }
    });
  }

  render() {
    const { count, suggestionValue } = this.state;
    return (
      <Fragment>
        <div style={{ width: '100%', height: '0.16rem', background: '#f4f5f7' }}></div>
        <div className={styles.suggestion}>
          <div className={styles.title}>您的话，我们会用心聆听</div>
          <textarea
            onChange={e => {
              this.suggestionChange(e.target.value);
            }}
            autoFocus={true}
            // onKeyPress={(e) => {
            //   console.log(e);
            // }}
            value={suggestionValue}
            placeholder="请输入您的反馈意见。"
          />
          <div className={styles.line}></div>
          <div className={styles.count}>还可以输入{count}字</div>
          <Button
            onClick={() => {
              this.submit();
            }}
            style={{
              marginTop: '15px',
              background: '#0065ff',
              color:'#fff'
            }}
          >
            提交
          </Button>
        </div>
      </Fragment>
    );
  }
}

export default Index;
// <form target="frameFile" action="#" style={{ position: 'relative' }}>
//           <input
//             onChange={e => {
//               this.suggestionChange(e.target.value);
//             }}
//             type="search"
//             id="male"
//           />
//           <iframe name="frameFile" style={{ display: 'none' }}></iframe>
//         </form>
