import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem, Divider } from 'rc-menu';
import 'rc-dropdown/assets/index.css';
import React, { Component } from 'react';
class DropdownC extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() { }

  onSelect = (el) => {
    const { onMenuSelect } = this.props;
    if (onMenuSelect) {
      onMenuSelect(el.key);
    }
  }

  menu = () => {
    const { menuArr = [] } = this.props;
    return (
      <Menu onClick={this.onSelect}>
        {menuArr.map((item, index) => <MenuItem key={item}>{item}</MenuItem>)}
      </Menu>
    );
  };

  render() {
    const { children, trigger = [], visible = false } = this.props;
    return (
      <Dropdown
        trigger={[...trigger]}
        visible={visible}
        overlay={this.menu()}
        animation="slide-up"
      >
        {children}
      </Dropdown>
    );
  }
}

export default DropdownC;
