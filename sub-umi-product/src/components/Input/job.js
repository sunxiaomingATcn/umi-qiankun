import React, {Component} from 'react';
import PropTypes from 'prop-types';
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
                        return <li key={item.id} className={styles.job_item} >
                            <h3 className={styles.first_ele_title} onClick={() => this.changeFirstIndex(item.id)}>
                                {item.name}
                            </h3>
                            {
                                item.childProductInsuredJob.length > 0 &&
                                <div >
                                    {item.childProductInsuredJob.map(ele => {
                                        return <div key={ele.id} >
                                            <div style={{padding:'0 0.4rem',background:'#ffffff'}}>
                                                <p className={[styles.second_ele_title, item.id == firstIndex ? styles.active : ''].join(' ')}
                                                   onClick={() => this.changeSecondIndex(ele.id)}>{ele.name}</p>
                                            </div>
                                            <ul>
                                                {ele.childProductInsuredJob.map(a => {
                                                    return <li key={a.id}
                                                               onClick={this.props.jobClick ? () => this.props.jobClick([item.id, ele.id, a.id].join('-'), a.name, a.isInsure) : null}
                                                               className={[styles.third_item, ele.id == secondIndex ? styles.active : ''].join(' ')}>
                                                            <div className={styles.level_title}>{a.name}</div>
                                                        <div
                                                            className={styles.level}>{a.isInsure == '是' ? a.level + '类' : '拒保'}</div>
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

// Job.propTypes = {
//     children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
//     extraDom: PropTypes.element,
// }

export default Job;
