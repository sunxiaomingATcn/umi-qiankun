/**
 * /active/made layout组件 用于 bd hm
*/
import { Fragment } from 'react';
import Utils from '@/utils/utils';

function ActiveLayout(props) {
    // 家庭定制百度统计
    // Utils.baiduHmSetAccount("6ea07dd13a37abafb68b40d8a628881f")

    return (
        <Fragment>
            {props.children}
        </Fragment>
    );
}

export default ActiveLayout;
