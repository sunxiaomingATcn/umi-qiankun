/**
 * 微信分享引导层
 * @use
 * import ShareGuide from '@/components/ShareGuide';
 * <div onClick={()=>ShareGuide.open()}>转给客户</div>
*/
import ReactDOM from 'react-dom';
import styles from './index.less';

const ShareGuide = {
  // 创建容器
  createContainer: function () {
    ShareGuide.containerDom = document.createElement('div');
    ShareGuide.containerDom.id = 'wxShareGuideContainer';
    document.body.appendChild(ShareGuide.containerDom);
  },
  open: (title = '立即分享给好友吧', content = '点击屏幕右上角「···」将本页面分享给好友') => {
    if (!ShareGuide.containerDom) ShareGuide.createContainer();
    ReactDOM.render(<div className={styles.wx_share_container}>
      <div className={styles.mask} onClick={ShareGuide.close}></div>
      <img className={styles.guide_arrow} src={require('./arrow.svg')} />
      <div className={styles.guideContent}>
        <p>{title}</p>
        <p>{content}</p>
      </div>
    </div>, ShareGuide.containerDom)
  },
  close: function () {
    if (ShareGuide.containerDom) ReactDOM.render(null, ShareGuide.containerDom)
  }
}

export default ShareGuide;