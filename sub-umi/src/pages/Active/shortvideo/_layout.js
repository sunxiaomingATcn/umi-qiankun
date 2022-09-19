import { Fragment } from 'react';
import Utils from '@/utils/utils';

function Index(props) {
    Utils.baiduHmSetAccount("0e0f3c418a8e09054c2d519fe27d432d");
    return (
        <Fragment>
            {props.children}
        </Fragment>
    );
}

export default Index;
