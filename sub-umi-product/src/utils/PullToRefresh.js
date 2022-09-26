export function pullToRefresh() {
    let scroll=this.scroll;
    let outerScroller=this.outerScroller;
    let more=this.more;
    let touchStart;
    let touchEnd;
    let touchDis;//触摸移动距离
    //手指触摸屏幕时候触发
    outerScroller.addEventListener('touchstart',function (event) {
        let touch = event.touches[0];
        touchStart=touch.pageY;
    },false);

    //手指移动触发
    outerScroller.addEventListener('touchmove',event => {
        var touch=event.targetTouches[0];
        touchDis=touch.pageY-touchStart;
        scroll.style.top=scroll.offsetTop+touchDis+"px";
        touchStart = touch.pageY;

    });
    //手指离开屏幕时触发
    outerScroller.addEventListener('touchend',event => {
        let top=scroll.offsetTop;

        console.log('手指离开屏幕时触发', scroll.offsetTop);
        //加载more
        let up=scroll.scrollHeight-outerScroller.clientHeight;
        if ((scroll.scrollHeight>outerScroller.clientHeight)&&(touchDis<-5)) {
            console.log(up+"aaaaaa");
            loadMore(outerScroller, scroll, more);
        }
    },false);
}


const loadMore = (outerScroller, scroll, more) => {
    console.log("!!!!");
    more.style.display = "block";
    more.style.top = scroll.scrollHeight + scroll.offsetTop + "px";
    more.style.height = outerScroller.clientHeight - scroll.scrollHeight - scroll.offsetTop + "px";
    let timer = setTimeout(() => {
        more.style.display = "none";

        for (let i = 0; i < 10; i++) {
            let node = document.createElement("li");
            node.innerHTML = "I'm more" + i;
            scroll.appendChild(node);
        }

        scroll.style.top = -scroll.scrollHeight + outerScroller.clientHeight + "px";

    }, 500);
};
