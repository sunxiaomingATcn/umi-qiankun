
### 添加产品对象
```javascript
// products.push(arg1,arg2,arg3) 第三个参数非必传
 export const Jdal = products.push(
   '名称', // 支持数组 ['名称1','名称2']
   '自定义code', 
   { 
      fixedPrice: '产品详情固定价格展示'，
      fixedPayPrice:'支付固定价格展示', 
      isHasAbaoService: '是否展示abao客服',
      premiumTrialTitle: '保费试算弹窗标题',
      insuredAgeboundaryDayDiff: {
        max: -3,
        min: -4,
      }, // 投保年龄周岁边界天数差值; (保费试算时减去insuredAgeboundaryDayDiff天数)
      insuranceTips: {
        title: '投保流程提示',
        content: `<div>....<a id="pictureNotify">《客户告知书》</a>....</div>`,  // 《客户告知书》注意添加id pictureNotify
        submitText: '确定'
      },// 可回溯弹窗当前产品固定文案
      insurePremiumTrialHidden: true, //立即投保试算隐藏
      insuranceType: 1, // 非车险
   }) 
```



### 以下产品名称非必传，默认取storage存储产品名称

eg: 根据push时候参数名获取值
```javascript
import { getFixValue } from './assets/productConfig/judgeProductFeature';
getFixValue('insuranceType'); // 非车险 => 1
getFixValue('insurePremiumTrialHidden'); // 立即投保试算隐藏
```

eg: 判断是否是指定产品 => 产品对象.is()
```javascript
import { Jdal } from './assets/judgeSpecialProductFeature';
Jdal.is() // 是否是京东安联产品 => return true / false
```

eg: 判断是否有产品详情固定展示价格（注意push产品对象）
```javascript
import { fixPrice } from './assets/judgeSpecialProductFeature';
fixPrice('臻爱无限医疗保险2020版-个人基本计划') // => '首月1元'
fixPrice() // => '首月1元'
```
eg: 判断是否有abao客服
```javascript
import { isHasAbaoService } from './assets/judgeSpecialProductFeature';
isHasAbaoService('泰元保') // => false
isHasAbaoService()
```