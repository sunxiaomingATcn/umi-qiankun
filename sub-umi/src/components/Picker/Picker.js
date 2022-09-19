import React from "react"
import styles from '../radioButton/RadioButton.scss';
import {Picker} from "antd-mobile";


const CustomChildren = props => (
    <div
        onClick={props.onClick}
    >
        <div className={styles.radio_button}>
            <div >{props.extra}</div>
        </div>
    </div>
);


class ButtonPicker extends React.Component {
    constructor(props){
        super(props);
        this.state={...props,sValue:this.props.defaultValue};
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if (prevState.checked !== nextProps.checked) {
            return {
                ...nextProps
            };
        }
        return null;
    };

    onChange = (e) =>{
       const {onClick}= this.props;
        onClick && onClick(e[0]);
        this.setState({ sValue: e });
    };

    forMater=()=>{

       const {item} =  this.props;
       console.log(item);
       const options = [];
       item.forEach(ele=>{
           if(ele.value){
               options.push(
                   {
                       label: ele.unit? ele.value+ele.unit.name: ele.value,
                       value: ele.unit? ele.value+ele.unit.name: ele.value,
                   },
               )
           }else {
               options.push(
                   {
                       label: ele,
                       value: ele,
                   },
               )
           }

       });
        return [options];
    };

    render() {
        const { style ,checked ,className,title} = this.state;
        return (
            <React.Fragment>
                <div  className={`${styles.radio_button_wrapper}  ${checked ? styles.radio_button_wrapper_checked : '' }  ${className}`}
                     style={style}
                      >
                    <Picker
                        data={ this.forMater()}
                        title={title?title:'请选择'}
                        cascade={false}
                        extra="更多"
                        value={checked ? this.state.sValue : [] }
                        onChange={(e) => this.onChange(e) }
                        onOk={v => this.setState({ sValue: v })}
                    >
                        <CustomChildren />
                    </Picker>
                </div>

            </React.Fragment>
        );
    }
}


export default ButtonPicker;
