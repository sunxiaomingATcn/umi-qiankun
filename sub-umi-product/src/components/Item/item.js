import React from 'react';
import PropTypes from 'prop-types';
import styles from './item.scss';


const Item = props => {
    const {onClick, extra, children, extraDom, domStyle,description, annotation} = props;
    console.log(extraDom,123)
    return (
        <div
            onClick={onClick}
            className={styles.item_warpper}
        >
            <div className={styles.item}>
                <div className={styles.item_children}>{children}</div>
                {extra && <div className={[styles.item_extra,styles.extra_detail].join(' ')}>{extra}</div>}
                {extraDom &&
                <div className={[styles.item_extra, styles.extraDom].join(' ')} style={domStyle}>{extraDom}</div>}
            </div>
            {description&&<div className={styles.item_description}><span>注：</span><span>{description}</span></div>}
            {annotation && <div className={styles.item_annotation}><span>{annotation}</span></div>}
        </div>
    )
};

Item.propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    extraDom: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default Item
