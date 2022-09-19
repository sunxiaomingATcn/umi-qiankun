
/**投保须知*/
import styles from './index.scss';


const text = `
1、本人作为代理人（或投保人）已经将此保险产品全部保障内容和保险金额向投保人做了明确说明，投保人已经理解并对此表示同意。
2、本人已将该保险产品的各项保险条款，特别是对保险条款中有关责任免除部分对投保人进行了准确详细的说明，投保人已经详细理解并完全认可。
3、本人声明对投保人的相关资料进行严格保密，且对投保人提供的资料仅用作本次投保，不做他用。
4、同意并授权保险人因签订车辆保险合同需要采集、处理、传递和应用本人缴费账户等相关个人信息，向合法存续的第三方机构传递、查询或验证本人缴费账户对应的身份信息。
5、如在投保过程中有任何疑问和投诉，请联系当地机构。
`
export default <div className={styles.con}>
  <div className={styles.title}>投保须知</div>
  <div className={styles.content} dangerouslySetInnerHTML={{ __html: text }}/>
</div>