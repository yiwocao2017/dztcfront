define([
    'js/app/controller/base',
    'js/app/util/ajax',
    'js/app/module/loading/loading',
    'js/app/module/validate/validate'
], function(base, Ajax, loading, Validate) {
    var code = base.getUrlParam("code");
    init();
    function init(){
        loading.createLoading();
        $("#userId").val(base.getUserId());
        addListeners();
        if(!code){  // 添加银行卡
            getAddInitData();
        }else{  // 修改银行卡
            getEditInitData();
        }
    }
    // 获取添加银行卡初始化数据
    function getAddInitData() {
        $.when(
            base.getUser(),
            getBankCode()
        ).then(function (res) {
            loading.hideLoading();
            if(res.success){
                res.data.realName && $("#realName").val(res.data.realName);
                res.data.mobile && $("#bindMobile").val(res.data.mobile);
            }else{
                base.showMsg(res.msg);
            }
        })
    }
    // 获取修改银行卡初始化数据
    function getEditInitData() {
        $.when(
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
                base.showMsg(res.msg);
            }
        })
    }
    // 根据code获取银行卡详情
    function getBankCard(){
        return Ajax.get("802017", {
            code: code
        });
    }

    // 获取银行select列表
    function getBankCode(){
        return Ajax.get("807706", {
            parentKey: "bank_code"
        }).then(function(res){
            if(res.success){
                var html = "";
                res.data.forEach(function(item){
                    html += '<option value="'+item.dvalue+'" code="'+item.dkey+'">'+item.dvalue+'</option>';
                });
                $("#bankName").html(html).trigger("change");
            }else{
                base.showMsg(res.msg);
            }
        });
    }
    function addListeners(){
        $("#bankCardForm").validate({
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
        $("#sbtn").on("click", function(){
            if($("#bankCardForm").valid()){
                if(code){
                    editBankCard();
                }else{
                    addBankCard();
                }
            }
        });
        $("#bankName").on("change", function(){
            $("#bankNameSpan").html($("#bankName").val())
            $("#bankCode").val($("#bankName option:selected").attr("code"));
        });
    }
    // 添加银行卡
    function addBankCard(){
        loading.createLoading("保存中...");
        var param = $("#bankCardForm").serializeObject();
        Ajax.post("802010", {json: param})
            .then(function(res){
                loading.hideLoading();
                if(res.success){
                    base.showMsg("添加银行卡成功");
                    setTimeout(function(){
                        history.back();
                    }, 1000);
                }else{
                    base.showMsg(res.msg);
                }
            });
    }
    // 修改银行卡
    function editBankCard() {
        loading.createLoading("保存中...");
        var param = $("#bankCardForm").serializeObject();
        param.status = 1;
        param.code = code;
        Ajax.post("802012", {json: param})
            .then(function(res){
                loading.hideLoading();
                if(res.success){
                    base.showMsg("修改银行卡成功");
                    setTimeout(function(){
                        history.back();
                    }, 1000);
                }else{
                    base.showMsg(res.msg);
                }
            });
    }
})
