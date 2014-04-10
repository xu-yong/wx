/**
* wx
*
* 基础类库
* 提供前端所需要的各种便捷方法
* 目的是用最少代码实现丰富功能
*
* @author xuyong <xuyong@ucfgroup.com>
* @createTime 2014-03-18
* @projectHome https://github.com/xu-yong/wx
*
* Released under the MIT license:
*   http://www.opensource.org/licenses/mit-license.php
*/

(function(window, document, $, undefined){
  "use strict";

  var _winWidth   = $(window).width(),
      _winHeight  = $(window).height(),
      _globalData = {};
      
	function wx(){}
  window.wx = wx;

  wx.VERSION = "1.3.0";
  //当前页面的module,action和参数
  wx.MODULE  = "";
  wx.ACTION  = "";
  wx.REQUEST = {};
  //用于弹出框的常量值
  wx.BACK    = 0;
  wx.RELOAD  = 1;
  //全局配置信息
  wx.config  = {};

  _protoExtend();
  _browserCheck();

  $(function(){
    _pageInit();
    wx.validator();
    wx.lazyLoad();
  });

  /**
   * 渲染模板
   * @name    template
   * @param   {String}    模板ID
   * @param   {Object}    数据
   * @return  {String}    渲染好的HTML字符串
  */
  wx.template = function(id, data) {
    if(!window.template)
      return "";
    else
      return wx.trim(window.template(id, (data || {})));
  };

  /**
   * 管道节流，用于mouseover等调用频繁的优化处理
   * @name    throttle
   * @param   {Function}  真正用于执行的方法
   * @param   {Integer}   延时
   * @return  {Function}  节流方法
  */
	wx.throttle = function(fn, timeout) {
    var timer;
    return function(){
        var self = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function(){
            fn.apply(self, args);
        }, timeout);
    };
  };

  /**
   * 获得随机数，如果只传一个参数，则该参为最大数
   * @name    random
   * @param   {Integer}  最小数
   * @param   {Integer}  最大数
   * @return  {Integer}  随机数
  */
  wx.random = function(min, max) {
    if (!max) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  /**
   * 倒计时
   * @name    countDown
   * @param   {Integer}  当前到结束的时间差
   * @param   {Integer}  唯一索引，当存在多个倒计时时区分
   * @param   {Function} 显示回调方法，将传入时分秒等信息
   * @param   {Function} 倒计时结束的回调方法
  */
  wx.countDown = function(time, index, showCallback, doneCallback) {
    var initTime = new Date().getTime();
    var timeback = time;
    function start(){
      var sTime = new Date().getTime();
      var timeId = setInterval(function(){
          var offsetTime = new Date().getTime()-sTime;
          sTime = new Date().getTime();
          time -= offsetTime;
          var fTime = getFormatTime(time,0);
          if(offsetTime>1200 || offsetTime<900){
            time =  timeback - (new Date().getTime()-initTime);
          }
          if(time<=0){
              clearInterval(timeId);
              if(typeof doneCallback !== "undefined")
                  doneCallback(index);
          } else {
              showCallback && showCallback(fTime[0],fTime[1],fTime[2],fTime[3]);
          }
      },1000);
    }
    function getFormatTime(t, isShow){
      t=t/1000;
      var day    = Math.floor(t/(60*60*24));
      var hour   = Math.floor((t-day*24*60*60)/3600);
      var minute = Math.floor((t-day*24*60*60-hour*3600)/60);
      var second = Math.floor(t-day*24*60*60-hour*3600-minute*60);
      hour   = hour<10?"0"+hour:hour;
      minute = minute<10?"0"+minute:minute;
      second = second<10?"0"+second:second;
      isShow && showCallback && showCallback(day,hour,minute,second);
      return [day,hour,minute,second];
    }
    getFormatTime(time,1);
    start();
  };

  /**
   * 图片加载
   * @name    imgLoad
   * @param   {String}    图片地址
   * @param   {Function}  加载完后的回调方法
  */
  wx.imgLoad = function (url, callback) {
    var image = new Image();
    image.src = url;
    if (image.readyState) {
      image.onreadystatechange = function() {
        if (image.readyState === "loaded" || image.readyState === "complete"){
          image.onreadystatechange = null;
          callback(image.width,image.height);
        }
      };
    } else {
      image.onload = function() {
        if (image.complete)
          callback(image.width,image.height);
      };
    }
  };

  /**
   * 判断是否为空对象，与jQuery.isEmptyObject功能相似
   * @name    isEmptyObject
   * @param   {Object}  要检测的对象
   * @return  {Boolean} 是否为空对象
  */
  wx.isEmptyObject = function(object) {
    for (var key in object){
      return false;
    }
    return true;
  };

  /**
   * 获得URL中以GET方式传输的参数
   * @name    getParamByName
   * @param   {String} 要获得的参数名
   * @return  {String} 指定参数名的值
  */
  wx.getParamByName = function(name) {
    var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  };

  /**
   * 将Json数据转为String
   * @name    jsonToString
   * @param   {Object}  要转化的json对象
   * @param   {Boolean} 是否要进行转码以备URL传输
   * @return  {String}  转化后的字符串
  */
  wx.jsonToString = function(json, isEncode) {
    var strTemp = "";
    for (var key in json) {
      strTemp += key + '=' + (isEncode?encodeURIComponent(json[key]):json[key]) + '&';
    }
    return strTemp.slice(0, -1);
  };

  /**
   * 将String转为Json
   * @name    stringToJson
   * @param   {String}  要转化的字符串
   * @param   {Boolean} 是否要进行转码
   * @return  {String}  转化后的Json对象
  */
  wx.stringToJson = function(string,isDecode) {
    var tempURL = string.split('&'), json="";
    for(var i = 0;i<tempURL.length;i++){
      var t = tempURL[i].split('=');
      json += "'"+t[0]+"':'"+(isDecode?decodeURIComponent(t[1]):t[1])+"',";
    }
    return eval("({"+json.slice(0,-1)+"})");
  };

  /**
   * 去掉空格
   * @name    trim
   * @param   {String}  要去掉空格的字符串
   * @param   {Boolean} 是否去掉字符串中间的空格
   * @return  {String}  处理过的字符串
  */
  wx.trim = function(str, is_global) {
    if(!str) return "";
    var result = str.replace(/(^\s+)|(\s+$)/g, "");
    if (is_global) result = result.replace(/\s/g, "");
    return result;
  };

  /**
   * 获得页面的滚动高度，已被废弃
   * @name    getScrollTop
   * @return  {Integer}  高度
  */
  wx.getScrollTop = function() {
    return $(document).scrollTop();
  };

  /**
   * 用以解决回调地狱，参照Promise/A规范
   * @name    deferred
   * @return  {Object}  Promise对象
  */
  wx.deferred = function(){
    function Promise(){
      this.methods = [];
      this.isFirst = true;
    }
    Promise.prototype = {
      then : function(fn, context){
        this.methods.push({callback:fn,context:this});
        if(this.isFirst){
          this.next();
          this.isFirst = false;
        }
        return this;
      },
      next : function(){
        var _this = this,
            _next = this.methods.shift(),
             args = Array.prototype.slice.call(arguments);
        args.unshift(function(){
          if(_next)
            _this.next.apply(_this,arguments);
        });
        if(_next){
          _next.callback.apply(_next.context,args);
        }
      }
    };
    return new Promise();
  };

  /**
   * 数据发送
   * 使用节流方法避免双击等重复提交
   * @name    sendData
   * @param   {String}   发送地址
   * @param   {Object}   配置选项，如果为字符串则当做发送参数
   * @param   {Function} 请求返回后的回调方法
  */
  var _lastSendDataUrl,_lastUrlTimeout = wx.throttle(function(){_lastSendDataUrl="";},3000);
  wx.sendData=function(url, options, callback) {
    var ajaxObj     = null,
        _this       = this,
        timeoutId   = -1,
        timerLoadId = -1,
        currentUrl  = url+(options.param || options),
        urlParam    = options.param || ($.type(options) === "string" ? options : '');

    if(!options.dontCheck && currentUrl === _lastSendDataUrl){
      return;
    }
    _lastUrlTimeout();
    _lastSendDataUrl = currentUrl;
    if($.isFunction(options)){
      callback = options;
      options  = {};
    }
    if(options.showLoad){
       timerLoadId = window.setTimeout(function(){
          wx.loading();
       },options.loadDelay || 10);
    }
    if(options.sendTimeout){
      timeoutId = window.setTimeout(function(){ajaxObj.abort();if(callback) callback.call(_this,{status:"timeout"});wx.alert("请求超时，请稍后再试！");},options.sendTimeout||20000);
    }
    ajaxObj = $.ajax({
      type: options.type || "post",
      url: url,
      async:options.async === false ? false : true,
      context:options.context || this,
      data: urlParam,
      dataType: options.dataType || "json",
      success:function(backData, textStatus) {
        if(options.showLoad)
          wx.popClose();
        window.clearTimeout(timerLoadId);
        if(options.sendTimeout)
          window.clearTimeout(timeoutId);
        if(backData.status === 5 && (options.alertPrompt !== undefined ? options.alertPrompt : true)){
          wx.alert(backData.message || backData.info,function(){if(callback) callback.call(options.context || _this, backData, options.extData);});
        } else {
          if(callback)
            callback.call(options.context||_this, backData, options.extData);
        }
      },error:function(xhr, textStatus, errorThrown) {
        window.clearTimeout(timerLoadId);
        window.clearTimeout(timeoutId);
        if(callback)
          callback.call(_this,{status:"error",message:textStatus});
      }
    });
  };

  /**
   * 弹出loading
   * @name    loading
   * @param   {Function} 关闭后的回调方法
   * @param   {Object}   配置选项
   * @return  {String}   pop对象
  */
  wx.loading = function(callback, opts) {
    if(!$.isFunction(callback) && $.type(callback) === "object")
        opts = callback;
    opts = opts || {};

    var $temp = $('<div>'+wx.config.loading+'</div>'),
      content = $.type(callback) === "string" ? callback : (opts.text ? opts.text : null);
    if(content)
      $("[wx-pop-content]",$temp).html(content);

    return _pop($temp.html(),callback,opts);
  };

  /**
   * 弹出信息
   * @name    alert
   * @param   {String}    弹出内容
   * @param   {Function}  关闭后的回调方法
   * @param   {Object}    配置选项
   * @return  {String}    pop对象
  */
  wx.alert = function(content, callback, opts) {
    if(!content) return;
    if(!$.isFunction(callback) && $.type(callback) === "object")
      opts = callback;
    opts = opts || {};

    var $temp = $('<div>'+wx.config.alert+'</div>');
    $("[wx-pop-content]",$temp).html(content);
    if(opts.title)
      $("[wx-pop-title]",$temp).text(opts.title);
    if(opts.okText)
      $("[wx-pop-ok]",$temp).text(opts.okText);
    if(opts.noBtn)
      $("[wx-pop-close]",$temp).remove();

    return _pop($temp.html(),callback,opts);
  };

  /**
   * 弹出确认
   * @name    confirm
   * @param   {String}    弹出内容
   * @param   {Function}  确定后的回调方法
   * @param   {Object}    配置选项
  */
  wx.confirm = function(content, callback, opts) {
    if(!content) return;
    if(!$.isFunction(callback) && $.type(callback) === "object")
      opts = callback;
    opts = opts || {};

    var confirmPop,$temp = $('<div>'+wx.config.confirm+'</div>');
    $("[wx-pop-content]",$temp).html(content);
    if(opts.title)
      $("[wx-pop-title]",$temp).text(opts.title);
    if(opts.okText)
      $("[wx-pop-ok]",$temp).text(opts.okText);

    opts.shown = function(){
      $("#Js-confirm-ok").click(function(){
        if($.isFunction(callback))
          callback();
        confirmPop.close();
      });
    };
    confirmPop = _pop($temp.html(),opts);
  };

  /**
   * 弹框关闭
   * @name    popClose
  */
  wx.popClose = function() {
    if(_globalData.currentPop)
      _globalData.currentPop.close();
  };

  /**
   * 弹框
   * @name    pop
   * @param   {String}    弹出内容
   * @param   {Function}  关闭后的回调方法
   * @param   {Object}    配置选项
   * @return  {String}    pop对象
  */
  wx.pop = function(content, callback, opts) {
    if(!content) return;
    if(!$.isFunction(callback) && $.type(callback) === "object")
      opts = callback;
    opts = opts || {};
    var temp;
    if(/^#/.test(content)){
      if(!$(content).length) return;
      temp = '<div class="pop form" '+(opts.width ? 'style="width:'+opts.width+'"': '')+'>'+$(content).html()+'</div>';
      if(opts.removeAfterShow)
       $(content).remove();
    } else{
      temp = '<div class="pop form" '+(opts.width ? 'style="width:'+opts.width+'"': '')+'>'+content+'</div>';
    }
    return _pop(temp,callback,opts);
  };

  //弹框的核心方法
	function _pop(content, callback, opts) {
    if(!$.isFunction(callback) && $.type(callback) === "object")
      opts = callback;
    opts = opts||{};

    if(callback === wx.RELOAD){
      callback = function(){
        location.reload();
      };
    } else if(callback === wx.BACK){
      callback = function(){
        history.back(-1);
      };
    } else if(callback && $.type(callback) === "string"){
      var jumpUrl = callback;
      callback = function(){
        location.href = jumpUrl;
      };
    }
    $(".Js-pop").stop().remove();
    var htmlText = content;
    var temp = _getShadeLayer("Js-pop")+
                "<div id='Js-pop-body' class='Js-pop' style='position: absolute; z-index:21'>"+
                  htmlText+
                "</div>";
    $("body").append(temp).keyup(function(event){
      if(event.keyCode === 27)
        _close();
    });

    $("#Js-pop-body").children().show();
    _setEleToCenter("#Js-pop-body",opts);
    _moveAction(".title","#Js-pop-body");

    function _close(){
      if(opts.attachBg) $("body").css("overflow","auto");
      $("body").unbind("keyup");
      $(".Js-pop-close").unbind("click");
      _closeAni("#Js-pop-body",function(){
         $(".Js-pop").hide().remove();
      },opts);
      _globalData.currentPop = null;
    }

    if(opts.layerClick){
      $("#Js-shadeLayer").unbind("click").click(function(){
        _close();
      });
    }
    if(opts.attachBg){
      $("body").css("overflow","hidden");
    }
    _popAni("#Js-pop-body",function(){
      _pluginCheck("#Js-pop-body");
      if($.isFunction(opts.shown)){
        opts.shown();
      }
      if(wx.browser.msie && wx.browser.version === 6){
        if(typeof DD_belatedPNG !== "undefined") DD_belatedPNG.fix('.ie6fixpic');
      }
      wx.validator();
      $(".Js-pop-close").click(function(){
       _close();
       if($.isFunction(callback))
          callback();
       else if($.isFunction(opts.close))
          opts.close();
      });
      if(opts.autoClose){
        window.setTimeout(function(){
          _close();
        },opts.autoCloseTime || 3000);
      }
    },opts);

    _globalData.currentPop = {
      close : _close,
      open  : function(){
        _pop(htmlText,callback,opts);
      }
    };

    return _globalData.currentPop;
  }

  //弹出效果
  function _popAni(id, callback, opts) {
    if(!$.isFunction(callback) && $.type(callback) === "object")
      opts = callback;
    opts = opts||{};
    var o  = $(id);
    if(opts.notAni){
      o.show();
      if($.isFunction(callback))
        callback();
    } else {
      var top = parseInt(o.css("top").slice(0,-2));
      o.css("opacity",0);
      o.stop().animate({"opacity":1,"top":top+30},400,$.isFunction(callback)?callback:undefined);
    }
  }

  //弹出关闭
  function _closeAni(id, callback, opts) {
    if(!$.isFunction(callback) && $.type(callback) === "object")
      opts = callback;
    opts = opts||{};
    var o = $(id);
    if(opts.notAni){
      $("#Js-shadeLayer").css("opacity",0);
      o.css("opacity",0);
      if(callback)
        callback();
    } else {
      var top = parseInt(o.css("top").slice(0,-2));
      $("#Js-shadeLayer").animate({"opacity":0},200);
      o.stop().animate({"opacity":0,"top":top-30},300,callback);
    }
  }

  //将元素设置为居中
  function _setEleToCenter(eleId, opts) {
    opts = opts || {};
    var y      = opts.offsetY || -150,
        $ele   = $(eleId),
        width  = $ele.width(),
        height = $ele.height();

    if((wx.browser.msie && wx.browser.version <= 7) || opts.scrollFollow){
      y += $(document).scrollTop()+_winHeight/2-height/2;
      $ele.css("position","absolute");
    } else {
      y += _winHeight/2-height/2;
      $ele.css("position","fixed");
    }
    $ele.css({"top" : opts.y || (y<0 ? 10 : y),
              "left": opts.x || (_winWidth/2-width/2+(opts.offsetX||0)) });
  }

    
  //使元素可拖拽移动
  function _moveAction(moveBar, moveBody) {
    var isMove      = false,
        lastX       = -1,
        lastY       = -1,
        offsetX     = -1,
        offsetY     = -1,
        $winBody    = $("body"),
        $moveBar    = $(moveBar),
        $moveBody   = $(moveBody),
        isAbsoluate = $moveBody.css("position") === "absolute" ? true : false;

    if($moveBar.length === 0 || $moveBody.length === 0) return;
    $moveBar.css("cursor","move").unbind("mousedown").
      bind("mousedown",function(event){
        event.preventDefault();
        var body  = $moveBody,
            tempX = body.offset().left,
            tempY = body.offset().top - (isAbsoluate ? 0 : $(document).scrollTop());
        isMove  = true;
        lastX   = event.clientX;
        lastY   = event.clientY;
        offsetX = event.clientX - tempX;
        offsetY = event.clientY - tempY;
        $winBody.unbind("mousemove").bind("mousemove",function(event){
            if(!isMove) return false;
            event.preventDefault();
            event.stopPropagation();
            lastX = event.clientX - lastX;
            lastY = event.clientY - lastY;
            body.css({"left" : event.clientX-lastX-offsetX,"top" : event.clientY-lastY-offsetY});
            lastX = event.clientX;
            lastY = event.clientY;
        });
    }).unbind("mouseup").bind("mouseup",function(event){
        isMove = false;
        $winBody.unbind("mousemove");
    });
    $winBody.unbind("mouseup").bind("mouseup",function(){
        isMove = false;
    });
    $moveBar.blur(function(){
        isMove = false;
        $winBody.unbind("mousemove");
    });
  }

   //获得蒙版层
  function _getShadeLayer(layerClass) {
    var window_height = $('body').outerHeight() > _winHeight?$('body').outerHeight() : _winHeight;
    return '<div id="Js-shadeLayer" class="'+layerClass+' pop-bg ie6fixpic" style="width:'+_winWidth+'px;height:'+window_height+'px;"></div>';
  }

  /**
   * 获取cookie和设置cookie
   * @name    cookie
   * @param   {String}  名字
   * @param   {String}  值
   * @param   {Object}  配置选项
   * @return  {String}  当只有名字时返回名字对应值
  */
  wx.cookie = function(name, value, options) {
    if (typeof value !== 'undefined') {
      options = options || {};
      if (value === null) {
        value = '';
        options = $.extend({}, options);
        options.expires = -1;
      }
      var expires = '';
      if (options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {
        var date;
        if (typeof options.expires === 'number') {
          date = new Date();
          date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
        } else {
          date = options.expires;
        }
        expires = '; expires=' + date.toUTCString();
      }
      var path = options.path ? '; path=' + (options.path) : ';path=/';
      var domain = options.domain ? '; domain=' + (options.domain) : '';
      var secure = options.secure ? '; secure' : '';
      document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else {
      var cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var cookie = wx.trim(cookies[i]);
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }
  };

  /**
   * 删除cookie的快捷方法
   * @name    removeCookie
   * @param   {String}  名字
  */
  wx.removeCookie = function(key) {
    wx.cookie(key,'',{expires:-1});
  };

  //创建flash对象
  function _createSwfObject(src, attributes, parameters) {
    var i, html, div, obj, attr = attributes || {}, param = parameters || {};
    $.extend(param, {wmode:"transparent",allowScriptAccess:"always",quality:"high",menu:"false",scale:"noScale",bgcolor:"#E0F8E2"});
    
    attr.type = 'application/x-shockwave-flash';
    if (window.ActiveXObject) {
      attr.classid = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
      param.movie = src;
    } else {
      attr.data = src;
    }
    html = '<object';
    for (i in attr) {
      html += ' ' + i + '="' + attr[i] + '"';
    }
    html += '>';
    for (i in param) {
      html += '<param name="' + i + '" value="' + param[i] + '" />';
    }
    html += '</object>';
    div = document.createElement('div');
    div.innerHTML = html;
    obj = div.firstChild;
    div.removeChild(obj);
    return obj;
  }

  /**
   * 加载flash文件
   * @name    loadFlash
   * @param   {String}    名字
   * @param   {Object}    属性
   * @param   {Object}    参数
   * @param   {Function}  加载后的回调方法
   * @return  {Object}    包含flash的object元素
  */
  wx.loadFlash = function(flashName, attrs, options, callback) {
    callback = callback || function(){};
    if($("#"+attrs.id).length){
        callback(window[attrs.id]);
        return "";
    } else{
      //此方法由actionscript调用
      window.wxFlashLoaded = function(){
        callback(window[attrs.id]);
      };
      return _createSwfObject((wx.config.flashUrl || wx.config.baseUrl)+"flash/"+flashName+'.swf?t='+new Date().getTime(),attrs, options);
    }
  };

  /**
   * 本地存储，在低版本下使用flash解决
   * @name    data
   * @param   {String}    名字
   * @param   {String}    参数
   * @param   {Function}  通过回调方法获取值
  */
  wx.data = function(key, value, callback) {
    var ls = window.localStorage;
    if(ls){
        if($.isFunction(value)){
          value(ls.getItem(key));
        } else {
          if(!callback){
            callback = function(isSucc){
              if(!isSucc && typeof isSucc !== "undefined") throw new Error("wx.data localStorage error");
            };
          }
          if(value === -1)
            callback(ls.removeItem(key));
          else
            callback(ls.setItem(key,value));
        }
    } else {
      var flash = wx.loadFlash("wx",{id:"wx-falsh",width:1,height:1},{},function(flashObj){
        if($.isFunction(value)){
          value(flashObj.loadData(key));
        } else {
          if(!callback){
            callback = function(isSucc){
              if(!isSucc) throw new Error("wx.data flash error");
            };
          }
          if(value === -1)
            callback(flashObj.deleteData(key));
          else
            callback(flashObj.saveData(key,value));
        }
      });
      $("body").append(flash);
    }
  };

  /**
   * 表单验证
   * @name    validator
  */
  wx.validator = function() {
    var prefix = wx.validator.config["validatorPrefix"],
        $form  = $("form["+prefix+"]");
    $form.each(initElement);

    function initElement(){
      var $thisForm = $(this),
          formInfo  = getFormInnerElement($thisForm);
      if($thisForm.data("hasValidator"))
        return;
      $thisForm.attr("autocomplete","off");
      $("a[type='submit']",$thisForm).click($.proxy(checkAll,this));
      $thisForm.submit($.proxy(checkAll,this));
      formInfo.$input.filter(":visible :last").keydown(function(event) {
        if(event.keyCode === 13) $thisForm.submit();
      });
      formInfo.$select.each(function(){
        var $thisSelect = $(this),
            thisAttr    = {"va" : $thisSelect.attr(prefix+"-error-value"),
                           "me" : prefix+"-"+$thisSelect.attr("name")+"-error",
                           "st" : $thisSelect.attr(prefix+"-show-type") || "normal",
                           "su" : $("#"+prefix+"-"+$thisSelect.attr("name")+"-success",$thisForm),
                           "nt" : typeof $thisSelect.attr(prefix+"-notip") !== "undefined"};

        $thisSelect.blur(function(){
          var $this = $(this);
          $("#"+thisAttr["me"]).hide();
          thisAttr["su"].hide();
          if(wx.trim($this.val()) === wx.trim(thisAttr["va"])){
            setFirstErrorMessage($thisForm,$this.attr(thisAttr["me"]));
            if(!thisAttr["nt"]){
              if($("#"+thisAttr["me"]).length){
                $("#"+thisAttr["me"]).show();
              } else if($this.attr(thisAttr["me"])){
                if(thisAttr["st"] === "pop")
                  wx.alert($this.attr(thisAttr["me"]));
                else
                  $this.after('<'+formInfo.errTag+' id="'+thisAttr["me"]+'" class="'+formInfo.errClass+'">'+$this.attr(thisAttr["me"])+'</'+formInfo.errTag+'>');
              }
            }
            $thisForm.data("valid",false);
          } else if(thisAttr["su"].length){
            thisAttr["su"].show();
          }
        });
      });
      formInfo.$checkbox.each(function(){
        var $thisCheckbox = $(this),
            thisAttr      = {"nc" : prefix+"-"+$thisCheckbox.attr("name")+"-nocheck",
                             "st" : $thisCheckbox.attr(prefix+"-show-type") || "normal",
                             "su" : $("#"+prefix+"-"+$thisCheckbox.attr("name")+"-success",$thisForm),
                             "nt" : typeof $thisCheckbox.attr(prefix+"-notip") !== "undefined"};
        thisAttr["me"] = $thisCheckbox.attr(thisAttr["nc"]);
        $thisCheckbox.blur(function(){
          $("#"+thisAttr["nc"]).hide();
          thisAttr["su"].hide();
          if(!$thisCheckbox.is(":checked") && thisAttr["me"]){
            setFirstErrorMessage($thisForm,thisAttr["me"]);
            if(!thisAttr["nt"]){
              if($("#"+thisAttr["nc"]).length){
                $("#"+thisAttr["nc"]).show();
              } else {
                if(thisAttr["st"] === "pop")
                  wx.alert(thisAttr["me"]);
                else
                  $thisCheckbox.after('<'+formInfo.errTag+' id="'+thisAttr["nc"]+'" class="'+formInfo.errClass+'">'+thisAttr["me"]+'</'+formInfo.errTag+'>');
              }
            }
            $thisForm.data("valid",false);
          } else if(thisAttr["su"].length){
            thisAttr["su"].show();
          }
        });
      });
      formInfo.$input.each(function(){
        var $thisInput = $(this),
            thisAttr   = {"ph" : $thisInput.attr(prefix+"-placeholder"),
                          "et" : ($thisInput.attr(prefix+"-event-type") || "blur"),
                          "ru" : $thisInput.attr(prefix+"-rule"),
                          "pa" : $thisInput.attr(prefix+"-param"),
                          "ls" : $thisInput.attr(prefix+"-left-show"),
                          "lm" : $thisInput.attr(prefix+"-left-mode") || "normal",
                          "st" : $thisInput.attr(prefix+"-show-type") || "normal",
                          "na" : prefix+"-"+$thisInput.attr("name")+"-",
                          "nt" : typeof $thisInput.attr(prefix+"-notip") !== "undefined",
                          "nb" : $thisInput.attr(prefix+"-noBasicRule")};
        if(formInfo.autocomp === "off"){
          $thisInput.val("");
        }
        if(thisAttr["ph"]){
          if('placeholder' in this){
            $thisInput.attr("placeholder",thisAttr["ph"]);
            $thisForm.data("placeholder",true);
          } else {
            $thisForm.data("placeholder",false);
            $thisInput.css("color","gray");
            if(!$thisInput.val())
                $thisInput.val(thisAttr["ph"]);
            $thisInput.bind("click focus",function(){
              if($thisInput.val() === thisAttr["ph"])
                $thisInput.val("");
            });
            $thisInput.blur(function(){
              if($thisInput.val().length === 0){
                $thisInput.css("color","gray");
                $thisInput.val(thisAttr["ph"]);
              }
            });
            $thisInput.bind("propertychange",function(){
              if($thisInput.val() === thisAttr["ph"])
                $thisInput.css("color","gray");
              else
                $thisInput.css("color","black");
            });
          }
        }
        $thisInput.bind(thisAttr["et"],function(){
            if(!thisAttr["ru"])
              return;
            var inputValue = $thisInput.val() === thisAttr["ph"] ? "" : wx.trim($thisInput.val(),"g"),
                inputParam = thisAttr["pa"] ? thisAttr["pa"].split("|") : "",
                $inputSucc = $("#"+thisAttr["na"]+"success",$thisForm),
                $inputErro = $("#"+thisAttr["na"]+"error",$thisForm),
                inputValid = true;

            $("[id^='"+thisAttr["na"]+"']",$thisForm).not("#"+thisAttr["na"]+"left").hide();
            $inputSucc.hide();

            $.each(thisAttr["ru"].split("|"),function(i,n){
              if(wx.validator.rule[n] && !wx.validator.rule[n](inputValue,inputParam[i] || "")){
                var errorFlag = thisAttr["na"]+n,
                    errorText = $thisInput.attr(errorFlag) || wx.validator.config[n].replace("@",inputParam[i]||"");
                inputValid = false;
                setFirstErrorMessage($thisForm,errorText);
                if(!thisAttr["nt"]){
                  if($inputErro.length){
                    $inputErro.show();
                  } else if($("#"+errorFlag,$thisForm).length){
                    $("#"+errorFlag,$thisForm).show();
                  } else {
                    if(thisAttr["st"] === "pop")
                      wx.alert(errorText);
                    else
                      $thisInput.after('<'+formInfo.errTag+' id="'+errorFlag+'" class="'+formInfo.errClass+'">'+errorText+'</'+formInfo.errTag+'>');
                  }
                }
                $thisForm.data("valid",false);
                return false;
              }
          });
          if(inputValid && $inputSucc.length)
            $inputSucc.show();
        });
        if(thisAttr["ls"]){
          var $leftShowTo = $("#"+thisAttr["na"]+"left",$thisForm),
              mode        = (thisAttr["lm"] === "byte" ? 1 : 0),
              maxLength   = parseInt(thisAttr["ls"]),
              inputColor  = $leftShowTo.css("color");
          if(!$leftShowTo.length) return;
          $thisInput.bind("keyup",function(){
            var allCount = mode ? $(this).val().getBytes() : $(this).val().length,
               leftCount = maxLength - allCount;
            if(leftCount>=0){
                $leftShowTo.css("color",inputColor);
            }
            else{
                $leftShowTo.css("color","red");
            }
            $leftShowTo.text(leftCount);
          });
        }
      });
      $thisForm.data("hasValidator",true);
    }
    function checkAll(event, isNoConfirm) {
      var $thisForm  = $(this),
          isAjax     = typeof $thisForm.attr(prefix+"-ajax") !== "undefined" ? "&ajax=1" : "",
          handleAjax = $thisForm.attr(prefix+"-ajax") || $thisForm.attr(prefix+"-ajax-action"),
          action     = $thisForm.attr("action"),
          callback   = $thisForm.attr("name"),
          formInfo   = getFormInnerElement($thisForm);
      $thisForm.data("valid",true);
      setFirstErrorMessage($thisForm,0,1);
      formInfo.$input.each(function(){
        var $thisInput = $(this);
        $thisInput.trigger($thisInput.attr(prefix+"-event-type")||"blur");
        if(!$thisForm.data("placeholder") && $thisInput.val() === $thisInput.attr(prefix+"-placeholder"))
          $thisInput.val("");
      });
      formInfo.$select.trigger("blur");
      formInfo.$checkbox.trigger("blur");
      var $submitErr = $("#"+prefix+"-submit-error");
      $submitErr.hide();

      if(!$thisForm.data("valid")){
        if(window.returnValue) window.returnValue = false;
        event.preventDefault();
        var message = $submitErr.length || formInfo.$submitBn.attr(prefix+"-submit-error");
        if(message){
          if($.type(message) === "number")
            $submitErr.show();
          else
             wx.alert(message);
        } else if(typeof formInfo.$submitBn.attr(prefix+"-get-error") !== "undefined"){
          wx.alert(getFirstErrorMessage($thisForm));
        }
      } else {
        var confirmText = formInfo.$submitBn.attr(prefix+"-submit-confirm");

        if(confirmText && !isNoConfirm){
          wx.confirm(confirmText,function(){
            $thisForm.trigger("submit",true);
          });
          return false;
        }
        if(window[callback+"_before"] && !window[callback+"_before"]($thisForm,$(event.target))){
            return false;
        }
        if(isAjax){
          if(window.returnValue) window.returnValue = false;
          event.preventDefault();
          if(handleAjax){
            wx.sendData(action,$thisForm.serialize()+isAjax,function(ajData){
              if(ajData.status === 1)
                wx.alert(ajData.info||ajData.message,handleAjax.toUpperCase() === "JUMP" ? ajData.jump : wx[handleAjax.toUpperCase()]);
              else
                wx.alert(ajData.info||ajData.message);
            });
          } else{
            wx.sendData(action,$thisForm.serialize()+isAjax,$.isFunction(window[callback]) ? window[callback] : undefined);
          }
        }
      }
      if(!$thisForm.data("placeholder")) {
        formInfo.$input.each(function(){
          var $thisInput  = $(this),
              placeholder = $thisInput.attr(prefix+"-placeholder");
          if($thisInput.val().length === 0 && placeholder)
            $thisInput.val(placeholder);
        });
      }
    }
    function getFormInnerElement($form){
      return{
        $checkbox : $("input[type=checkbox]",$form),
        $select   : $("select",$form),
        $input    : $("input,textarea",$form).not("[type=submit]").not("[type=radio]").not("[type=checkbox]"),
        $submitBn : $("a[type='submit']",$form).length ? $("a[type='submit']",$form) : $("input[type='submit']",$form),
        errClass  : $form.attr(prefix+"-error-class")||"error-text",
        errTag    : $form.attr(prefix+"-error-tag")||"span",
        autocomp  : $form.attr(prefix+"-autocomplete")||"on"
      };
    }
    function setFirstErrorMessage($form, message, reset){
      if(!$form.data("firstError") || reset)
        $form.data("firstError",message);
    }
    function getFirstErrorMessage($form){
      return $form.data("firstError");
    }
  };
  wx.validator.config = {
    "validatorPrefix" : "wx-validator",
    "required"        : "不能为空",
    "email"           : "请填写正确的电子邮箱",
    "mobile"          : "请填写正确的手机号码",
    "telphone"        : "请填写正确的固定电话",
    "range"           : "请输入区间在@的数字或字母",
    "min"             : "请输入不小于@的数字或字母",
    "max"             : "请输入不大于@的数字或字母",
    "rangeEqual"      : "请输入@位的数字或字母",
    "rangelength"     : "请输入@位的数字或字母",
    "minLength"       : "请输入不小于@位的数字或字母",
    "maxLength"       : "请输入不大于@位的数字或字母",
    "byteRangeEqual"  : "请输入@位的数字或字母",
    "byteRangeLength" : "请输入@位的数字或字母",
    "byteMinLength"   : "请输入不小于@位的数字或字母",
    "byteMaxLength"   : "请输入不大于@位的数字或字母",
    "equalTo"         : "请保持所填写的内容一致",
    "digits"          : "请填写数字",
    "post"            : "请填写正确的邮编号码",
    "noSymbol"        : "不能有符号",
    "url"             : "请使用正确格式，如http://www.website.com"
  };

  /**
   * 为验证添加新规则
   * @name    addNewRule
   * @param   {String}    规则名称
   * @param   {String}    错误信息
   * @param   {Function}  验证方法
  */
  wx.validator.addNewRule = function(ruleName,errorMessage,fn){
    if(!ruleName || !errorMessage || !fn) return;
    wx.validator.rule[ruleName]   = fn;
    wx.validator.config[ruleName] = errorMessage;
  };

  wx.validator.rule = {
    required: function(value){
      return value.length > 0;
    },
    email: function(value) {
      return value.length === 0 || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
    },
    mobile: function(value){
      return value.length === 0 || /^1[3|4|5|8][0-9]\d{8}$/.test(value);
    },
    telphone: function(value){
      return value.length === 0 || /^(\d{3}-\d{8}|\d{4,5}-\d{7,8})$/.test(value);
    },
    range: function(value, param) {
      param = param.split("-");
      return value.length === 0 || (value >= parseFloat(param[0]) && value <= parseFloat(param[1]));
    },
    min: function(value, param ) {
      return value.length === 0 || (value >= parseFloat(param));
    },
    max: function( value, param ) {
      return value.length === 0 || value <= parseFloat(param);
    },
    rangeEqual: function(value, param) {
      return  value.length === 0 ||  value.length === param.length;
    },
    rangelength: function(value, param) {
      param = param.split("-");
      return  value.length === 0 || ( value.length >= parseInt(param[0]) && value.length <= parseInt(param[1]) );
    },
    minLength:function(value, param){
      return value.length === 0 || value.length >= parseInt(param);
    },
    maxLength:function(value, param){
      return value.length === 0 || value.length <= parseInt(param);
    },
    byteRangeLength: function(value, param) {
      param = param.split("-");
      return  value.length === 0 || ( value.getBytes() >= parseInt(param[0]) && value.getBytes() <= parseInt(param[1]) );
    },
    byteMinLength: function(value,param){
      return value.length === 0 || value.getBytes() >= parseInt(param);
    },
    byteMaxLength:function(value, param){
      return value.length === 0 || value.getBytes() <= parseInt(param);
    },
    byteRangeEqual: function(value, param) {
      return  value.length === 0 ||  value.getBytes() === param.length;
    },
    equalTo: function(value, equalToElement) {
      return value.length === 0 || value.length>0 && value === $("input[name='"+equalToElement+"']").val();
    },
    digits: function(value) {
      return value.length === 0 || /^\d+$/.test(value);
    },
    post: function(value) {
      return value.length === 0 || /^[0-9]{6}$/.test(value);
    },
    passport: function(value) {
      return value.length === 0 || /^1[45][0-9]{7}$|^G[0-9]{8}$|^P[0-9]{7}$|^S[0-9]{7,8}$|^D[0-9]+$/.test(value);
    },
    noSymbol: function(value) {
      return value.length === 0 || /^[\w|\u4e00-\u9fa5]*$/.test(value);
    },
    url: function(value){
      return value.length === 0 || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    },
    basic:function(value){
      return !/select|update|delete|truncate|join|union|exec|insert|drop|count|'|"|;|>|<|%/i.test(value);
    }
  };

  /**
   * 懒加载
   * @name    lazyLoad
   * @param   {String}    运行上下文
  */
  wx.lazyLoad = function(context) {
    var $els = $(context || "body").find("[wx-lz]:visible"),
        showType = wx.config.lazyLoadShowType,
        threshold  = wx.config.lazyLoadThreshold;

    if(!$els.length) return;

    $els.one("appear",function(){
      var $self = $(this),
          url   = $self.attr("wx-lz");
      $self.loaded = true;
      $self.hide();
      $("<img />").on("load", function(){
        if($self.is("img"))
          $self.attr("src",url);
        else
          $self.css("background-image","url("+url+")");
        $self[showType]();
      }).attr("src",url);
    });

    function update(){
      $els.each(function(){
        var $self = $(this);
        if($self.loaded) return;
        checkPos($self);
      });
    }

    function checkPos($el){
      var scroll = $(document).scrollTop()+_winHeight;
      if($el.position().top < scroll+threshold){
        $el.trigger('appear');
      }
    }

    $(window).on("scroll",wx.throttle(update,100));
    update();
  };

  //页面初始化
  function _pageInit() {
    if(window.console === undefined){
      window.console = {log:function(){}};
    } else {
      wx.log = function(text){
        console.log("%c"+text,"color:red;font-size:20px;font-weight:bold");
      };
    }

    if(!wx.config.baseUrl){
      var url = $("script:first").attr("src").split('/');
      var src = url.slice(0,url.indexOf("js"));
      wx.config.baseUrl = src.length ? src.join('/')  + '/' : './';
    }

    if(wx.config.loading){
      _pageSetup();
    } else if(wx.config.baseUrl){
      var ls = window.localStorage;
      if(ls){
        var lastVersion = ls.getItem("wxVersion");
        if(lastVersion && lastVersion === wx.VERSION){
          window.setTimeout(function(){
           wx.config = wx.stringToJson(ls.getItem("wxconfig"),true);
           _pageSetup();
          },0);
        } else {
          $.getScript(wx.config.baseUrl+"js/wx.config.js",function(){
              _pageSetup();
              if(wx.config.cache){
                ls.setItem("wxVersion",wx.VERSION);
                ls.setItem("wxconfig",wx.jsonToString(wx.config,true));
              }
          });
        }
      } else {
        $.getScript(wx.config.baseUrl+"js/wx.config.js",_pageSetup);
      }
    } else {
      wx.log("请设置静态文件路径");
    }
  }

  //页面构建
  function _pageSetup() {
    _pluginCheck();

    try{
      var path = location.pathname.substring(1).split("/");
      if(wx.config.route == 1){
        if(path[1]){
          for (var i = 0,list = path[1].split("-"),len = list.length; i < len; i+=2) {
            wx.REQUEST[list[i]] = list[i+1];
          }
        }
        wx.MODULE = path[0].split("-")[0];
        wx.ACTION = path[0].split("-")[1] || "index";
      }
    }
    catch(e){wx.log("路径解析错误");}

    if($.isFunction(window.wxInit))
      window.wxInit();
  }

  //对原生进行扩展
  function _protoExtend(){
    var arrayProto = Array.prototype,stringProto = String.prototype;
    if(stringProto.getBytes === undefined){
      stringProto.getBytes = function() {
        var cArr = this.match(/[^x00-xff]/ig);
        return this.length + (cArr === null ? 0 : cArr.length);
      };
    }
    if(arrayProto.remove === undefined){
      arrayProto.remove = function(index){
        return index > this.length ? this : this.splice(index,1) && this;
      };
    }
    if(arrayProto.indexOf === undefined){
      arrayProto.indexOf = function(value){
        for (var i = 0,len = this.length; i < len; i++) {
          if(this[i] === value)
            return i;
        }
        return -1;
      };
    }
  }

  //浏览器类型
  function _browserCheck(){
    wx.browser = wx.browser || {version:0};
    var ua = navigator.userAgent.toLowerCase(),
      msie = ua.indexOf("compatible") !== -1 && ua.indexOf("msie") !== -1;

    if(msie){
      wx.browser.msie = true;
      /msie (\d+\.\d+);/.test(ua);
      wx.browser.version = parseInt(RegExp.$1);
    }
  }

  //插件检测
  function _pluginCheck(context){
    var $body = $(context || "body");

    var $wxUpload = $body.find("input[wx-upload]");
    _uploadPlugin($wxUpload);
  }

  function _uploadPlugin($upload) {
    var load = null;
    if($upload.length){
      if(wx.upload){
        uploadOnLoad();
      }
      else{
       $upload.click(function(){load = wx.loading("正在加载，请等待...");});
        $.getScript(wx.config.baseUrl+"js/wx.upload.js",uploadOnLoad);
      }
    }
    function uploadOnLoad(){
      if(load){
        load.close();
        load = null;
      }
      $upload.unbind("click").each(function(){
        wx.upload($(this));
      });
    }
  }
  
})(window, document, jQuery);