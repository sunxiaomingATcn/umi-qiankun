record-sdk 进入待录屏页面时，必须先 startRecrod 启动录屏， 退出当前页面时，必须调用 stopRecord；

## 封装routerTrack
@routerTrack({ id: 'pageCode' }); 
开始：默认会进入页面会自动开始；
结束：劫持spa路由切换，上传当前页面回溯并在结束后才跳转；id是当前页面唯一标识；


## 以下是控制手动开始，手动结束；

### 1.手动结束 =>跳转第三方链接（跳转到单页应用外，如拉起保司收银台）
@routerTrack({ id: 'pageCode' });

jump = ()=>{
  this.props.trackStop()
  .then(() => {
    window.location.href = 'url';
  })
}

### 2.手动开始 =>指定回溯码（默认uuid，录屏的单的唯一标识）
@routerTrack({ id: 'pageCode', autoStart: false })

componentDidMount() {
  this.props.trackStart('tracebackCode');
}