import React, { Component } from 'react';
import styles from "../assets/common.less";

class CheckTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeId: props.defaultActive
    };
  }

  onClick = ({ id }) => {
    const { onClick } = this.props;
    this.setState({ activeId: id })
    onClick && onClick(id)
  }

  render() {
    const { tags } = this.props;
    const { activeId } = this.state;
    return (
      <div className={styles.CheckTags}>
        {tags.map(tag =>
          <div
            onClick={() => this.onClick(tag)}
            className={[styles.checkTagItem, (tag.id == activeId) && styles.tagActive].join(' ')}
          >
            {tag.title}
          </div>)}
      </div>
    );
  }
}

export default CheckTags;