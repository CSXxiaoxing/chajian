/**
 * @file Scratch 涂抹蒙层插件-参考jQ
 * @param { name } - 陈盛兴 - 作者.
 * @param { email } - a251156539@163.com - 邮箱.
 * @copyright [Chen ShengXing 2019.12.12]
 * @tips 本插件适用于 ECMA-262 环境规范且不适用于IE
 * @tips [请合法使用本插件，不可用于任何违法的区域与项目，不可用于任何反中组织及反中项目；中华人民共和国万岁！！]
 */
(
  function (global, factory) {
    "use strict";
    // 模块引入，兼容node.js、sea-JS等符合CommonJS规范或类CommonJS规范的js框架
    if (typeof module === "object" && typeof module.exports === "object") {
      // 三元运算符，先判断当前环境是否支持window.document属性
      //（注意这里的形参global的实参是window）
      module.exports = global.document ?
        factory(global, true) :
        // 常规的浏览器一般都是支持的，等同于：module.exports = factory( window, true )
        function (w) {
          // 如果环境不支持window.document属性，那就抛出错误，但依旧返回功能函数（能不能用只有天知道了）
          // 此处相当于：module.exports = function (W){}
          // 调用后：const Sc = request(./Scratch.js)
          // Sc('xxx') => 抛出错误
          if (!w.document) {
            throw new Error("当前环境不支持window.document属性");
          }
          return factory(w);
        };
    } else {
      // 直接src引入
      factory(global);
    }
  }
)(
  // 判断当前执行环境是否支持window类型
  typeof window !== "undefined" ? window : this,
  function (window, noGlobal) {
    "use strict";
    // 初始点 默认参数
    var SC_INT, Default = {
      id: "", // 画布载体id
      proportion: 60, // 默认达标涂抹比例
      touchRadius: 10, // 默认手指触摸半径
      fillStyle: "#ccc", // 默认填充颜色
      fontSize: "15px", // 默认文字大小
      fontFamily: "arial", // 默认字体样式
      fontColor: "white", // 默认字体颜色
      fontText: "您获得一次刮奖机会", // 默认字体文案
      TY: 0, // 文字Y轴位置 // 判断字体位置-如不输入自定义位置-则默认居中
      TX: 0 // 文字X轴位置
    };
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
        var _s = window.getComputedStyle
          ? window.getComputedStyle(_e, null)
          : _e.currentStyle;
        return _s ? _s[_n] : null;
      }
    }
    /**
     * 设置定位-使蒙层覆盖其上方
     * @this <box节点> 载体
     */
    function setBoxStyle() {
      var _p = getStyle(this, "position");
      if (_p !== "absolute" && _p !== "relative") {
        this.style["position"] = "relative";
      }
    }
    /**
     * 必传参数检测及创建
     */
    function must(_obj) {
      if (!_obj.id) {
        throw 'GGL: id为必传值,Demo: #id'
      } else {
        run()
      }
    }
    /**
     * 创建载体
     */
    function createCVS(id) {
      // 画布载体 querySelector >= ie8
      var Box = this.Box = document.querySelector(id);
      console.log(Box, id)
      var cH = this.cH = Box.clientHeight;
      var cW = this.cW = Box.clientWidth;
      // 载体样式
      setBoxStyle.call(Box);
      // 创建画布
      var cvs = this.cvs = document.createElement("canvas");
      Box.appendChild(cvs);
      cvs.width = cW;
      cvs.height = cH;
      cvs.style["zIndex"] = 2;
      cvs.style["position"] = "absolute";
      cvs.style["left"] = "0";
      cvs.style["top"] = "0";
      this.ctx = cvs.getContext("2d");
      run()
    }
    /**
     * 设置蒙层描述高度
     */
    function SetCavMsgH(_) {
      /**
       * 判断蒙层字体位置-如不输入自定义位置-则默认居中
       * @todo 暂无换行，只支持一行
       */
      if (!this.TY) {
        this.TY = (_.cH - this.fontSize * this.fontSize / 10) / 2 + this.fontSize
      }
      var text_white = _.ctx.measureText(this.fontText).width
      if (!this.TX) {
        this.TX = (_.cW - text_white * this.fontSize / 10) / 2
      }
      run()
    }
    // 宏线程挂起
    function run(arg) {
      var t = setTimeout(function () {
        clearTimeout(t)
        SC_INT.next(arg)
      }, 0)
    }
    // Generator
    function* running(_obj) {
      // 参数描述
      var _ = {}
      must.call(SC_INT, _obj)
      yield
      // 获取屏幕可视宽度
      var clientWidth = document.documentElement.clientWidth;
      createCVS.call(_, _obj.id)
      yield;
      var { ctx, cvs, cW, cH, Box } = _;
      SetCavMsgH.call(_obj, _)
      yield;

      // 需要判断是PC还是手机
      var device = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        navigator.userAgent.toLowerCase()
      ),
        clickEvtName = device ? "touchstart" : "mousedown",
        moveEvtName = device ? "touchmove" : "mousemove";
      console.log("是否手机", device);
      // 停止涂抹
      var that = this;
      function moveEnd() {
        ctx.globalCompositeOperation = "source-over"; // 恢复默认
        isMouseDown = false;
        // 当涂抹打到一定百分比可判断完成
        if (getTransparentPercent(ctx, cW, cH) * 1 >= _obj.proportion) {
          that[1] && that[1]();
        }
        console.log("当前涂抹比例为：" + getTransparentPercent(ctx, cW, cH));
      }
      // 居中显示
      if (clientWidth * 1 > 0) {
        // Box.style.left = (clientWidth - cW) / 2 + "px";
        // 判断涂抹是否结束
        if (!device) {
          // pc端
          var isMouseDown = false;
          Box.addEventListener("mouseup", moveEnd, false);
        } else {
          // 移动端
          Box.addEventListener(
            "touchmove",
            function (e) {
              if (isMouseDown) {
                e.preventDefault();
              }
            },
            false
          );
          Box.addEventListener("touchend", moveEnd, false);
        }
      }
      if (Box.style) {
        Box.style.webkitUserSelect = "none";
        Box.style.mozUserSelect = "none";
        Box.style.msUserSelect = "none";
        Box.style.UserSelect = "none";
      }
      var cL = Box.getBoundingClientRect().left;
      var cT = Box.getBoundingClientRect().top;

      // 默认填充灰色来遮住文字
      ctx.fillStyle = _obj.fillStyle;
      ctx.fillRect(0, 0, cW, cH); // fillRect，用矩形填充
      ctx.font = `${_obj.fontSize}px ${_obj.fontFamily}`;
      ctx.fillStyle = _obj.fontColor;
      ctx.fillText(_obj.fontText, _obj.TX, _obj.TY);

      // 画圆的方法
      // @param { integer } 圆心的x坐标
      // @param { integer } 圆心的y坐标
      // @param { integer } 圆心半径
      // @param { string } 填充的颜色（本例中会通过其余代码设置为‘透明’，所以这个设置可以忽略）
      var fillCircle = function (x, y, radius, fillColor) {
        this.fillStyle = fillColor || "#eee";
        this.beginPath();
        this.moveTo(x - cL, y - cT);
        this.arc(x - cL, y - cT, radius, 0, Math.PI * 2, false); // 标准画圆
        this.fill();
      };

      // 得到涂抹的百分比
      var getTransparentPercent = function (_ctx, width, height) {
        var imgData = _ctx.getImageData(0, 0, width, height), // 得到canvas的像素信息
          pixles = imgData.data,
          transPixs = [];
        for (var i = 0, j = pixles.length; i < j; i += 4) {
          // 因为存储的结构为[R, G, B, A]，所以要每次跳4个长度
          var a = pixles[i + 3]; // 拿到存储alpha通道的值
          if (a === 0) {
            // alpha通道为0，就代表透明
            transPixs.push(i);
          }
        }
        return Number(((transPixs.length / (pixles.length / 4)) * 100).toFixed(2));
      };

      // 开始移动
      cvs.addEventListener(
        clickEvtName,
        function (e) {
          isMouseDown = true;
          var x = device ? e.touches[0].clientX : e.clientX;
          var y = device ? e.touches[0].clientY : e.clientY;
          console.log(e.touches, 88);
          ctx.globalCompositeOperation = "destination-out"; // 关键部分，描述当在canvas上再次绘画时候的情况，这个设置便是之前所说的透明
          fillCircle.call(ctx, x, y, _obj.touchRadius);
        },
        false
      );

      // 移动中
      cvs.addEventListener(
        moveEvtName,
        function (e) {
          if (!device && !isMouseDown) {
            return false;
          }
          var x = device ? e.touches[0].clientX : e.clientX;
          var y = device ? e.touches[0].clientY : e.clientY;
          fillCircle.call(ctx, x, y, _obj.touchRadius);
        },
        false
      );
    }
    /**
     * 执行函数
     * @param {object} _param
     * @callback _cb 涂层达标返回执行函数
     */
    var Sc = function (_param, _cb) {
      _param = _param || {};
      if (typeof _param === 'string') {
        _param = {
          id: _param
        }
      }
      // 组合参数
      for (var _o in Default) {
        Default[_o] = _param[_o] || Default[_o]
      }
      // 获取字体高度-只支持px单位，其余输入单位均转为px
      Default.fontSize = Default.fontSize.replace(/px|rem|rpx|em|vw|in|cm|mm|pt|pc|ex|ch|vh|vmin|%/ig, '') * 1
      try {
        SC_INT = running.call(arguments, Default)
        SC_INT.next()
      } catch (E) {
        console.error('环境不支持：', E)
      }
    }
    // 非模块引入/为直接引用
    if (!noGlobal) {
      window.$Sc = Sc
    }
    return Sc;
  }
)


