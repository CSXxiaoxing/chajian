/**
 * @file 涂抹蒙层插件
 * @param { name } - 陈盛兴 - 作者.
 * @param { email } - a251156539@163.com - 邮箱.
 * @copyright [Chen ShengXing 2019.12.12]
 * @tips [请合法使用本插件，不可用于任何违法的区域与项目，不可用于任何反中组织及反中项目；中华人民共和国万岁！！]
 */
/* eslint-disable space-before-function-paren */
/* eslint-disable semi */
/* eslint-disable indent */
/* eslint-disable one-var */
/**
 * 获取节点样式
 * @param {element} _e 节点
 * @param {string} _n 样式名
 */
function getStyle(_e, _n) {
  if (_e.style && _e.style[_n]) {
    return _e.style[_n];
  } else {
    // 它使用传统的"text-Align"风格的规则书写方式，而不是"textAlign"
    _n = _n.replace(/([A-Z])/g, "-$1");
    _n = _n.toLowerCase();
    var _s = window.getComputedStyle ? window.getComputedStyle(_e, null) : _e.currentStyle;
    return _s ? _s[_n] : null
  }
}
/**
 * 设置定位-使蒙层覆盖其上方
 * @this <box节点> 载体
 */
function setBoxStyle() {
  var _p = getStyle(this, 'position');
  if (_p !== 'absolute' && _p !== 'relative') {
    this.style['position'] = 'relative';
  }
}
/**
 * 执行函数
 * @param {object} _param
 * @callback _cb 涂层达标返回执行函数
 */
export default function (_param, _cb) {
  _param = _param || {}
  let arg = {
    id: "", // 画布载体id
    proportion: 60, // 涂抹比例
    touchRadius: 10, // 默认手指触摸半径
    fillStyle: "#ccc", // 填充颜色
    fontSize: "15px", // 文字大小
    fontFamily: "arial", // 字体样式
    fontColor: "white", // 字体颜色
    fontText: "您获得一次刮奖机会", // 字体文案
    TY: 40, // 文字Y轴位置
    TX: 56 // 文字X轴位置
  }
  Object.assign(arg, _param)
  // 获取屏幕可视宽度
  let clientWidth = document.documentElement.clientWidth;
  // 画布载体
  let canvasBox = document.querySelector(arg.id)
  let cH = canvasBox.clientHeight
  let cW = canvasBox.clientWidth
  // 样式
  setBoxStyle.call(canvasBox)
  // 创建画布
  var cvs = document.createElement('canvas');
  canvasBox.appendChild(cvs);
  cvs.width = cW;
  cvs.height = cH;
  cvs.style['zIndex'] = 2;
  cvs.style['position'] = 'absolute';
  var ctx = cvs.getContext("2d")

  // 需要判断是PC还是手机
  let device = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  ),
    clickEvtName = device ? "touchstart" : "mousedown",
    moveEvtName = device ? "touchmove" : "mousemove"
  console.log("是否手机", device)
  // 居中显示
  if (clientWidth * 1 > 0) {
    canvasBox.style.left = (clientWidth - cW) / 2 + "px"
    // 判断涂抹是否结束
    if (!device) {
      // pc端
      var isMouseDown = false
      canvasBox.addEventListener(
        "mouseup",
        function (e) {
          ctx.globalCompositeOperation = "source-over" // 恢复默认
          isMouseDown = false
          // 当涂抹打到一定百分比可判断完成
          if (arg.proportion > getTransparentPercent(ctx, cW, cH)) {
            _cb && _cb()
          }
          console.log("当前涂抹比例为：" + getTransparentPercent(ctx, cW, cH))
        },
        false
      )
    } else {
      // 移动端
      canvasBox.addEventListener(
        "touchmove",
        function (e) {
          if (isMouseDown) {
            e.preventDefault()
          }
        },
        false
      )
      canvasBox.addEventListener(
        "touchend",
        function (e) {
          ctx.globalCompositeOperation = "source-over" // 恢复默认
          isMouseDown = false
          // 当涂抹打到一定百分比可判断完成
          if (getTransparentPercent(ctx, cW, cH) >= arg.proportion) {
            _cb && _cb()
          }
          console.log("当前涂抹比例为：" + getTransparentPercent(ctx, cW, cH))
        },
        false
      )
    }
  }
  if (canvasBox.style) {
    canvasBox.style.webkitUserSelect = "none"
    canvasBox.style.mozUserSelect = "none"
    canvasBox.style.msUserSelect = "none"
    canvasBox.style.UserSelect = "none"
  }
  let cL = canvasBox.getBoundingClientRect().left
  let cT = canvasBox.getBoundingClientRect().top

  // 默认填充灰色来遮住文字
  ctx.fillStyle = arg.fillStyle
  ctx.fillRect(0, 0, cW, cH) // fillRect，用矩形填充
  ctx.font = `${arg.fontSize} ${arg.fontFamily}`
  ctx.fillStyle = arg.fontColor
  ctx.fillText(arg.fontText, arg.TX, arg.TY)

  // 画园的方法
  // @param { integer } 圆心的x坐标
  // @param { integer } 圆心的y坐标
  // @param { integer } 圆心半径
  // @param { string } 填充的颜色（本例中会通过其余代码设置为‘透明’，所以这个设置可以忽略）
  var fillCircle = function (x, y, radius, fillColor) {
    this.fillStyle = fillColor || "#eee"
    this.beginPath()
    this.moveTo(x - cL, y - cT)
    this.arc(x - cL, y - cT, radius, 0, Math.PI * 2, false) // 标准画圆
    this.fill()
  }

  // 得到涂抹的百分比
  var getTransparentPercent = function (ctx, width, height) {
    var imgData = ctx.getImageData(0, 0, width, height), // 得到canvas的像素信息
      pixles = imgData.data,
      transPixs = []
    for (var i = 0, j = pixles.length; i < j; i += 4) {
      // 因为存储的结构为[R, G, B, A]，所以要每次跳4个长度
      var a = pixles[i + 3] // 拿到存储alpha通道的值
      if (a === 0) {
        // alpha通道为0，就代表透明
        transPixs.push(i)
      }
    }
    return Number(((transPixs.length / (pixles.length / 4)) * 100).toFixed(2))
  }

  // 开始移动
  cvs.addEventListener(
    clickEvtName,
    function (e) {
      isMouseDown = true
      var x = device ? e.touches[0].clientX : e.clientX
      var y = device ? e.touches[0].clientY : e.clientY
      console.log(e.touches, 88)
      ctx.globalCompositeOperation = "destination-out" // 关键部分，描述当在canvas上再次绘画时候的情况，这个设置便是之前所说的透明
      fillCircle.call(ctx, x, y, arg.touchRadius)
    },
    false
  )

  // 移动中
  cvs.addEventListener(
    moveEvtName,
    function (e) {
      if (!device && !isMouseDown) {
        return false
      }
      var x = device ? e.touches[0].clientX : e.clientX
      var y = device ? e.touches[0].clientY : e.clientY
      fillCircle.call(ctx, x, y, arg.touchRadius)
    },
    false
  )
}
