import React, { Component } from 'react';
import request from '@/utils/request';
import utils from '@/utils/utils';
import { getCustomerToken } from '@/utils/tool/customer';
class FileList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const { files } = nextProps;
    return {
      files: files ? Array.isArray(files) ? files : files.startsWith('[') ? JSON.parse(files) : [] : []
    }
  }

  downLoadOss = async ({ osskey }) => {
    const { customer } = this.props;
    const res = await request(`/blade-resource/oss/endpoint/file-link?fileName=${osskey}${customer ? `&blade-auth=${getCustomerToken()}` : ''}`)
    if (res && res.data) {
      if (utils.isIOS()) {
        window.location.href = res.data
      } else {
        window.open(res.data)
      }
    }
  }

  render() {
    const { files } = this.state;
    const { children } = this.props;
    return (files.map(file => (
      file.osskey ? <a style={{ wordBreak: 'keep-all' }} onClick={() => { this.downLoadOss(file) }}>
        <span>{children}</span>
      </a> : null
    ))
    );
  }
}

export default FileList;

FileList.getLink = async (osskey) => {
  const res = await request(`/blade-resource/oss/endpoint/file-link?fileName=${osskey}`);
  return res && res.data;
}

FileList.downLoadOss = async ({ osskey }) => {
  const res = await request(`/blade-resource/oss/endpoint/file-link?fileName=${osskey}`)
  if (res && res.data) {
    if (utils.isIOS()) {
      window.location.href = res.data
    } else {
      window.open(res.data)
    }
  }
}