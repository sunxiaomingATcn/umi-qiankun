import { Fragment } from 'react';
import Utils from '@/utils/utils';

function ActiveLayout(props) {
    Utils.baiduHmSetAccount("ebb75c5a807c6e47aaf637febaa937c1")
    return (
        <Fragment>
            {props.children}
        </Fragment>
    );
}

export default ActiveLayout;
