define([
    'jquery',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/util/dialog',
    'app/module/validate/validate'
], function ($, Ajax, loading, dialog, Validate) {
    var tmpl = __inline("login.html");
    var css = __inline("login.css");
    var defaultOpt = {};
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }

    function _addListener(){
        var wrap = $("#login-module-wrap");
        wrap.find(".city-select-module-title").on("touchmove", function(e){
            e.preventDefault();
        });
        wrap.find(".city-select-module-back").on("click", function () {
            obj.hideCont();
        });
        wrap.find("#weChatIcon").on("click", function () {
            location.href = '../user/redirect.html';
        });
        $("#loginForm").validate({
            'rules': {
                mobile: {
                    required: true,
                    mobile: true
                },
                password: {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                }
            },
            onkeyup: false
        });

        $("#loginBtn").on('click', _loginAction);
        $("#loginFdPwd").attr("href", '../user/findPwd.html');
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

    function _loginAction() {
        if ($("#loginForm").valid()) {
            loading.createLoading("登录中...");
            var param = {
                "loginName": $("#mobile").val(),
                "loginPwd": $("#password").val(),
                "kind": "f1"
            };

            Ajax.post("805043", { json: param })
                .then(function(res) {
                    loading.hideLoading();
                    if (res.success) {
                        _setSessionUser(res);
                        location.reload(true);
                    } else {
                        _clearSessionUser();
                        _showMsg(res.msg);
                    }
                }, function() {
                    loading.hideLoading();
                    base.clearSessionUser();
                    _showMsg("登录失败");
                });
        }
    }

    function _setSessionUser(res) {
        sessionStorage.setItem("user", res.data.userId);
        sessionStorage.setItem("tk", res.data.token);
    }

    //清除sessionStorage中和用户相关的数据
    function _clearSessionUser() {
        sessionStorage.removeItem("user"); //userId
        sessionStorage.removeItem("tk"); //token
    }
    
    var obj = {
        addCont: function (option) {
            if(!this.hasCont()){
                option = option || {};
                defaultOpt = $.extend(defaultOpt, option);
                var temp = $(tmpl);
                $("body").append(tmpl);
                _addListener();
            }
            return this;
        },
        hasCont: function(){
            var cont = $("#login-module-wrap");
            if(!cont.length)
                return false
            return true;
        },
        showCont: function (){
            if(!this.hasCont())
                this.addCont();
            var cont = $("#login-module-wrap");
            cont.show().animate({
                top: 0
            }, 200);
            return this;
        },
        hideCont: function (func){
            if(this.hasCont()){
                var cont = $("#login-module-wrap");
                cont.animate({
                    top: '100%'
                }, 200, function(){
                    cont.hide();
                });
            }
            return this;
        }
    };
    return obj;
});