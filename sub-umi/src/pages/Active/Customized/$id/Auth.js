/**
 * title: 阿保保险
 */
import { Component } from 'react';
import Utils from '@/utils/utils';
import md5Map from './assets/md5Price';
import Authorize from '@/pages/Authorize'
class Index extends Component {
    componentDidMount() {
        const { match: { params: { id: activeId } } } = this.props;
        const activeParams = md5Map(activeId);
        Utils.collectBaiduHm(`1v1_v3.0_${activeParams.amount}_${activeParams.channel}_微信授权阻断页`, "open")
    }
    render() {
        return <Authorize {...this.props} />
    }
}

export default Index;
