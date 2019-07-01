define([
    'jquery',
    'app/module/validate/validate',
    'app/module/loading/loading',
    'app/util/ajax',
    'app/module/smsCaptcha/smsCaptcha'
], function ($, Validate, loading, Ajax, smsCaptcha) {
    var tmpl = __inline("bindMobile.html");
    var css = __inline("bindMobile.css");
    var defaultOpt = {};
    var first = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    function bindMobile(){
        loading.createLoading("绑定中...");
        Ajax.post("805153", {
            json: {
                "mobile": $("#bind-mobile").val(),
                "smsCaptcha": $("#bind-smsCaptcha").val(),
                "userId": sessionStorage.getItem("user")
            }
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                BMobile.hideMobileCont(defaultOpt.success);
            }else{
                defaultOpt.error && defaultOpt.error(res.msg);
            }
        }, function(){
            loading.hideLoading();
            defaultOpt.error && defaultOpt.error("手机号绑定失败");
        });
    }
    var BMobile = {
        addMobileCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasMobileCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#bindMobileWrap");
            if(defaultOpt.hideBack){
                $("#bind-mobile-back").css("display", "none");
            }
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            var that = this;
            if(first){
                $("#bind-mobile-back")
                    .on("click", function(){
                        BMobile.hideMobileCont(defaultOpt.hideFn);
                    });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                $("#bind-mobile-btn")
                    .on("click", function(){
                        if($("#bind-mobile-form").valid()){
                            bindMobile();
                        }
                    });
                $("#bind-mobile-form").validate({
                    'rules': {
                        "bind-smsCaptcha": {
                            sms: true,
                            required: true
                        },
                        "bind-mobile": {
                            required: true,
                            mobile: true
                        }
                    },
                    onkeyup: false
                });
                smsCaptcha.init({
                    checkInfo: function () {
                        return $("#bind-mobile").valid();
                    },
                    bizType: "805153",
                    id: "bind-getVerification",
                    mobile: "bind-mobile"
                });
            }

            first = false;
            return this;
        },
        hasMobileCont: function(){
            if(!$("#bindMobileWrap").length)
                return false
            return true;
        },
        showMobileCont: function (){
            if(this.hasMobileCont()){
                var wrap = $("#bindMobileWrap");
                wrap.css("top", $(window).scrollTop()+"px");
                wrap.show().animate({
                    left: 0
                }, 200, function(){
                    defaultOpt.showFun && defaultOpt.showFun();
                });

            }
            return this;
        },
        hideMobileCont: function (func){
            if(this.hasMobileCont()){
                var wrap = $("#bindMobileWrap");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func($("#bind-mobile").val());
                    $("#bind-mobile").val("");
                    $("#bind-smsCaptcha").val("");
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return BMobile;
});
