import Contact from './contact'
import Sex from './sex'
import FamilySituation from './familySituation'
import ChildrenNumber from './childrenNumber'
import ChildrenSex from './childrenSex'
import Birth from './birth'
import Income from './income'
import SocialSecurity from './socialSecurity'
import CommunicationTime from './communicationTime'
import City from './city'

const CustomizedPages = [
    {
        key: 1,//pageNumber
        name: "联系方式",
        component: Contact
    },
    {
        key: 2,
        name: "性别",
        component: Sex
    },
    {
        key: 3,
        name: "家庭情况",
        component: FamilySituation
    },
    {
        key: 4,
        name: "孩子数量",
        component: ChildrenNumber
    },
    {
        key: 5,
        name: "孩子性别",
        component: ChildrenSex
    },
    {
        key: 6,
        name: "生日",
        component: Birth
    },
    {
        key: 7,
        name: "收入",
        component: Income
    },
    {
        key: 8,
        name: "社保",
        component: SocialSecurity
    },
    {
        key:9,
        name:'居住地',
        component:City
    },
    {
        key: 10,
        name: "沟通时间",
        component: CommunicationTime
    },
]

export default CustomizedPages;
