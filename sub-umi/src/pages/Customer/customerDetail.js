/**
 * title: 客户信息
 */
 import React, { Component } from 'react';
 import { connect } from 'dva';
 import { DatePicker, Button, Picker, List, InputItem } from 'antd-mobile';
 import styles from './assets/css/add.scss';
 import RadioButton from './components/radioButton/RadioButton';
 import { history } from 'umi';
 import { createForm } from 'rc-form';
 import { Fragment } from 'react';
 import moment from 'moment';

 @connect(({ customer, loading }) => ({
   customer,
   loading: loading.effects['customer'],
 }))
 class Index extends Component {
   constructor(props) {
     super(props);
     this.state = {
       dictionary: [
         'health_case',
         'family_case',
         'social_case',
         'income_case',
         'sex',
         'identity_type',
         'education_type',
       ],
       sex: [],
       social: '',
       areaList: [],
       toastText: '身份证错误',
       toastFlag: false,
     };
   }

   componentDidMount() {
     const {
       dispatch,
       location: { query },
     } = this.props;
     if (query && query.id) {
       dispatch({
         type: 'customer/customerDetail',
         payload: {
           id: query.id,
         },
       }).then(res => {
         if (res && res.code == 200) {
           let reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
           if(res.data&&res.data.identityType==1&&reg.test(res.data.identityNo)){
            this.setState({ birthdayDisabled: true });
           }
           this.setState({ detail: res.data });
         }
       });
     }
     dispatch({
       type: 'common/getTreeList',
     }).then(res => {
       if (res && res.code == 200) {
         this.setState({
           areaList: res.data,
         });
       }
     });
     this.state.dictionary.forEach(item => {
       dispatch({
         type: 'common/queryDictionary',
         payload: {
           code: item,
         },
       }).then(res => {
         if (res && res.code == 200) {
           if (item == 'identity_type') {
             res.data.forEach(item => {
               item.label = item.dictValue;
               item.value = item.dictKey;
             });
           }
           this.setState({
             [item]:
               item == 'identity_type'
                 ? res.data
                 : res.data.sort((a, b) => {
                     return b.dictKey - a.dictKey;
                   }),
           });
         }
       });
     });
   }
   handleTags(name, item) {
     const { setFieldsValue } = this.props.form;
     setTimeout(() => {
       setFieldsValue({ [name]: item });
     }, 0);
   }

   submit() {
     const {
       form: { getFieldsValue, setFieldsValue },
       dispatch,
       location: { query },
     } = this.props;
     let values = getFieldsValue();
     Object.keys(values).forEach((item, index) => {
       if (values[item] && typeof values[item] == 'string') {
         setFieldsValue({
           [item]: values[item].trim(),
         });
         values[item] = values[item].trim();
       }
     });
     let reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
     if (!values.name) {
       this.toast('请输入姓名', 2000);
       return;
     }
     if (!values.identityNo) {
       this.toast('请输入证件号码', 2000);
       return;
     }
     if (!values.identityType) {
       this.toast('请选择证件类型', 2000);
       return;
     }
     if (values.identityNo && values.identityType[0] == 1 && !reg.test(values.identityNo)) {
       this.toast('该身份证无效', 2000);
       return;
     }
     if (values.mobile && !/^1[3456789]\d{9}$/.test(values.mobile)) {
       this.toast('手机号错误', 2000);
       return;
     }
     if (values && values.birthday) {
       values.birthday = moment(values.birthday).format('YYYY-MM-DD');
     }
     if (values.identityType) values.identityType = values.identityType.toString();
     if (values.region) values.region = values.region.toString();
     if (query && query.id) values.id = query.id;
     dispatch({
       type: 'customer/customerSave',
       payload: {
         ...values,
       },
     }).then(res => {
       if (res && res.code == 200) {
         this.toast('操作成功', 1000);
         setTimeout(() => {
           history.goBack();
         }, 1000);
       }
     });
   }

   toast(text, time) {
     this.setState(
       {
         toastText: text,
         toastFlag: true,
       },
       () => {
         setTimeout(() => {
           this.setState({
             toastText: '',
             toastFlag: false,
           });
         }, time);
       },
     );
   }

   birthday(value) {
     const { getFieldValue, setFieldsValue } = this.props.form;
     let reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
     if (reg.test(value) && getFieldValue('identityType') && getFieldValue('identityType')[0] == 1) {
       let shengri = '';
       let nian, yue, ri;
       nian = value.substr(6, 4);
       yue = value.substr(10, 2);
       ri = value.substr(12, 2);
       shengri = nian + '-' + yue + '-' + ri;
       setFieldsValue({
         birthday: moment(shengri)._d,
       });
       this.setState({ birthdayDisabled: true });
     } else {
       setFieldsValue({
         birthday: undefined,
       });
       this.setState({ birthdayDisabled: false });
     }
   }

   identityType(e) {
     const { getFieldValue } = this.props.form;
     let reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
     if (
       getFieldValue('identityNo') &&
       reg.test(getFieldValue('identityNo')) &&
       e[0] == 1
     ) {
       this.birthday(getFieldValue('identityNo'))
       this.setState({ birthdayDisabled: true });
     } else {
       this.setState({ birthdayDisabled: false });
     }
   }

   render() {
     const { getFieldProps, getFieldsValue, getFieldValue } = this.props.form;
     const {
       sex = [],
       social,
       identity_type = [],
       social_case = [],
       health_case = [],
       family_case = [],
       income_case = [],
       education_type = [],
       areaList = [],
       detail = {},
       birthdayDisabled = false,
     } = this.state;
     return (
       <Fragment>
         <div className={styles.add}>
           <List>
             <InputItem
               {...getFieldProps('name', {
                 initialValue: detail && detail.name,
               })}
               maxLength={20}
               placeholder="请输入姓名（必填项）"
             >
               <span className={styles.required}>*</span>
               <span className={styles.title}>姓名</span>
             </InputItem>
             <InputItem
               {...getFieldProps('mobile', {
                 initialValue: detail && detail.mobile,
               })}
               type="number"
               maxLength={11}
               placeholder="请输入手机号"
             >
               <span className={styles.title}>手机号</span>
             </InputItem>
             <InputItem
               {...getFieldProps('weChat', {
                 initialValue: detail && detail.weChat,
               })}
               maxLength={20}
               placeholder="请输入微信号"
             >
               <span className={styles.title}>微信号</span>
             </InputItem>
             <Picker
               extra="请选择"
               data={identity_type}
               title="证件类型"
               {...getFieldProps('identityType', {
                 initialValue: detail && detail.identityType ? [detail.identityType] : [1],
               })}
               cols={1}
               onOk={e => {
                 this.identityType(e);
               }}
             >
               <List.Item arrow="horizontal">
                 <span className={styles.required}>*</span>
                 <span className={styles.title}>证件类型</span>
               </List.Item>
             </Picker>
             <InputItem
               onBlur={value => {
                 this.birthday(value);
               }}
               {...getFieldProps('identityNo', {
                 initialValue: detail && detail.identityNo,
               })}
               maxLength={30}
               placeholder="请输入证件号"
             >
               <span className={styles.required}>*</span>
               <span className={styles.title}>证件号</span>
             </InputItem>
             <List.Item>
               <div className={styles.addTags}>
                 <div className={styles.rightTitle}>性别</div>
                 <div className={styles.leftTags}>
                   {sex.map((item, index) => {
                     return (
                       <RadioButton
                         {...getFieldProps('sex', {
                           initialValue: detail && detail.sex,
                         })}
                         key={item.dictKey}
                         className={`${styles.tagsItem}`}
                         checked={getFieldValue('sex') == item.dictKey}
                         onClick={() => this.handleTags('sex', item.dictKey)}
                       >
                         {item.dictValue}
                       </RadioButton>
                     );
                   })}
                 </div>
               </div>
             </List.Item>
             <DatePicker
               mode="date"
               minDate={moment('1900-01-01')._d}
               {...getFieldProps('birthday', {
                 initialValue: detail && detail.birthday && moment(detail.birthday)._d,
               })}
               disabled={birthdayDisabled}
             >
               <List.Item arrow="horizontal">
                 <span className={styles.title}>生日</span>
               </List.Item>
             </DatePicker>
             <div className={styles.areaValue}>
               <Picker
                 extra={<div style={{ textAlign: 'right' }}>请选择</div>}
                 data={areaList}
                 title="选择地区"
                 {...getFieldProps('region', {
                   initialValue: detail && detail.region && detail.region.split(','),
                 })}
                 okText={'完成'}
                 className={styles.area}
                 cols={3}
               >
                 <List.Item arrow="horizontal">
                   <span className={styles.title}>地区</span>
                 </List.Item>
               </Picker>
             </div>
             <List.Item style={{ height: 'auto' }}>
               <div className={styles.addTags}>
                 <div className={styles.rightTitle}>健康状况</div>
                 <div
                   className={styles.leftTags}
                   style={{ paddingBottom: '0.3rem' }}
                   {...getFieldProps('healthCase', {
                     initialValue: detail && detail.healthCase,
                   })}
                 >
                   {health_case.map((item, index) => {
                     if (index > 1 && index != health_case.length)
                       return (
                         <RadioButton
                           key={item.dictKey}
                           className={`${styles.tagsItem}`}
                           checked={getFieldValue('healthCase') == item.dictKey}
                           onClick={() => this.handleTags('healthCase', item.dictKey)}
                         >
                           {item.dictValue}
                         </RadioButton>
                       );
                   })}
                   {health_case && health_case.length > 0 && (
                     <Fragment>
                       <RadioButton
                         style={{
                           marginTop: '0.2rem',
                           marginBotton: '0.3rem',
                         }}
                         key={health_case[0].dictKey}
                         className={`${styles.tagsItem}`}
                         checked={getFieldValue('healthCase') == health_case[0].dictKey}
                         onClick={() => this.handleTags('healthCase', health_case[0].dictKey)}
                       >
                         {health_case[0].dictValue}
                       </RadioButton>
                       <RadioButton
                         style={{
                           marginTop: '0.2rem',
                           marginBotton: '0.3rem',
                         }}
                         key={health_case[1].dictKey}
                         className={`${styles.tagsItem}`}
                         checked={getFieldValue('healthCase') == health_case[1].dictKey}
                         onClick={() => this.handleTags('healthCase', health_case[1].dictKey)}
                       >
                         {health_case[1].dictValue}
                       </RadioButton>
                     </Fragment>
                   )}
                 </div>
               </div>
             </List.Item>
             <List.Item style={{ height: 'auto' }}>
               <div className={styles.addTags}>
                 <div className={styles.rightTitle}>家庭关系</div>
                 <div
                   className={styles.leftTags}
                   style={{ paddingBottom: '0.3rem' }}
                   {...getFieldProps('familyCase', {
                     initialValue: detail && detail.familyCase,
                   })}
                 >
                   {family_case.map((item, index) => {
                     return (
                       <RadioButton
                         key={item.dictKey}
                         className={`${styles.tagsItem}`}
                         checked={getFieldValue('familyCase') == item.dictKey}
                         onClick={() => this.handleTags('familyCase', item.dictKey)}
                       >
                         {item.dictValue}
                       </RadioButton>
                     );
                   })}
                 </div>
               </div>
             </List.Item>
             <List.Item style={{ height: 'auto' }}>
               <div className={styles.addTags}>
                 <div className={styles.rightTitle}>教育背景</div>
                 <div
                   className={styles.leftTags}
                   style={{ paddingBottom: '0.3rem' }}
                   {...getFieldProps('educationCase', {
                     initialValue: detail && detail.educationCase,
                   })}
                 >
                   {education_type.map((item, index) => {
                     if (index > 1 && index != education_type.length)
                       return (
                         <RadioButton
                           key={item.dictKey}
                           className={`${styles.tagsItem}`}
                           checked={getFieldValue('educationCase') == item.dictKey}
                           onClick={() => this.handleTags('educationCase', item.dictKey)}
                         >
                           {item.dictValue}
                         </RadioButton>
                       );
                   })}
                   {education_type && education_type.length > 0 && (
                     <Fragment>
                       <RadioButton
                         style={{
                           marginTop: '0.2rem',
                           marginBotton: '0.3rem',
                         }}
                         key={education_type[0].dictKey}
                         className={`${styles.tagsItem}`}
                         checked={getFieldValue('educationCase') == education_type[0].dictKey}
                         onClick={() => this.handleTags('educationCase', education_type[0].dictKey)}
                       >
                         {education_type[0].dictValue}
                       </RadioButton>
                       <RadioButton
                         style={{
                           marginTop: '0.2rem',
                           marginBotton: '0.3rem',
                         }}
                         key={education_type[1].dictKey}
                         className={`${styles.tagsItem}`}
                         checked={getFieldValue('educationCase') == education_type[1].dictKey}
                         onClick={() => this.handleTags('educationCase', education_type[1].dictKey)}
                       >
                         {education_type[1].dictValue}
                       </RadioButton>
                     </Fragment>
                   )}
                 </div>
               </div>
             </List.Item>
             <List.Item style={{ height: 'auto' }}>
               <div className={styles.addTags}>
                 <div className={styles.rightTitle}>家庭收入</div>
                 <div
                   className={styles.leftTags}
                   style={{ paddingBottom: '0.3rem' }}
                   {...getFieldProps('incomeCase', {
                     initialValue: detail && detail.incomeCase,
                   })}
                 >
                   {income_case.map((item, index) => {
                     if (index != 0 && index != income_case.length)
                       return (
                         <RadioButton
                           key={item.dictKey}
                           className={`${styles.tagsItem}`}
                           checked={getFieldValue('incomeCase') == item.dictKey}
                           onClick={() => this.handleTags('incomeCase', item.dictKey)}
                         >
                           {item.dictValue}
                         </RadioButton>
                       );
                   })}
                   {income_case && income_case.length > 0 && (
                     <RadioButton
                       style={{ marginTop: '0.2rem', marginBotton: '0.3rem' }}
                       key={income_case[0].dictKey}
                       className={`${styles.tagsItem}`}
                       checked={getFieldValue('incomeCase') == income_case[0].dictKey}
                       onClick={() => this.handleTags('incomeCase', income_case[0].dictKey)}
                     >
                       {income_case[0].dictValue}
                     </RadioButton>
                   )}
                 </div>
               </div>
             </List.Item>
             <List.Item>
               <div className={styles.addTags}>
                 <div className={styles.rightTitle}>社保情况</div>
                 <div className={styles.leftTags}>
                   {social_case.map((item, index) => {
                     return (
                       <RadioButton
                         {...getFieldProps('socialCase', {
                           initialValue: detail && detail.socialCase,
                         })}
                         key={item.dictKey}
                         className={`${styles.tagsItem}`}
                         checked={getFieldValue('socialCase') == item.dictKey}
                         onClick={() => this.handleTags('socialCase', item.dictKey)}
                       >
                         {item.dictValue}
                       </RadioButton>
                     );
                   })}
                 </div>
               </div>
             </List.Item>
             <Button
               className={styles.btn}
               type="primary"
               onClick={() => {
                 this.submit();
               }}
             >
               保存
             </Button>
             <div style={{ height: '0.5rem' }}></div>
           </List>
         </div>
         {this.state.toastFlag && (
           <div className={styles.tost}>
             <div className={styles.content}>{this.state.toastText}</div>
           </div>
         )}
       </Fragment>
     );
   }
 }

 export default createForm()(Index);
