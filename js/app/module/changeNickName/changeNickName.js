define([
    'jquery',
    'app/module/validate/validate',
    'app/module/loading/loading',
    'app/util/ajax'
], function ($, Validate, loading, Ajax) {
    var tmpl = __inline("changeNickName.html");
    var css = __inline("changeNickName.css");
    var defaultOpt = {};
    var first = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    function changeNickName(){
        loading.createLoading("修改中...");
        Ajax.post("805075", {
            json: {
                "nickname": $("#nicknameChangeName").val(),
                "userId": sessionStorage.getItem("user")
            }
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                defaultOpt.defaultName = $("#nicknameChangeName").val();
                CNickName.hideNickCont(defaultOpt.success);
            }else{
                defaultOpt.error && defaultOpt.error(res.msg);
            }
        }, function(){
            loading.hideLoading();
            defaultOpt.error && defaultOpt.error("昵称修改失败");
        });
    }
    var CNickName = {
        addNickCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasNickCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#nicknameChangeWrap");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            var that = this;
            if(first){
                $("#nicknameChangeBack")
                    .on("click", function(){
                        that.hideNickCont(defaultOpt.hideFn);
                    });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                $("#nicknameChangeBtn")
                    .on("click", function(){
                        if($("#nicknameChangeForm").valid()){
                            changeNickName();
                        }
                    });
                $("#nicknameChangeForm").validate({
                    'rules': {
                        "nicknameChangeName": {
                            required: true,
                            maxlength: 32,
                            isNotFace: true
                        }
                    },
                    onkeyup: false
                });
            }

            first = false;
            return this;
        },
        hasNickCont: function(){
            if(!$("#nicknameChangeWrap").length)
                return false
            return true;
        },
        showNickCont: function (){
            if(this.hasNickCont()){
                var wrap = $("#nicknameChangeWrap");
                wrap.css("top", $(window).scrollTop()+"px");
                defaultOpt.defaultName && $("#nicknameChangeName").val(defaultOpt.defaultName);
                wrap.show().animate({
                    left: 0
                }, 200, function(){
                    defaultOpt.showFun && defaultOpt.showFun();
                });
            }
            return this;
        },
        hideNickCont: function (func){
            if(this.hasNickCont()){
                var wrap = $("#nicknameChangeWrap");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func($("#nicknameChangeName").val());
                    $("#nicknameChangeName").val("");
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return CNickName;
});