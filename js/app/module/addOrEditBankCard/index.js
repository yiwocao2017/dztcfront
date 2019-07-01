define([
    'jquery',
    'app/module/validate/validate',
    'app/module/loading/loading',
    'app/util/ajax',
    'app/util/dialog'
], function ($, Validate, loading, Ajax, dialog) {
    var tmpl = __inline("index.html");
    var css = __inline("index.css");
    var defaultOpt = {};
    var firstAdd = true, firstLoadData = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    function initData(){
        loading.createLoading();
        $("#userId").val(sessionStorage.getItem("user"));
        // 添加银行卡
        if(!defaultOpt.code){
            return getAddInitData();
        }
        // 修改银行卡
        return getEditInitData();
    }
    // 添加银行卡
    function addBankCard(){
        loading.createLoading("保存中...");
        var param = $("#addOrEditBankCardForm").serializeObject();
        Ajax.post("802010", {json: param})
            .then(function(res){
                loading.hideLoading();
                if(res.success){
                    ModuleObj.hideCont(defaultOpt.success);
                }else{
                    defaultOpt.error && defaultOpt.error(res.msg);
                }
            }, function(){
                loading.hideLoading();
                defaultOpt.error && defaultOpt.error("添加银行卡失败");
            });
    }
    // 修改银行卡
    function editBankCard() {
        loading.createLoading("保存中...");
        var param = $("#addOrEditBankCardForm").serializeObject();
        param.status = 1;
        param.code = defaultOpt.code;
        Ajax.post("802012", {json: param})
            .then(function(res){
                loading.hideLoading();
                if(res.success){
                    ModuleObj.hideCont(defaultOpt.success);
                }else{
                    defaultOpt.error && defaultOpt.error(res.msg);
                }
            }, function(){
                loading.hideLoading();
                defaultOpt.error && defaultOpt.error("添加银行卡失败");
            });
    }
    // 获取添加银行卡初始化数据
    function getAddInitData() {
        return $.when(
            Ajax.get("805056", {
                userId: sessionStorage.getItem("user")
            }),
            getBankCode()
        ).then(function (res) {
            loading.hideLoading();
            if(res.success){
                res.data.realName && $("#realName").val(res.data.realName);
                res.data.mobile && $("#bindMobile").val(res.data.mobile);
            }else{

                _showMsg(res.msg);
            }
        })
    }
    // 获取修改银行卡初始化数据
    function getEditInitData() {
        return $.when(
            getBankCard(),
            getBankCode()
        ).then(function (res) {
            loading.hideLoading();
            if(res.success){
                var data = res.data;
                $("#bankName").val(data.bankName).trigger("change");
                $("#realName").val(data.realName);
                $("#bindMobile").val(data.bindMobile);
                $("#bankcardNumber").val(data.bankcardNumber);
                $("#subbranch").val(data.subbranch);
            }else{
                _showMsg(res.msg);
            }
        })
    }
    // 根据code获取银行卡详情
    function getBankCard(){
        return Ajax.get("802017", {
            code: defaultOpt.code
        });
    }

    // 获取银行select列表
    function getBankCode(){
        return Ajax.get("802116").then(function(res){
            if(res.success){
                var html = "";
                res.data.forEach(function(item){
                    html += '<option value="'+item.bankName+'" code="'+item.bankCode+'">'+item.bankName+'</option>';
                });
                $("#bankName").html(html).trigger("change");
            }else{
                _showMsg(res.msg);
            }
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
    var ModuleObj = {
        addCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#addOrEditBankCardContainer");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            var that = this;
            if(firstAdd){
                var _form = $("#addOrEditBankCardForm");
                if(defaultOpt.code){
                    $("#realName").prop("readonly", 1);
                }
                wrap.on("click", ".right-left-cont-back", function(){
                        ModuleObj.hideCont(defaultOpt.hideFn);
                    });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                $("#addOrEditBankCardBtn")
                    .on("click", function(){
                        if(_form.valid()){
                            if(defaultOpt.code){
                                editBankCard();
                            }else{
                                addBankCard();
                            }
                        }
                    });
                _form.validate({
                    'rules': {
                        realName: {
                            required: true,
                            isNotFace: true,
                            maxlength: 16
                        },
                        bankName: {
                            required: true
                        },
                        subbranch: {
                            required: true,
                            isNotFace: true,
                            maxlength: 255
                        },
                        bindMobile: {
                            required: true,
                            mobile: true
                        },
                        bankcardNumber: {
                            required: true,
                            bankCard: true
                        }
                    },
                    onkeyup: false
                });
                $("#bankName").on("change", function(){
                    $("#bankNameSpan").html($("#bankName").val())
                    $("#bankCode").val($("#bankName option:selected").attr("code"));
                });
            }

            firstAdd = false;
            return this;
        },
        hasCont: function(){
            if(!$("#addOrEditBankCardContainer").length)
                return false
            return true;
        },
        showCont: function (){
            if(this.hasCont()){
                if(firstLoadData){
                    firstLoadData = false;
                    initData().then(function(){
                        ModuleObj._showCont();
                    });
                }else{
                    ModuleObj._showCont();
                }
            }
            return this;
        },
        _showCont: function(){
            var wrap = $("#addOrEditBankCardContainer");
            wrap.css("top", $(window).scrollTop()+"px");
            wrap.show().animate({
                left: 0
            }, 200, function(){
                defaultOpt.showFun && defaultOpt.showFun();
            });
        },
        hideCont: function (func){
            if(this.hasCont()){
                var wrap = $("#addOrEditBankCardContainer");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func($("#bankcardNumber").val(), $("#bankName").find("option:selected").text());
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return ModuleObj;
});
