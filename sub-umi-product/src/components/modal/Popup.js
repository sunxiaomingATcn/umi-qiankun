import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import styles from './modal.scss';

class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Modal
      className={styles.modalPopup}
        {...this.props}
      >
        {this.props.children}
      </Modal>
    );
  }
}

export default Popup;