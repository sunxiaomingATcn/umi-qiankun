import React, {Component} from 'react';
import styles from './input.scss';

class Job extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstIndex: '',
            secondIndex: ''
        };
    }

    changeFirstIndex = (key) => {
        if (key !== this.state.firstIndex) {
            this.setState({
                firstIndex: key,
                secondIndex: key
            })
        } else {
            this.setState({
                firstIndex: '',
                secondIndex: ''
            })
        }

    };

    changeSecondIndex = (key) => {
        if (key !== this.state.secondIndex) {
            this.setState({
                secondIndex: key
            })
        } else {
            this.setState({
                secondIndex: ''
            })
        }
    };

    render() {
        const {jobs} = this.props;
        const {firstIndex, secondIndex} = this.state;
        return (
            <ul className={styles.job_container}>
                {
                    jobs.map(item => {
                        return <li key={item.value} className={styles.job_item}>
                            <h3 className={styles.first_ele_title} onClick={() => this.changeFirstIndex(item.value)}>
                                {item.label}
                            </h3>
                            {
                                item.children && item.children.length > 0 &&
                                <div>
                                    {item.children.map(ele => {
                                        return <div key={ele.value}>
                                            <div style={{padding: '0 0.4rem', background: '#ffffff'}}>
                                                <p className={[styles.second_ele_title, item.value == firstIndex ? styles.active : ''].join(' ')}
                                                   onClick={() => this.changeSecondIndex(ele.value)}>{ele.label}</p>
                                            </div>
                                            <ul>
                                                {ele.children.map(a => {
                                                    return <li key={a.value}
                                                               onClick={this.props.jobClick ? () => this.props.jobClick([item.value, ele.value, a.value], a.label, a.level) : null}
                                                               className={[styles.third_item, ele.value == secondIndex ? styles.active : ''].join(' ')}>
                                                        <div className={styles.level_title}>{a.label}</div>
                                                        <div
                                                            className={styles.level}>{a.illRiskValue + '类'}</div>
                                                    </li>
                                                })}
                                            </ul>
                                        </div>
                                    })
                                    }
                                </div>
                            }
                        </li>
                    })
                }
            </ul>
        )
    }

}


export default Job;
