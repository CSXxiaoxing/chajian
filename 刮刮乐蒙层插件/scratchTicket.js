/**
 * @file 涂抹蒙层插件
 * @param { name } - 陈盛兴 - 作者.
 * @param { email } - a251156539@163.com - 邮箱.
 * @copyright [Chen ShengXing 2019.12.12]
 * @tips [请合法使用本插件，不可用于任何违法的区域与项目，不可用于任何反中组织及反中项目；中华人民共和国万岁！！]
 */
function getStyle(_e, _n) {
  if (_e.style && _e.style[_n]) {
    return _e.style[_n];
  } else {

    _n = _n.replace(/([A-Z])/g, "-$1");
    _n = _n.toLowerCase();
    var _s = window.getComputedStyle
      ? window.getComputedStyle(_e, null)
      : _e.currentStyle;
    return _s ? _s[_n] : null;
  }
}
function setBoxStyle() {
  var _p = getStyle(this, "position");
  if (_p !== "absolute" && _p !== "relative") {
    this.style["position"] = "relative";
  }
}
function must(_obj) {
  if (!_obj.id) {
    throw 'GGL: id为必传值'
  } else {

  }
}
function* running(_obj) {
  must(_obj)
  console.log(_obj, 999)
}
export default function (_param, _cb) {
  _param = _param || {};
  let arg = {
    id: "",
    proportion: 60,
    touchRadius: 10,
    fillStyle: "#ccc",
    fontSize: "15px",
    fontFamily: "arial",
    fontColor: "white",
    fontText: "您获得一次刮奖机会",
    TY: 0,
    TX: 0
  };

  for (var _o in arg) {
    arg[_o] = _param[_o] || arg[_o]
  }

  arg.fontSize = arg.fontSize.replace(/px|rem|rpx|em|vw|in|cm|mm|pt|pc|ex|ch|vh|vmin|%/ig, '') * 1
  let clientWidth = document.documentElement.clientWidth;

  let canvasBox = document.querySelector(arg.id);
  let cH = canvasBox.clientHeight;
  let cW = canvasBox.clientWidth;


  setBoxStyle.call(canvasBox);

  var cvs = document.createElement("canvas");
  canvasBox.appendChild(cvs);
  cvs.width = cW;
  cvs.height = cH;
  cvs.style["zIndex"] = 2;
  cvs.style["position"] = "absolute";
  var ctx = cvs.getContext("2d");





  if (!arg.TY) {
    arg.TY = (cH - arg.fontSize * arg.fontSize / 10) / 2 + arg.fontSize
  }
  let text_white = ctx.measureText(arg.fontText).width
  if (!arg.TX) {
    arg.TX = (cW - text_white * arg.fontSize / 10) / 2
  }

  let device = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  ),
    clickEvtName = device ? "touchstart" : "mousedown",
    moveEvtName = device ? "touchmove" : "mousemove";
  console.log("是否手机", device);

  function moveEnd() {
    ctx.globalCompositeOperation = "source-over";
    isMouseDown = false;

    if (getTransparentPercent(ctx, cW, cH) >= arg.proportion) {
      _cb && _cb();
    }
    console.log("当前涂抹比例为：" + getTransparentPercent(ctx, cW, cH));
  }

  if (clientWidth * 1 > 0) {
    canvasBox.style.left = (clientWidth - cW) / 2 + "px";

    if (!device) {

      var isMouseDown = false;
      canvasBox.addEventListener("mouseup", moveEnd, false);
    } else {

      canvasBox.addEventListener(
        "touchmove",
        function (e) {
          if (isMouseDown) {
            e.preventDefault();
          }
        },
        false
      );
      canvasBox.addEventListener("touchend", moveEnd, false);
    }
  }
  if (canvasBox.style) {
    canvasBox.style.webkitUserSelect = "none";
    canvasBox.style.mozUserSelect = "none";
    canvasBox.style.msUserSelect = "none";
    canvasBox.style.UserSelect = "none";
  }
  let cL = canvasBox.getBoundingClientRect().left;
  let cT = canvasBox.getBoundingClientRect().top;


  ctx.fillStyle = arg.fillStyle;
  ctx.fillRect(0, 0, cW, cH);
  ctx.font = `${arg.fontSize}px ${arg.fontFamily}`;
  ctx.fillStyle = arg.fontColor;
  ctx.fillText(arg.fontText, arg.TX, arg.TY);






  var fillCircle = function (x, y, radius, fillColor) {
    this.fillStyle = fillColor || "#eee";
    this.beginPath();
    this.moveTo(x - cL, y - cT);
    this.arc(x - cL, y - cT, radius, 0, Math.PI * 2, false);
    this.fill();
  };


  var getTransparentPercent = function (ctx, width, height) {
    var imgData = ctx.getImageData(0, 0, width, height),
      pixles = imgData.data,
      transPixs = [];
    for (var i = 0, j = pixles.length; i < j; i += 4) {

      var a = pixles[i + 3];
      if (a === 0) {

        transPixs.push(i);
      }
    }
    return Number(((transPixs.length / (pixles.length / 4)) * 100).toFixed(2));
  };


  cvs.addEventListener(
    clickEvtName,
    function (e) {
      isMouseDown = true;
      var x = device ? e.touches[0].clientX : e.clientX;
      var y = device ? e.touches[0].clientY : e.clientY;
      console.log(e.touches, 88);
      ctx.globalCompositeOperation = "destination-out";
      fillCircle.call(ctx, x, y, arg.touchRadius);
    },
    false
  );


  cvs.addEventListener(
    moveEvtName,
    function (e) {
      if (!device && !isMouseDown) {
        return false;
      }
      var x = device ? e.touches[0].clientX : e.clientX;
      var y = device ? e.touches[0].clientY : e.clientY;
      fillCircle.call(ctx, x, y, arg.touchRadius);
    },
    false
  );
}
