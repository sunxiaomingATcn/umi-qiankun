import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'antd-mobile';
import styles from './index.less';
/**
 * 长按操作 点击弹出confirm
 * @props
 * open: 是否开启, 默认true
 * onPress
 * onOk
 * 
*/
class LongPress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
  }

  componentDidMount() {
    console.log("LongPress")
  }

  onTouchStart = () => {
    this.timeOutEvent = setTimeout(() => {
      this.timeOutEvent = 0;
      const { open = true, onPress } = this.props;
      console.log('你长按了');
      open && this.showAction();
      onPress && onPress()
    }, 500);
  }

  showAction = () => {
    const { actionText } = this.props;
    const c_id = `long-press-delete-${new Date().getTime()}`;
    ReactDOM.render(<div className={styles.deleteContainer}>
      <div
        className={[styles.deleteContent, 'long-press-delete'].join(" ")}
        onClick={this.removeAction}
        id={c_id}
      >
        <div
          className={styles.deleteBtn}
          onClick={e => this.onActionClick(e)}
        >
          {actionText}
        </div>
      </div>
    </div>, this.longPressContainer)
  }

  removeAction = () => {
    this.longPressContainer && ReactDOM.render(null, this.longPressContainer)
  }

  onTouchMove = () => {
    clearTimeout(this.timeOutEvent);
    this.timeOutEvent = 0;
  }

  onTouchEnd = (e) => {
    const { onClick } = this.props;
    clearTimeout(this.timeOutEvent);
    if (this.timeOutEvent != 0) {
      console.log('你点击了');
      onClick && onClick();
    }
    return false;
  }

  // 点击行为(删除)按钮confirm
  onActionClick = async (e) => {
    e.stopPropagation();
    this.setState({ modalVisible: true })
  }

  // confirm ok
  onOk = () => {
    const { onOk } = this.props;
    this.setState({ modalVisible: false });
    this.removeAction();
    onOk && onOk()
  }

  // conform cancel
  onCancel = () => {
    this.setState({ modalVisible: false });
    this.removeAction();
  }

  render() {
    const { modalVisible } = this.state;
    const { title = '确定删除当前订单？' } = this.props;
    return (<div onClick={e => e.stopPropagation()}>
      <Modal
        visible={modalVisible}
        transparent
        className={styles.modalContainer}
      >
        <div className={styles.modal}>
          <div className={styles.modalContentHeader}>{title}</div>
          <div className={styles.modalContentButtons}>
            <div onClick={this.onCancel}>否</div>
            <div onClick={this.onOk}>是</div>
          </div>
        </div>
      </Modal>
      <div className={styles.longPressContainer}>
        <div onTouchStart={this.onTouchStart}
          onTouchMove={this.onTouchMove}
          onTouchEnd={this.onTouchEnd}
          style={this.props.style}>
          {this.props.children}
        </div>
        <div ref={(ref) => { this.longPressContainer = ref }}></div>
      </div>
    </div>
    );
  }
}

export default LongPress;