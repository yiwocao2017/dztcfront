define([
    'jquery',
    'app/module/loading/loading',
    'app/util/ajax'
], function ($, loading, Ajax) {
    var tmpl = __inline("showContent.html");
    var css = __inline("showContent.css");
    var defaultOpt = {};
    var first = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    function getContent(){
        loading.createLoading("");
        return Ajax.post(defaultOpt.bizType, {
            json: defaultOpt.param
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                $("#showContent-cont").html(res.data[defaultOpt.key]);
            }else{
                defaultOpt.error && defaultOpt.error(res.msg);
            }
            return res;
        }, function(){
            loading.hideLoading();
            defaultOpt.error && defaultOpt.error("内容获取失败");
        });
    }
    function _showCont() {
        var wrap = $("#showContentWrap");
        wrap.css("top", $(window).scrollTop()+"px");
        wrap.show().animate({
            left: 0
        }, 200);  
    }
    var ShowContent = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var that = this;
            var wrap = $("#showContentWrap");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            wrap.find(".right-left-cont-title")
                .on("touchmove", function(e){
                    e.preventDefault();
                });
            wrap.find(".right-left-cont-back")
                .on("click", function () {
                    that.hideCont();
                })
            return this;
        },
        hasCont: function(){
            if(!$("#showContentWrap").length)
                return false
            return true;
        },
        showCont: function (){
            if(this.hasCont()){
                if(first){
                    getContent()
                        .then(function (res) {
                            if(res.success)
                                _showCont();
                        })
                }else{
                    _showCont();
                }
                first = false;
            }
            return this;
        },
        hideCont: function (func){
            if(this.hasCont()){
                var wrap = $("#showContentWrap");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                });
            }
            return this;
        }
    }
    return ShowContent;
});