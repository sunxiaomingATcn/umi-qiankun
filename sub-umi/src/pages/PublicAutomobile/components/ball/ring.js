
import React, { useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react';
import styles from './index.scss';


const Ring = (props, ref) => {
  useEffect(() => {
    // 获取canvas元素
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext("2d");
    let width = canvas.width;
    let height = canvas.height;


    //放大4倍抗锯齿
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.height = height * 4;
    canvas.width = width * 4;
    ctx.scale(4, 4);

    // defaultAngle 设置可滚动圆环的起始角度，通过requestAnimationFrame函数一点一点的递增来使圆环跑起来,
    // 也可以使用setTimeout()
    // 与圆环的起始角度相同
    let defaultAngle = Math.PI*1.5;

    animate();
    // 逐帧动画
    function animate() {
      defaultAngle += 0.01;
      // 这个值可以根据个人需要修改
      // 这个maxAngle 时上层圆环滚动的到最大的角度可以传入这个角度来控制滚动的百分比
      let maxAngle = Math.PI * 3.5;
      if (defaultAngle >= maxAngle) {
        props.onFinish && props.onFinish();
        defaultAngle = maxAngle;
        draw(); // 绘制圆环
        circlingPointer() // 绘制最上面的指针
        return
      }
      draw(); // 绘制圆环
      circlingPointer() // 绘制最上面的指针
      setTimeout(() => {
        window.requestAnimationFrame(animate);
      }, 30);
    }
    // 绘制圆环
    function draw() {
      // 为了避免每次绘制的时候出现一些奇奇怪怪的问题，比如拖影之类的，每次绘制之前清空一次绘布
      ctx.clearRect(0, 0, width, height);
      // 外环
      let circleObj = {
        ctx: ctx,
        /*圆心*/
        x: width / 2,
        y: height / 2,
        /*半径*/
        radius: width / 2 - 4, //半径比canvas宽的一半要小
        /*环的宽度*/
        lineWidth: 3
      };
  
      // 绘制外环
      circleObj.startAngle = Math.PI * 1.5;
      circleObj.endAngle = defaultAngle;

      // let grd = ctx.createLinearGradient(width / 2, 0, 0, height);
      // grd.addColorStop(0, "#dd6200");
      // grd.addColorStop(1, "#fff400");
      circleObj.color = '#0AB88D';
      drawCircle(circleObj);
    }

    function circlingPointer() {
      ctx.save(); //保存之前的状态 
      ctx.translate(width / 2, height / 2);//原点移动到画布中央
      ctx.rotate(defaultAngle);//根据角度改变来旋转白色圆点
      // 绘制外环白色圆点
      ctx.beginPath();
      ctx.arc(width / 2 - 4, 0, 3, 0, 2 * Math.PI, false);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.closePath();
      ctx.restore();//回到未改变坐标的状态
    }
    function drawCircle(circleObj) {
      let ctx = circleObj.ctx;
      ctx.beginPath();
      ctx.arc(circleObj.x, circleObj.y, circleObj.radius, circleObj.startAngle, circleObj.endAngle);
      //设定曲线粗细度
      ctx.lineWidth = circleObj.lineWidth;
      //给曲线着色
      ctx.strokeStyle = circleObj.color;
      //连接处样式
      ctx.lineCap = 'round';
      //给环着色
      ctx.stroke();
      ctx.closePath();
    }
  }, [])

  return <canvas className={styles.ringCon} id="canvas" width="60" height="60"></canvas>
}

export default forwardRef(Ring);