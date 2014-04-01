/**
* wx.config
*
* wx配置文件
* 在开启cache情况下，此文件只有在主文件的版本号更新时才会再次被下载
*
* @author xuyong <xuyong@ucfgroup.com>
* @createTime 2014-03-18
* @version 1.0.0
* Released under the MIT license:
*   http://www.opensource.org/licenses/mit-license.php
*/


if(typeof wx !== "undefined" && typeof jQuery !== "undefined"){
  $.extend(wx.config, {

    //是否缓存此文件
    cache : true,

    /**
    路由地址类型
      0 不解析
      1 解析格式为：/module-action/param-1
    */
    route : 1,

    //默认上传地址
    uploadUrl : '',

    //默认上传类型
    uploadType : 'jpeg|jpg|png|gif',

    //默认上传文件大小，以MB为单位
    uploadSize : '2',

    //弹出框loading结构
    loading : '<div class="pop-box pop-loading" style="width:300px;">\
      <div class="pop-body">\
        <p wx-pop-content>&nbsp;&nbsp;&nbsp;请等待...</p>\
        </div>\
      </div>',

    //弹出框alert结构
    alert: '<div class="pop alert">\
      <div class="pop-box">\
        <div class="title">\
            <h3 wx-pop-title>提示</h3>\
            <a href="javascript:;" class="btn-close common-sprite ie6fixpic Js-pop-close" wx-pop-close>×</a>\
        </div>\
        <div class="pop-body">\
            <div class="pop-info">\
                <h3 wx-pop-content></h3>\
            </div>\
            <div wx-pop-close class="btn">\
                <a class="btn-base btn-red-h30 common-sprite Js-pop-close">\
                    <span wx-pop-ok class="common-sprite">确定</span>\
                </a>\
            </div>\
        </div>\
      </div>\
    </div>',

    //弹出框confirm结构
    confirm : '<div class="pop confirm">\
      <div class="pop-box">\
      <div class="title">\
        <h3 wx-pop-title>提示</h3>\
        <a href="javascript:;" class="btn-close common-sprite ie6fixpic Js-pop-close">×</a>\
      </div> \
      <div class="pop-body">\
        <div class="pop-info">\
          <h3 wx-pop-content></h3>\
        </div>\
        <div class="btn">\
          <a id="Js-confirm-ok" class="btn-base btn-red-h30 common-sprite">\
            <span class="common-sprite" wx-pop-ok>确认</span>\
          </a>\
          <a class="btn-base btn-gray-h30 common-sprite Js-pop-close">\
            <span class="common-sprite">取消</span>\
          </a>\
        </div>\
      </div>\
      </div>\
    </div>'
  });
}