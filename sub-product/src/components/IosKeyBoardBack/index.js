/**
 * Higher-Order Components
 * 处理IOS键盘收起底部留白问题
 * */
import React, {Component} from 'react';

function KeyBoardScrollBack(WrappedComponent) {
    return class extends Component {
        componentDidMount() {
            // 失去焦点的时候当前位置滚动0.1px
            window.addEventListener('focusout', function () {
                // setTimeout 避免影响ios自带弹簧效果
                setTimeout(()=>{
                    window.scrollBy(0,0.1);
                },100)
            });
        }

        render() {
            return (
                <WrappedComponent {...this.props} />
            )
        }
    }
}

export default KeyBoardScrollBack;
