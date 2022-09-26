import React, { Component } from 'react';
import WxSDK from "@/utils/wx-sdk";
import styles from './index.less';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    new WxSDK().hideAllNonBaseMenuItem();
  }

  componentWillUnmount() {
  }

  protectItemAmount = (item) => {
    const { location: { query: { id, basicRestrictGene } } } = this.props;
    const restrictGenes = JSON.parse(sessionStorage.getItem(`ppb_restrictGenes`));
    const basicInsurance = restrictGenes.filter((item) => item.id == basicRestrictGene)[0];
    // console.log(26, basicRestrictGene, item, restrictGenes, basicInsurance)
    let basicValue = item.basicValue;
    if (item.valueType.value === 1 && restrictGenes) {
      const value = basicInsurance ? basicInsurance.defaultValue : '';
      const num = parseInt(value);
      basicValue = value.replace(num, (num * basicValue / 100).toString());
    }
    if (item.valueType.value === 3 && restrictGenes) {
      const value = basicInsurance ? basicInsurance.defaultValue : '';
      const valueMap = item.restrictGeneValue && item.restrictGeneValue.find(i => i.name === value) || {};
      basicValue = valueMap.value;
    }
    return basicValue;
  };

  renderProtectItems = () => {
    const productProtect = JSON.parse(sessionStorage.getItem(`ppb_productProtect`) || '{}');
    const { productProtectItems = [] } = productProtect;
    return productProtectItems.map(protectItem => (
      <div className={styles.item}>
        <p className={styles.item_header}><span>{protectItem.name}</span><span>{this.protectItemAmount(protectItem)}</span></p>
        <div dangerouslySetInnerHTML={{ __html: protectItem.content }}></div>
      </div>
    ))
  }
  render() {
    return (
      <div className={styles.protectItems}>{this.renderProtectItems()}</div>
    );
  }
}

export default index;