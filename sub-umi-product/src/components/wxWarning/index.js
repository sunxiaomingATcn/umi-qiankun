import React, { Component } from 'react';
const desStyle = {
    fontSize: '0.3rem',
    fontFamily: 'PingFangSC-Regular,PingFang SC',
    fontWeight: 400,
    color: 'rgba(25,28,32,1)',
    lineHeight: '0.48rem',
    textAlign:'center'
}
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div style={{ paddingTop: '1.2rem',background:'#fff',height:"100vh" }}>
                <img style={{ display: 'block', width: '1.6rem', margin: '0 auto .4rem' }} src={require("@/assets/png/warning.png")} />
                <p style={desStyle}>请在微信客户端打开链接</p>
            </div>
        );
    }
}

export default index;