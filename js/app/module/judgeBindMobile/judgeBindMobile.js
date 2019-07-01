define([
    'jquery',
    'app/module/bindMobile/bindMobile',
    'app/util/dialog',
    'app/module/loadImg/loadImg'
], function ($, BindMobile, dialog, loadImg) {
    var tmpl = __inline("judgeBindMobile.html");
    var css = __inline("judgeBindMobile.css");
    var defaultOpt = {};
    var first = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
        BindMobile.addMobileCont({
            success: function(res) {
                _goBackUrl("/", true);
            },
            hideFn: function() {
                _goBackUrl("/", true);
            },
            error: function(msg) {
                _showMsg(msg);
            },
            hideBack: 1
        });
    }
    function _showMsg(msg, time) {
        var d = dialog({
            content: msg,
            quickClose: true
        });
        d.show();
        setTimeout(function() {
            d.close().remove();
        }, time || 1500);
    }
    function _goBackUrl(url) {
        var rUrl = _getUrlParam("return");
        var returnUrl = sessionStorage.getItem("l-return");
        location.href = returnUrl || url || "../user/user.html";
    }
    function _getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return '';
    }
    var JudgeBindMobile = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var that = this;
            var html = '<div class="login-chose-avatar"><img src="'+defaultOpt.avatar+'" /></div>';
            $("#login-avatar-module").html(loadImg.loadImg(html));
            $("#login-nickname-module").html(defaultOpt.nickname);
            if(first){
                $("#login-chose-bindmobile").on("click", function(){
                    BindMobile.showMobileCont();
                });
                $("#login-chose-ignore").on("click", function(){
                    _goBackUrl("/", true);
                });
            }

            first = false;
            return this;
        },
        hasCont: function(){
            return !!$("#login-chose-module-container").length;
        },
        showCont: function (){
            if(this.hasCont()){
                var wrap = $("#login-chose-module-container");
                wrap.css("top", $(window).scrollTop()+"px");
                wrap.show().animate({
                    left: 0
                }, 200, function(){
                    defaultOpt.showFun && defaultOpt.showFun();
                });
            }
            return this;
        },
        hideCont: function (func){
            if(this.hasCont()){
                var wrap = $("#login-chose-module-container");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func();
                });
            }
            return this;
        }
    }
    return JudgeBindMobile;
});
