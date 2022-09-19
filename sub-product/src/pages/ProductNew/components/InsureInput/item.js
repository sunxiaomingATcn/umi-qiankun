import React from 'react';
import PropTypes from 'prop-types';
import styles from './input.scss';


const Item = props => {
    const { onClick, extra, children, extraDom, errors, domStyle, extraDomClick, extraStyle, readonly } = props;
    return (
        <div
            className={styles.item_warpper}
        >
            <div className={styles.item} onClick={onClick}>
                <div className={styles.item_children} >{children}</div>
                {extra && <div className={styles.item_extra} style={extraStyle} >{extra}</div>}
                {extraDom && <div className={[styles.item_extra, styles.extraDom, readonly ? styles.readonly: ''].join(' ')} style={domStyle} onClick={extraDomClick ? (e) => extraDomClick(e) : null}>{extraDom}</div>}
            </div>
            <div className={styles.errors}>{(errors) ? errors.join(',') : null}</div>
        </div>
    )
};

Item.propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    extraDom: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default Item
