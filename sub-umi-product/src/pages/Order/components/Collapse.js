import React, { Component } from 'react';
import styles from '../assets/common.less';

class Collapse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: !!props.defaultActive
    };
  }
  render() {
    const { title, children } = this.props;
    const { active } = this.state;
    return (
      <div className={styles.collapseCard}>
        <div className={styles.header}>
          <span>{title}</span>
          <img
            style={{ transform: `rotate(${active ? 180 : 0}deg)` }}
            className={styles.arrow}
            src={require('../assets/images/arrow.png')}
            onClick={() => this.setState({ active: !active })}
          />
        </div>
        {active && <div className={styles.content}>
          <div className={styles.borderTop}></div>
          {children}
        </div>}
      </div>
    );
  }
}

export default Collapse;