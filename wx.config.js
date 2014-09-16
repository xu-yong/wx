/**
* wx.config
*
* wx配置文件
* 在开启cache情况下，此文件只有在主文件的版本号更新时才会再次被下载
*
* @author xuyong <xuyong@ucfgroup.com>
* @createTime 2014-03-18
* @version 1.0.0
* @projectHome https://github.com/xu-yong/wx
*
* Released under the MIT license:
*   http://www.opensource.org/licenses/mit-license.php
*/


if(typeof wx !== "undefined" && typeof jQuery !== "undefined"){
  $.extend(wx.config, {

    //是否缓存此文件
    cache : true,

    //flash文件地址，如未指定将使用baseUrl
    flashUrl : '',

    /**
    路由地址类型
      0 不解析
      1 解析格式为：/module-action/param-1
    */
    route : 0,

    //默认上传地址
    uploadUrl : '',

    //默认上传类型，全部支持为 *
    uploadType : 'jpeg|jpg|png|gif',

    //默认上传文件大小，以MB为单位
    uploadSize : '2',

    //懒加载的显示类型，可以是show或者是fadeIn
    lazyLoadShowType : 'show',

    //懒加载临界点
    lazyLoadThreshold : 100,

    //ajax请求返回数据成功与否的标示字段
    dataFlag : 'status',

    //ajax请求返回数据中的描述信息，用于向用户展示
    dataInfo : 'info',

    //ajax请求返回数据成功与否的判断数值
    dataSuccessVal : '1',

    //ajax请求返回数据中用于定义业务异常展示的数值
    dataDefaultAlertVal : '5',

    //ajax请求返回数据中用于获得跳转地址的字段
    dataJumpFlag : 'jump',

    //模板引擎解析时使用的开始标示符
    tplOpenTag : "<%",

    //模板引擎解析时使用的结束标示符
    tplCloseTag : "%>",

    //弹出框loading结构
    loading: '<table class="ui-dialog">\
      <tbody>\
          <td class="ui-dialog-body">\
            <div class="ui-dialog-content"><%content||"&nbsp;&nbsp;&nbsp;请等待..."%></div>\
          </td>\
        </tr>\
      </tbody>\
    </table>',

    //弹出框alert结构
    alert: '<table class="ui-dialog">\
      <tbody>\
        <tr class="title">\
          <td class="ui-dialog-header">\
            <%if(!noBtn){%>\
              <button class="ui-dialog-close Js-pop-close" title="取消">×</button>\
            <%}%>\
            <div class="ui-dialog-title"><%title||"提示"%></div>\
          </td>\
        </tr>\
        <tr>\
          <td class="ui-dialog-body">\
            <div class="ui-dialog-content"><%content%></div>\
          </td>\
        </tr>\
        <tr>\
          <td class="ui-dialog-footer">\
            <div class="ui-dialog-button">\
            <%if(!noBtn){%>\
              <button class="ui-dialog-autofocus Js-pop-close" type="button"><%okText||"确 定"%></button>\
            <%}%>\
            </div>\
          </td>\
        </tr>\
      </tbody>\
    </table>',

    //弹出框confirm结构
    confirm: '<table class="ui-dialog">\
      <tbody>\
        <tr class="title">\
          <td class="ui-dialog-header">\
            <button class="ui-dialog-close Js-pop-close" title="取消">×</button>\
            <div class="ui-dialog-title"><%title||"消息"%></div>\
          </td>\
        </tr>\
        <tr>\
          <td class="ui-dialog-body">\
            <div class="ui-dialog-content"><%content%></div>\
          </td>\
        </tr>\
        <tr>\
          <td class="ui-dialog-footer">\
            <div class="ui-dialog-button">\
              <button class="Js-pop-close" type="button">取消</button>\
              <button id="Js-confirm-ok" class="ui-dialog-autofocus" type="button"><%okText||"确 定"%></button>\
            </div>\
          </td>\
        </tr>\
      </tbody>\
    </table>'
  });
}