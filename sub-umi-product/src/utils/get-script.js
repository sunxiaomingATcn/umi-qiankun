export default function getScript(url, callback) {
    typeof url === 'string' && (url = [url]);
    let head = document.getElementsByTagName('head')[0],
        count = 0;
    for (const i in url) {
        const script = document.createElement('script');
        script.async = 'async';
        script.src = url[i];
        script.onload = function() {
            count++;
            count == url.length && typeof callback === 'function' && callback.call();
        };
        head.appendChild(script);
    }
}
