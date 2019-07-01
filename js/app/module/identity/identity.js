define([
    'jquery',
    'app/module/validate/validate',
    'app/module/loading/loading',
    'app/util/ajax'
], function ($, Validate, loading, Ajax) {
    var tmpl = __inline("identity.html");
    var css = __inline("identity.css");
    var defaultOpt = {};
    var first = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    function _identity(){
        loading.createLoading("认证中...");
        Ajax.post("805193", {
            json: {
                realName: $("#identityRealName").val(),
                idNo: $("#identityIdNo").val(),
                idKind: 1,
                userId: sessionStorage.getItem("user")
            }
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                identity.hideIdentity(defaultOpt.success);
                $("#authentication-identity-btn").parent().hide();
                $("#identityRealName, #identityIdNo").attr("disabled", "disabled");
            }else{
                defaultOpt.error && defaultOpt.error(res.msg);
            }
        }, function(){
            defaultOpt.error && defaultOpt.error("实名认证失败");
            loading.hideLoading();
        });
    }
    var identity = {
        addIdentity: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasIdentity()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#authentication-identity");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            var that = this;
            if(first){
                $("#authentication-identity-back")
                    .on("click", function(){
                        identity.hideIdentity();
                    });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                if(!defaultOpt.disabled){
                    $("#authentication-identity-btn")
                        .on("click", function(){
                            if($("#authentication-identity-form").valid()){
                                _identity();
                            }
                        });
                    $("#authentication-identity-form").validate({
                        'rules': {
                            identityRealName: {
                                required: true,
                                maxlength: 32,
                                isNotFace: true
                            },
                            identityIdNo: {
                                required: true,
                                isIdCardNo: true
                            }
                        },
                        onkeyup: false
                    });
                }else{
                    $("#authentication-identity-btn").parent().hide();
                    $("#identityRealName").val(defaultOpt.realName || "").attr("disabled", "disabled");
                    $("#identityIdNo").val(defaultOpt.idNo || "").attr("disabled", "disabled");
                }
            }

            first = false;
            return this;
        },
        refreshOption: function(option){
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(defaultOpt.disabled){
                $("#authentication-identity-btn").parent().hide();
                $("#identityRealName").val(defaultOpt.realName || "").attr("disabled", "disabled");
                $("#identityIdNo").val(defaultOpt.idNo || "").attr("disabled", "disabled");
            }
        },
        hasIdentity: function(){
            if(!$("#authentication-identity").length)
                return false
            return true;
        },
        showIdentity: function (){
            if(this.hasIdentity()){
                var wrap = $("#authentication-identity");
                wrap.css("top", $(window).scrollTop()+"px");
                wrap.show().animate({
                    left: 0
                }, 200, function(){
                    defaultOpt.showFun && defaultOpt.showFun();
                });

            }
            return this;
        },
        hideIdentity: function (func){
            if(this.hasIdentity()){
                var wrap = $("#authentication-identity");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    if(func){
                        var realName = $("#identityRealName").val(), idNo = $("#identityIdNo").val();
                        if(realName && idNo){
                            func(realName, idNo);
                        }
                    }
                    if(!defaultOpt.disabled){
                        $("#identityRealName").val("");
                        $("#identityIdNo").val("");
                    }
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return identity;
});
