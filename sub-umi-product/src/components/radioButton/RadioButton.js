import React from "react"
import PropTypes from "prop-types"
import styles from './RadioButton.scss';

class RadioButton extends React.Component {
    constructor(props){
        super(props);
        this.state={...props};
    }
        
    static getDerivedStateFromProps(nextProps, prevState){
        if (prevState.checked !== nextProps.checked) {
           return {
               ...nextProps
           };
        }
        return null;
    };


    render() {
        const { value, style ,checked ,className} = this.state;
        return (
            <React.Fragment>
                <label className={`${styles.radio_button_wrapper} ${checked ? styles.radio_button_wrapper_checked : '' } ${className}`}
                       style={style}
                       onClick={this.props.onClick}>
                    <span className={styles.radio_button}>
                        <input type="radio" className={styles.radio_button_input} value={value} />
                        <span className={styles.radio_button_inner} ></span>
                    </span>
                    {this.props.children}
                </label>
            </React.Fragment>
        );
    }
}

RadioButton.defaultProps = {
    name: '',
    value: 'large',
    text: '',
    checked: false
};

RadioButton.propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    text: PropTypes.string,
    checked: PropTypes.bool
};

export default RadioButton
