define([
    'jquery',
    'app/module/validate/validate',
    'app/module/loading/loading',
    'app/util/ajax',
    'app/util/dialog'
], function ($, Validate, loading, Ajax, dialog) {
    var tmpl = __inline("changePwd.html");
    var css = __inline("changePwd.css");
    var defaultOpt = {};
    var first = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    function _changePwd(){
        loading.createLoading("设置中...");
        var pwd = $("#chane-pwd-new-password").val();
        Ajax.post("805049", {
            json: {
                "oldLoginPwd": $("#chane-pwd-old-password").val(),
                "loginPwdStrength": _calculateSecurityLevel(pwd),
                "newLoginPwd": pwd,
                "userId": sessionStorage.getItem("user")
            }
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                obj.hideCont(defaultOpt.success);
            }else{
                defaultOpt.error && defaultOpt.error(res.msg);
            }
        }, function(){
            loading.hideLoading();
            defaultOpt.error && defaultOpt.error("密码修改失败");
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
    var obj = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#changePwdModuleWrap");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            var that = this;
            if(first){
                wrap.find(".right-left-cont-back")
                    .on("click", function(){
                        obj.hideCont(defaultOpt.hideFn);
                    });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                $("#chane-pwd-btn")
                    .on("click", function(){
                        if($("#change-pwd-form").valid()){
                            _changePwd();
                        }
                    });
                $("#change-pwd-form").validate({
                    'rules': {
                        "chane-pwd-old-password": {
                            required: true,
                            maxlength: 16,
                            minlength: 6,
                            isNotFace: true
                        },
                        "chane-pwd-new-password": {
                            required: true,
                            maxlength: 16,
                            minlength: 6,
                            isNotFace: true
                        },
                        "chane-pwd-new-confirm-password": {
                            equalTo: "#chane-pwd-new-password"
                        }
                    }
                });
            }

            first = false;
            return this;
        },
        hasCont: function(){
            if(!$("#changePwdModuleWrap").length)
                return false
            return true;
        },
        showCont: function (mobile){
            if(this.hasCont()){
                var wrap = $("#changePwdModuleWrap");
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
                var wrap = $("#changePwdModuleWrap");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func();
                    $("#chane-pwd-old-password").val("");
                    $("#chane-pwd-new-password").val("");
                    $("#chane-pwd-new-confirm-password").val("");
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return obj;
});
