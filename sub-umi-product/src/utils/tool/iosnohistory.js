export default () => {
  return window.history.length <= 1 && /(iPhone|iPad|iPod|iOS)/i.test(window.navigator.userAgent)
}