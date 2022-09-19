import { Fragment } from 'react';
import Page from './page';
import Utils from '@/utils/utils';

function PosterLayout(props) {

    const { location: { pathname } } = props;
    const posterId = pathname.split("/").pop();
    if (Page[posterId] && Page[posterId].hmCode) Utils.baiduHmSetAccount(Page[posterId].hmCode);

    return (
        <Fragment>
            {props.children}
        </Fragment>
    );
}

export default PosterLayout;
