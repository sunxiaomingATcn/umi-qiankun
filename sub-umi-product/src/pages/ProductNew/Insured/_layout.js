import { Fragment } from 'react';


function ActiveLayout(props) {
    return (
        <Fragment>
            {props.children}
        </Fragment>
    );
}

export default ActiveLayout;
