/**
 * 图片预加载
*/

export default function preLoadImage(images) {
    const imgPaths = typeof images === 'string' ? [images] : images;
    imgPaths.forEach(path => {
        var i = new Image();
        i.src = path
    });
}