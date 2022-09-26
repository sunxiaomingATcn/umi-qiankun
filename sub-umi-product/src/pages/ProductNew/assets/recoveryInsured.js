/**
 * 恢复投保表单填写
 * */
export default function (flag) {
  const { form: { setFieldsValue, getFieldsValue } } = this.props;
  const { productId } = this.state.insuredTemplate || {};
  if (!productId) return;
  let value = JSON.parse(localStorage.getItem(`${productId}_productDate`))
  if (flag) {
    // 恢复报价
    this.getInsuredQuotation();
    let insurantTypeValue = localStorage.getItem(`${productId}_defaultValue_insurantType`)
    let ele = this.state["insurantType"];
    if (ele) ele.defaultValue = insurantTypeValue ? Number(insurantTypeValue) : ele.defaultValue
    let beneficiaryTypeValue = localStorage.getItem(`${productId}_defaultValue_beneficiaryType`)
    let item = this.state["beneficiaryType"];
    if(item)
    item.defaultValue = beneficiaryTypeValue ? Number(beneficiaryTypeValue) : item&&item.defaultValue
    let newBeneficiaryList = JSON.parse(localStorage.getItem(`${localStorage.getItem('product_id')}_newBeneficiaryList`))
    newBeneficiaryList = newBeneficiaryList ? newBeneficiaryList : this.state.beneficiaryList
    let applicantInfoPassport = localStorage.getItem(`${productId}_applicantInfoPassport`)
    let insurantInfoPassport = localStorage.getItem(`${productId}_insurantInfoPassport`)
    let payload = {}
    if (applicantInfoPassport) {
      if (applicantInfoPassport == 'false') {
        payload.applicantInfoPassport = false
        payload.signature1 = false
      } else if (applicantInfoPassport == 'true') {
        payload.applicantInfoPassport = true
        payload.signature1 = true
      }
    }
    if (insurantInfoPassport) {
      if (insurantInfoPassport == 'false') {
        payload.insurantInfoPassport = false
        payload.signature2 = false
      } else if (insurantInfoPassport == 'true') {
        payload.insurantInfoPassport = true
        payload.signature2 = true
      }
    }
    this.props.dispatch({
      type: "insuredNew/editdate",
      payload
    })
    this.setState({
      insurantType: ele,
      recoveryflag: false,
      beneficiaryType: item,
      beneficiaryList: newBeneficiaryList
    }, () => {
      console.log("recovery value", value)
      value && value.map((item, index) => {
        if (item['name'].includes("Date") || item['name'].includes("day"))
          item.value = new Date(item.value)
        if (item.name == "applicantInfo.identity") {
          if (this.identitytest(item.value) >= 18 && !this.props.insuredNew.applicantInfoPassport) {
            this.props.dispatch({
              type: "insuredNew/editSignature",
              payload: {
                signature1: true,
                index: 1
              }
            })
          }
        }
        if (item.name == "insurantInfo.job") {
          let professionStr = ''
          this.state.insuredTemplate.attrModules.forEach((ite, index) => {
            if (ite.moduleApiName == "insurantInfo") {
              ite.productAttributes.forEach((itm, ind) => {
                if (itm.apiName == "job") {
                  professionStr = itm.attributelabels.filter((i) => {
                    return i.value == item.value[0]
                  })[0].label
                }
              })
            }
          })
          payload.insurantInfoProfessionStr = professionStr
          this.props.dispatch({
            type: "insuredNew/editDate",
            payload: {
              ...payload
            }
          })
        }
        if (item.name == "insurantInfo.identity") {
          if (this.identitytest(item.value) >= 18 && !this.props.insuredNew.insurantInfoPassport) {
            this.props.dispatch({
              type: "insuredNew/editSignature",
              payload: {
                signature2: true,
                index: 2
              }
            })
          }
        }
        // 恢复职业显示
        if (item.name.endsWith(".profession")) {
          const insurantType = localStorage.getItem(`${productId}_defaultValue_insurantType`);
          this.setState({
            // jobName: (insurantType == 2 && item.name == 'applicantInfo.profession') ? null : item.label,
            [`${item.name.replace('.', "_")}_label`]: item.label
          })
        }

        setFieldsValue({
          [item.name]: item.value
        })
      })
    })
  }

  setTimeout(() => {
    if (!flag) {
      localStorage.removeItem(`${productId}_newBeneficiaryList`)
      localStorage.removeItem(`${productId}_productDate`)
      localStorage.removeItem(`${productId}_defaultValue_beneficiaryType`)
      localStorage.removeItem(`${productId}_defaultValue_insurantType`)
    }
    this.setState({
      recoveryflag: false,
      // jobName: null,
      applicantInfo_profession_label: null,
      insurantInfo_profession_label: null
    })
  }, 500)
}

/**
 * 暂存投保表单填写
*/
export const saveInsured = function (e, item, action, _this, regex, name) {
  let value = name ? this.props.form.getFieldValue(name) : undefined;
  const { productId } = this.state.insuredTemplate || {};
  let formCache = JSON.parse(localStorage.getItem(`${productId}_productDate`) || '[]');
  // applicantAndinsurantCommonApiNames
  const reg = regex ? new RegExp(regex) : undefined;
  if ((reg && reg.test(value)) || name) {
    const target = formCache && formCache.find(item => item.name == name);
    if (target) {
      target.value = value;
      target.label = e && e.target && e.target.label;
    } else {
      formCache.push({ name, value, label: e && e.target && e.target.label })
    }
    const obj = {};
    formCache = formCache.filter(item => obj[item.name] ? '' : (obj[item.name] = true));
    localStorage.setItem(`${productId}_productDate`, JSON.stringify(formCache))
  }

  // let payload = null
  // if (action) {
  //   switch (action) {
  //     case "click":
  //       payload = [{ operateType: 12, msg: `点击内容=${item.name}`, productId: localStorage.getItem("product_id") }]
  //       break;
  //     case "input":
  //       payload = [{ operateType: 15, msg: `输入项=${item.name}，输入结果=${e.target.value}`, productId: localStorage.getItem("product_id") }]
  //       break;
  //     case "change":
  //       payload = [{ operateType: 13, msg: `选择项=${item.name}，选择结果=${e.target.value}`, productId: localStorage.getItem("product_id") }]
  //       break;
  //     default:
  //       break;
  //   }
  //   _this.props.dispatch({
  //     type: "insuredNew/tracks",
  //     payload,
  //   })
  // }
}