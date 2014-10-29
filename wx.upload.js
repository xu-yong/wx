/**
* wx.upload
*
* 文件上传组件
* 支持三种上传方式，html5、flash和iframe
* 目的是以简单并且通用的方式解决上传问题
*
* @author xuyong <xuyong@ucfgroup.com>
* @createTime 2014-03-18
* @version 1.1.1
* @projectHome https://github.com/xu-yong/wx
*
* Released under the MIT license:
*   http://www.opensource.org/licenses/mit-license.php
*/

(function(window, document, $, wx, undefined){
    "use strict";

    if(wx.upload !== undefined)
        return;

    var W3C    = window.FormData !== undefined ? true : false,
        prefix = "wx-upload";

    wx.upload = function($elem) {
        var options = init($elem);
        if(!options.name || !options.url)
            return;

        if(W3C){
            $elem.change(h5);
        } else if(options.isUseFlash){
            flash($elem);
        } else{
            $elem.change(normal);
        }
    };

    function init($elem) {
        var options = {
            name       : $elem.attr("name"),
            url        : $elem.attr(prefix) || wx.config.uploadUrl || "",
            type       : $elem.attr(prefix+"-type") || wx.config.uploadType,
            size       : $elem.attr(prefix+"-size") || wx.config.uploadSize,
            set        : $elem.attr(prefix+"-set"),
            param      : $elem.attr(prefix+"-param") || "",
            assign     : $elem.attr(prefix+"-assign"),
            mult       : typeof $elem.attr(prefix+"-mult") != "undefined",
            loading    : typeof $elem.attr(prefix+"-load") != "undefined",
            isUseFlash : typeof $elem.attr(prefix+"-flash") != "undefined"
        };
        options.url      += options.url.indexOf("?") !== -1 ? "&_="+new Date().getTime() : "?_="+new Date().getTime();
        options.size     = options.size ? parseFloat(options.size)*1024*1024 : null;
        options.callback = $.isFunction(window[options.name]) ? window[options.name] : null;
        options.before   = $.isFunction(window[options.name+"_before"]) ? window[options.name+"_before"] : null;
        options.progress = $.isFunction(window[options.name+"_progress"]) ? window[options.name+"_progress"] : null;
        options.mult ? $elem.attr("multiple",true) : null;
        $elem.data("opt",options);
        $elem.attr('hidefocus','true');
        return options;
    }

    function before(options,$input) {
        var result = true;
        if(options.before)
            result = options.before($input);
        if(result && options.loading)
            wx.loading("正在上传...");
        return result;
    }

    function complete(responseText, options, $input) {
        try{
            var data = $.parseJSON(responseText);
            if(data[wx.config.dataFlag] == wx.config.dataSuccessVal){
                if(options.assign){
                    var assign = options.assign.split("&");
                    for(var i = 0; i<assign.length; i++){
                        var assVal     = "",
                            assignItem = assign[i].split("="),
                            $inputAss  = $("input[name='"+assignItem[0]+"']");
                        assVal = eval('data["'+assignItem[1].replace(/\./g,'"]["')+'"]');
                        if($inputAss.length)
                            $inputAss.val(assVal);
                        else
                            $input.before('<input name="'+assignItem[0]+'" value="'+assVal+'" style="display:none;">');
                    }
                }
                if(options.set){
                    var set   = options.set.split("&");
                    for(var i = 0; i<set.length; i++){
                        var setVal  = "",
                            setItem = set[i].split("="),
                            $elem   = $("#"+setItem[0]);
                        if($elem.length){
                            setVal = eval('data["'+setItem[1].replace(/\./g,'"]["')+'"]');
                            setVal += setVal.indexOf("?") !== -1 ? "&_"+new Date().getTime() : "?_="+new Date().getTime();
                            if($elem.is("img"))
                                $elem.attr("src",setVal);
                            else
                                $elem.css("background","url("+setVal+")");
                        }
                    }
                }
                if(options.loading)
                    wx.popClose();
                if(options.callback)
                    options.callback(data,$input);
            } else {
                wx.alert(data[wx.config.dataInfo]);
            }
        }
        catch(e){wx.log("uploadComplete error "+e);}
    }

    function h5() {
        var fd      = null,
            xhr     = null,
            files   = this.files,
            $input  = $(this),
            options = $input.data("opt");

        if(!before(options,$input)) return;

        for(var i=0; i<files.length; i++){
            if(options.size && files[i].size > options.size){
                wx.alert("上传的文件太大，请压缩后重新上传");
                continue;
            } else if(options.type && options.type !== "*" && (!files[i].type || options.type.indexOf(files[i].type.split("/")[1]) === -1)){
                wx.alert("文件格式不符");
                continue;
            }

            fd  = new FormData();
            xhr = new XMLHttpRequest();
            xhr.open("POST", options.url);
            bindEvent(xhr);
            addParam(fd);
            fd.append(options.name, files[i]);
            xhr.send(fd);
            fd = xhr = null;
            $input.unbind("change").val('').change(h5);
        }

        function addParam(fd){
            if(options.param){
                var tempURL = options.param.split('&');
                for(var i = 0;i<tempURL.length;i++){
                   var t = tempURL[i].split('=');
                   fd.append(t[0], t[1]);
                }
            }
        }

        function bindEvent(xhr){
            if(options.progress){
                xhr.upload.addEventListener("progress", function(evt){
                    if (evt.lengthComputable) {
                      options.progress(Math.round(evt.loaded * 100 / evt.total).toString(),$input);
                    } else {
                      wx.log('unable to compute');
                    }
                }, false);
            }
            xhr.addEventListener("load", function(evt){complete(evt.target.responseText,options,$input);}, false);
            xhr.addEventListener("error", function(error){complete('{"status:0",error:"'+error+'"}',options,$input);}, false);
        }
    }


    function flash($input) {
        var width    = $input.width(),
            height   = $input.height(),
            options  = $input.data("opt"),
            flashOpt = {};

        options.param += "&"+document.cookie.replace(/;/g,"&");
        if(options.url.indexOf('http') === -1)
            options.url = "http://"+location.host+options.url;
        options.url = encodeURIComponent(options.url);

        $.extend(flashOpt, options);

        if(flashOpt.progress)
            flashOpt.progress = flashOpt.progress.name;
        if(flashOpt.before)
            flashOpt.before = flashOpt.before.name;
        if(flashOpt.callback)
            flashOpt.callback = flashOpt.callback.name;
        flashOpt.param = encodeURIComponent(flashOpt.param);

        var falshObj = wx.loadFlash("wx",{id:"wx-falsh","width":width,"height":height},{flashvars:wx.jsonToString(flashOpt)});
        $input.before($('<div style="position:absolute;cursor:pointer;opacity:0;z-index:0;overflow:hidden;width:'+width+'px;height:'+height+'px;top:'+$input.position().top+'px;left:'+$input.position().left+'"></div>').append(falshObj));
        $input.remove();
        window.wxUploadFlashComplete = function(data) {
            complete(data,options,$input);
        };
        window.wxUploadFlashBefore = function(data) {
           return before(options);
        };
        window.wxUploadFlashError = function(data) {
            data = $.parseJSON(data);
            if(data.status === 2)
                wx.alert("上传的文件太大，请重新上传");
            else
                wx.alert("上传失败，请稍后重试");
        };
    }

    function normal() {
        var $iframe = null,
            $input  = $(this),
            $inputC = $input.clone(),
            options = $input.data("opt"),
            $form   = $('<form id="wx-upload-form" method="post" action="'+options.url+'" enctype="multipart/form-data" target="wx-upload-iframe"></form>');

        if(!before(options,$input)) return;

        if(wx.browser.msie && wx.browser.version == 6){
            var io = document.createElement('<iframe id="wx-upload-iframe" name="wx-upload-iframe" />');
            io.src = 'javascript:false';
            io.style.top = '-1000px';
            io.style.left = '-1000px';
            io.style.position = 'absolute';
            $iframe = $(io);
        } else {
            $iframe = $('<iframe name="wx-upload-iframe" style="display:none"></iframe>');
        }

        $input.parent().append($inputC);
        $form.css({"display":"none","position":"absolute","top":"-1000px","left":"-1000px"}).append($input);
        $iframe.appendTo('body');
        $form.appendTo('body');
        if(options.param){
            var tempURL = options.param.split('&'),
                param   = "";
            for(var i = 0;i<tempURL.length;i++){
               var t = tempURL[i].split('=');
               param += '<input name="'+t[0]+'" value="'+t[1]+'" style="display:none;">';
            }
            $form.append(param);
        }
        $iframe.on("load",function(){
            var content = this.contentWindow ? this.contentWindow : this.contentDocument,
                reponse = content.document.body ? content.document.body.innerHTML: null;
            complete(reponse,options,$input);
            $form.remove();
            $iframe.remove();
            $inputC.data("opt",options);
            $inputC.unbind("change").change(normal);
        });
        $form.submit();
    }
})(window,document,jQuery,wx);