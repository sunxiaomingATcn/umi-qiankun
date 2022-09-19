import React, { Component } from 'react';
import { Modal, List, DatePicker, InputItem, Button } from 'antd-mobile';
import moment from 'moment';
import CheckTags from './CheckTags';
import styles from "../assets/common.less";


const getDateType = (typeName) => {
  const dateMapForType = {
    renewal_management: { name: '应收缴费时间', formKey: 'paymentDate' },
    completed: { name: '承保时间', formKey: 'acceptDate' },
    default: { name: '投保时间', formKey: 'insureDate' }
  }
  return dateMapForType[typeName] || dateMapForType.default;
}


class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInitValue: {}
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { initValue, type, statusItemName } = nextProps;
    if (initValue && JSON.stringify(initValue) !== JSON.stringify(prevState.searchInitValue)) {
      const searchInitValue = JSON.parse(JSON.stringify(initValue));
      const beginDateName = `${getDateType(type).formKey}Min`;
      const endDateName = `${getDateType(type).formKey}Max`;
      return {
        searchInitValue,
        ...searchInitValue,
        status: searchInitValue[statusItemName],
        beginDate: searchInitValue[beginDateName] ? new Date(searchInitValue[beginDateName]) : undefined,
        endDate: searchInitValue[endDateName] ? new Date(searchInitValue[endDateName]) : undefined
      }
    }
  }

  getTags = (typeName) => {
    const tagsMapForType = {
      completed: [
        { title: '已承保', id: '4' }
      ],
      invalid: [
        { title: '犹豫期内退保', id: '5' },
        { title: '犹豫期外退保', id: '6' },
        { title: '终止', id: '7' }
      ],
      renewal_management: [
        { title: '待续期', id: '1' },
        { title: '已续期', id: '2' },
        { title: '已过期', id: '3' }
      ],
      default: [
        { title: '核保中', id: '1' },
        { title: '核保未通过', id: '2' },
        { title: '待支付', id: '3' }
      ]
    }
    return tagsMapForType[typeName] || tagsMapForType.default;
  }


  onClose = () => { }

  render() {
    const { title, type, statusItemName = 'status', onCancel = () => { }, onSearch = () => { } } = this.props;
    const { searchInitValue, beginDate, endDate, status, proposalNo, policyNo, applicantName } = this.state;

    return (
      <Modal
        popup
        closable
        title={title}
        visible={true}
        onClose={onCancel}
        animationType="slide-up"
        afterClose={() => this.state = {}}
        className={styles.searchPopup}
      >
        <div className={styles.searchItem}>
          <h3>时间</h3>
          <h4>{getDateType(type).name}</h4>
          <div className={styles.dateRange}>
            <div className={styles.beginDate}>
              <DatePicker
                mode="date"
                title="请选择时间"
                extra={<span className={styles.placeholder}>请选择时间</span>}
                value={this.state.beginDate}
                onChange={beginDate => this.setState({ beginDate })}
              >
                <List.Item></List.Item>
              </DatePicker>
            </div>
            至
            <div className={styles.endDate}>
              <DatePicker
                mode="date"
                title="请选择时间"
                extra={<span className={styles.placeholder}>请选择时间</span>}
                value={this.state.endDate}
                onChange={endDate => this.setState({ endDate })}
              >
                <List.Item></List.Item>
              </DatePicker>
            </div>
          </div>
        </div>
        <div className={styles.searchItem}>
          <h3>状态</h3>
          <div>
            <CheckTags
              tags={this.getTags(type)}
              onClick={status => this.setState({ status })}
              defaultActive={searchInitValue[statusItemName]}
            />
          </div>
        </div>
        {type === 'pending' ?
          <div className={styles.searchItem}>
            <h3>投保单号</h3>
            <div className={styles.searchInput}><InputItem placeholder="请输入投保单号" value={this.state.proposalNo} onChange={proposalNo => this.setState({ proposalNo })} /></div>
          </div> :
          <div className={styles.searchItem}>
            <h3>保单号</h3>
            <div className={styles.searchInput}><InputItem placeholder="请输入保单号" value={this.state.policyNo} onChange={policyNo => this.setState({ policyNo })} /></div>
          </div>
          }
        <div className={styles.searchItem}>
          <h3>投保人姓名</h3>
          <div className={styles.searchInput}><InputItem placeholder="请输入投保人姓名" value={this.state.applicantName} onChange={applicantName => this.setState({ applicantName })} /></div>
        </div>
        <div className={styles.buttons}>
          <Button onClick={onCancel}>取 消</Button>
          <Button
            type="primary"
            onClick={() =>
              onSearch({
                [`${getDateType(type).formKey}Min`]: beginDate && moment(beginDate).format('YYYY-MM-DD'),
                [`${getDateType(type).formKey}Max`]: endDate && moment(endDate).format('YYYY-MM-DD'),
                [statusItemName]: status,
                proposalNo,
                policyNo,
                applicantName
              })}
          >确 定</Button>
        </div>
      </Modal>
    );
  }
}

export default Search;