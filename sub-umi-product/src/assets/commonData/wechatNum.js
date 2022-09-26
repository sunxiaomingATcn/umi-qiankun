const wechatList = ['abaobaoxian01',
    'chechebaoxian05',
    'chechebaoxian10',
    'abaozaixian01',
    'chechebaoxian12']

export default function getRandomWechat() {
    return wechatList[Math.floor(Math.random() * 100000) % (wechatList.length)]
}
