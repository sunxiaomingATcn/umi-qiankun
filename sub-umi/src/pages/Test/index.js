/**
 * title: 代理人
 */

import React, { Component } from 'react';
import ImagePicker from '@/components/IDImageUpload';
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (<>
      <ImagePicker onChange={(base64) => { this.setState({ base641: base64 }) }} />
      <ImagePicker type="idReverseSide" onChange={(base64) => { this.setState({ base642: base64 }) }} />
      <img src={this.state.base641} style={{ width: 100 }} />
      <img src={this.state.base642} style={{ width: 100 }} />

    </>
    );
  }
}

export default index;