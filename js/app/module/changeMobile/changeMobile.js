define([
    'jquery',
    'app/module/validate/validate',
    'app/module/loading/loading',
    'app/util/ajax',
    'app/module/smsCaptcha/smsCaptcha'
], function ($, Validate, loading, Ajax, smsCaptcha) {
    var tmpl = __inline("changeMobile.html");
    var css = __inline("changeMobile.css");
    var defaultOpt = {};
    var first = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    function changeMobile(){
        loading.createLoading("修改中...");
        Ajax.post("805061", {
            json: {
                "newMobile": $("#change-mobile").val(),
                "smsCaptcha": $("#change-smsCaptcha").val(),
                "userId": sessionStorage.getItem("user")
            }
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                CMobile.hideMobileCont(defaultOpt.success);
            }else{
                defaultOpt.error && defaultOpt.error(res.msg);
            }
        }, function(){
            loading.hideLoading();
            defaultOpt.error && defaultOpt.error("手机号修改失败");
        });
    }
    var CMobile = {
        addMobileCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasMobileCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#changeMobileWrap");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            var that = this;
            if(first){
                $("#change-mobile-back")
                    .on("click", function(){
                        CMobile.hideMobileCont(defaultOpt.hideFn);
                    });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                $("#change-mobile-btn")
                    .on("click", function(){
                        if($("#change-mobile-form").valid()){
                            changeMobile();
                        }
                    });
                $("#change-mobile-form").validate({
                    'rules': {
                        "change-smsCaptcha": {
                            sms: true,
                            required: true
                        },
                        "change-mobile": {
                            required: true,
                            mobile: true
                        }
                    },
                    onkeyup: false
                });
                smsCaptcha.init({
                    checkInfo: function () {
                        return $("#change-mobile").valid();
                    },
                    bizType: "805047",
                    id: "change-getVerification",
                    mobile: "change-mobile"
                });
            }

            first = false;
            return this;
        },
        hasMobileCont: function(){
            if(!$("#changeMobileWrap").length)
                return false
            return true;
        },
        showMobileCont: function (){
            if(this.hasMobileCont()){
                var wrap = $("#changeMobileWrap");
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
                var wrap = $("#changeMobileWrap");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func($("#change-mobile").val());
                    $("#change-mobile").val("");
                    $("#change-smsCaptcha").val("");
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return CMobile;
});