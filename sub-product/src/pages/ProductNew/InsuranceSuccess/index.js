/**
 * title: 投保成功
 */
import React, { Component, Fragment } from 'react';
import Utils from '@/utils/utils';
import Wechat from './wechat'
import UnWechat from './unwechat'

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    componentDidMount() {
        this.setState({
            flag:Utils.isWeiXin()
        })
    }

    render() {
        console.log(this.state.flag)
        return (
            <div>
               {
                this.state.flag?<Wechat {...this.props}/>:<UnWechat {...this.props}/>
               }
            </div>
        );
    }
}

export default Index;
