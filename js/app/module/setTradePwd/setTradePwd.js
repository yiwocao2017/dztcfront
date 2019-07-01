define([
    'jquery',
    'app/module/validate/validate',
    'app/module/loading/loading',
    'app/util/ajax',
    'app/module/smsCaptcha/smsCaptcha',
    'app/util/dialog'
], function ($, Validate, loading, Ajax, smsCaptcha, dialog) {
    var tmpl = __inline("setTradePwd.html");
    var css = __inline("setTradePwd.css");
    var defaultOpt = {};
    var first = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    function _setTradePwd(){
        loading.createLoading("设置中...");
        var pwd = $("#set-trade-pwd-password").val();
        Ajax.post("805045", {
            json: {
                "smsCaptcha": $("#set-trade-pwd-smsCaptcha").val(),
                "tradePwdStrength": _calculateSecurityLevel(pwd),
                "tradePwd": pwd,
                "userId": sessionStorage.getItem("user")
            }
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                TradePwd.hideCont(defaultOpt.success);
            }else{
                defaultOpt.error && defaultOpt.error(res.msg);
            }
        }, function(){
            loading.hideLoading();
            defaultOpt.error && defaultOpt.error("手机号修改失败");
        });
    }
    function _calculateSecurityLevel(password) {
        var strength_L = 0;
        var strength_M = 0;
        var strength_H = 0;

        for (var i = 0; i < password.length; i++) {
            var code = password.charCodeAt(i);
            // 数字
            if (code >= 48 && code <= 57) {
                strength_L++;
                // 小写字母 大写字母
            } else if ((code >= 65 && code <= 90) ||
                (code >= 97 && code <= 122)) {
                strength_M++;
                // 特殊符号
            } else if ((code >= 32 && code <= 47) ||
                (code >= 58 && code <= 64) ||
                (code >= 94 && code <= 96) ||
                (code >= 123 && code <= 126)) {
                strength_H++;
            }
        }
        // 弱
        if ((strength_L == 0 && strength_M == 0) ||
            (strength_L == 0 && strength_H == 0) ||
            (strength_M == 0 && strength_H == 0)) {
            return "1";
        }
        // 强
        if (0 != strength_L && 0 != strength_M && 0 != strength_H) {
            return "3";
        }
        // 中
        return "2";
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
    var TradePwd = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#setTradePwdWrap");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            var that = this;
            $("#setTradePwdMobile").val(defaultOpt.mobile);
            if(first){
                $("#set-trade-pwd-back")
                    .on("click", function(){
                        TradePwd.hideCont(defaultOpt.hideFn);
                    });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                $("#set-trade-pwd-btn")
                    .on("click", function(){
                        if($("#set-trade-pwd-form").valid()){
                            _setTradePwd();
                        }
                    });
                $("#set-trade-pwd-form").validate({
                    'rules': {
                        "set-trade-pwd-smsCaptcha": {
                            sms: true,
                            required: true
                        },
                        "set-trade-pwd-password": {
                            required: true,
                            maxlength: 16,
                            minlength: 6,
                            isNotFace: true
                        }
                    },
                    onkeyup: false
                });
                smsCaptcha.init({
                    checkInfo: function () {
                        if(defaultOpt.mobile){
                            return true;
                        }
                        _showMsg("还未绑定手机号");
                        return false;
                    },
                    bizType: "805045",
                    id: "set-trade-pwd-getVerification",
                    mobile: "setTradePwdMobile"
                });
            }

            first = false;
            return this;
        },
        hasCont: function(){
            if(!$("#setTradePwdWrap").length)
                return false
            return true;
        },
        showCont: function (mobile){
            if(this.hasCont()){
                defaultOpt.mobile = mobile || defaultOpt.mobile;
                $("#setTradePwdMobile").val(defaultOpt.mobile);
                var wrap = $("#setTradePwdWrap");
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
                var wrap = $("#setTradePwdWrap");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func();
                    $("#set-trade-pwd-smsCaptcha").val("");
                    $("#set-trade-pwd-password").val("");
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return TradePwd;
});