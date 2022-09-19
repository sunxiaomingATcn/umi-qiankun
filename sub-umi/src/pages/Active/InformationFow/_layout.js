import { Fragment } from 'react';
import Utils from '@/utils/utils';

function Index(props) {
    Utils.baiduHmSetAccount("88889050c6fa634b2dedf171e359c901");
    return (
        <Fragment>
            {props.children}
        </Fragment>
    );
}

export default Index;
