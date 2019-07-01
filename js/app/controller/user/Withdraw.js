define([
    'js/app/controller/base',
    'js/app/util/ajax',
    'js/app/module/loading/loading',
    'js/app/module/validate/validate',
    'app/module/addOrEditBankCard'
], function(base, Ajax, loading, Validate, AddOrEditBankCard) {
    var accountNumber, availableAmount;
    var userId = base.getUserId();
    var payCardInfo = "";
    var payCardNo ="";
    init();
    function init(){
        loading.createLoading();
        addListeners();
        getInitData();
    }
    function getInitData() {
        $.when(
            getAccountList(),
            getBankCardList()
        ).then(loading.hideLoading);
    }
    // 获取银行卡列表
    function getBankCardList(){
        return Ajax.get("802016", {
            userId: userId,
            status: "1"
        }, false).then(function(res){
            if(res.success){
                if(res.data.length){
                    $("#addBankCard").off("click");
                    $("#bankcardNumber").show();
                    var html = "";
                    $.each(res.data, function(i, item){
                        html += '<option bankName="'+item.bankName+ '"value="'+item.bankcardNumber+'">'+item.bankName+' - '+item.bankcardNumber+'</option>';
                    });
                    $("#bankcardNumber").html(html).trigger("change");
                    $("#add").html("银行卡")
                }else{
                    $("#bankcardNumber").hide();
                    addGoBankCardListener();
                    AddOrEditBankCard.addCont({
                        success: function(bankcardNumber, bankName ){
                            loading.createLoading();
                            getBankCardList().then(loading.hideLoading);
                        },
                        error: function(msg){
                            base.showMsg(msg);
                        }
                    });
                }
            }else{
                base.showMsg(res.msg);
                addGoBankCardListener();
            }
        });
    }
    function addGoBankCardListener(){
        $("#addBankCard").on('click', function(){
            AddOrEditBankCard.showCont();
        });
    }
    // 获取账户信息
    function getAccountList() {
        return Ajax.get("802503", {
            userId: base.getUserId()
        }, 0).then(function (res) {
            if(res.success && res.data.length){
                var data = res.data;
                $.each(data, function (i, d) {
                    if(d.currency == "CNY"){
                        accountNumber = d.accountNumber;
                        $("#amountPrompt").html(base.formatMoney(d.amount));
                        availableAmount = d.amount;
                    }
                });
            }else{
                res.msg && base.showMsg(res.msg);
            }
        }, function () {
            base.showMsg("账户信息获取失败");
        });
    }
    function addListeners(){
        $("#withdrawForm").validate({
            'rules': {
                bankcardNumber: {
                    required: true
                },
                amount: {
                    required: true,
                    "isPositive": true
                },
                tradePwd: {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                }
            },
            onkeyup: false
        });
        $("#bankcardNumber").on("change", function(){
            $("#bankCardSpan").html($("#bankcardNumber").val());
            // $("#bankCardSpan").html($("#bankCode").val());
        });
        $("#sbtn").on("click", function(){
            if($("#withdrawForm").valid()){
                getBankCardList()
                withdraw();
            }
        });
    }
    // 取现
    function withdraw(){
        var param = $("#withdrawForm").serializeObject();
        param.amount = +param.amount * 1000;
        if(+availableAmount < param.amount){
            base.showMsg("提现金额不能大于可用余额");
            return;
        }
        param.amount = param.amount;
        param.accountNumber = accountNumber;
        param.payCardInfo = $("#bankcardNumber").find("option:selected").attr("bankName");
        param.payCardNo = $("#bankcardNumber").find("option:selected").attr("value");
        param.applyUser = userId;
        loading.createLoading("提交中...");
        Ajax.post("802750", {json: param})
            .then(function(res){
                loading.hideLoading();
                if(res.success){
                    base.showMsg("操作成功");
                    setTimeout(function(){
                        history.back();
                    }, 1000);
                }else{
                    base.showMsg(res.msg);
                }
            });
    }
})
