/**
 * title: 家庭保险方案定制服务
 */
/**
* v2.0上线活动地址迁移 /active/customized/$id
*/
import React, { Component } from 'react';
import { history } from 'umi';

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        // 活动地址迁移
        const { match: { params: { id: code } }, location: { search } } = this.props;
        history.replace(`/active/customized/${code}${search}`)
    }

    render() {
        return (
            <div>
                {/* {Utils.isWeiXin() ? <AbaoUser {...this.props} /> : <UnAbaoUser {...this.props} />} */}
            </div>
        );
    }
}

export default Index;
