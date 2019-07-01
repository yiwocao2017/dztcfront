define([
    'jquery',
    'app/module/validate/validate'
], function ($, Validate) {
    var tmpl = __inline("normalTextInput.html");
    var css = __inline("normalTextInput.css");
    var defaultOpt = {};
    var first = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    var NTextInput = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                if(defaultOpt.type == "number" || defaultOpt.type == "Z")
                    temp.find("#normalTextInputDiv").html('<input type="number" id="normalTextInputText" name="normalTextInputText"/>');
                $("body").append(temp);
            }
            var wrap = $("#normalTextInputWrap");
            if(defaultOpt.title) {
                wrap.find(".right-left-cont-title-name, #normalTextInputLeftTitle").html(defaultOpt.title);
            }
            var that = this;
            if(first){
                $("#normalTextInputBack")
                    .on("click", function(){
                        that.hideCont(defaultOpt.hideFn);
                    });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                $("#normalTextInputBtn")
                    .on("click", function(){
                        if($("#normalTextInputForm").valid()){
                            that.hideCont(defaultOpt.success);
                        }
                    });
                var rules = {
                    "normalTextInputText": {
                        required: true,
                        maxlength: 32,
                        isNotFace: true
                    }
                }
                if(defaultOpt.type == "number")
                    rules.number = true;
                else if(defaultOpt.type == "Z")
                    rules["Z+"] = true;
                $("#normalTextInputForm").validate({
                    'rules': rules
                });
            }

            first = false;
            return this;
        },
        hasCont: function(){
            if(!$("#normalTextInputWrap").length)
                return false
            return true;
        },
        showCont: function (value){
            if(this.hasCont()){
                var wrap = $("#normalTextInputWrap");
                wrap.css("top", $(window).scrollTop()+"px");
                value && $("#normalTextInputText").val(value);
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
                var wrap = $("#normalTextInputWrap");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func($("#normalTextInputText").val());
                    $("#normalTextInputText").val("");
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return NTextInput;
});