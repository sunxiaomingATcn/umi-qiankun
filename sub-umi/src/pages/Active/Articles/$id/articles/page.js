// 新增文章引入对应模块, 添加对应 id=> component

import P6 from './p6';
import P2 from './p1';

export default {
    p1: {
        title: '保险套路多？买哪个最划算？手把手教你避开保险的这些坑！',
        component: P2,
        wxShare: {
            title: '保险套路多？买哪个最划算？手把手教你避开保险的这些坑！',
            desc: '重疾保险怎么买？如何避坑？一文全解答！'
        }
    },
    p6: {
        title: '重疾险一年交多少钱？看了节省50万元，超出你的想象！',
        component: P6,
        wxShare: {
            title: '重疾险一年才几千？为什么我一年几万？',
            desc: '【深度好文】重大疾病保险怎么买最便宜？别说我没告诉你！'
        }
    }
};
