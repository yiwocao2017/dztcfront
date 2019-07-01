define([
    'js/app/controller/base',
    'js/app/util/ajax',
    'js/app/module/loading/loading',
    'app/module/addOrEditBankCard'
], function (base, Ajax, loading, AddOrEditBankCard) {
    var code = "", first = 1;
    init();
    function init(){
        loading.createLoading();
        getBankCardList();
        addListeners();
    }
    // 获取银行卡列表
    function getBankCardList(){
        Ajax.get("802016", {
            userId: base.getUserId(),
            status: "1"
        }, false).then(function(res){
            loading.hideLoading();
            if(res.success){
                if(res.data.length){
                    var html = "", item = res.data[0];
                    code = item.code;
                    html = '<img src="/static/images/通用银行@2x.png" class="bank-logo mt45 ml45">'+
                    		'<div class="inline_block white va pl30 bank-mass">'+
                    			'<div class="fs32">'+item.bankName+'</div>'+
                    			'<div class="fs28">储蓄卡</div>'+
                    			'<div class="fs40 pt30">'+base.getBankCard(item.bankcardNumber)+'</div>'+
                    		'</div>';
                    $("#content").html(html);
                    if(first){
                        AddOrEditBankCard.addCont({
                            code: code,
                            success: function(bankcardNumber, bankName){
                                loading.createLoading();
                                getBankCardList();
                            },
                            error: function(msg){
                                base.showMsg(msg);
                            }
                        });
                    }
                }else{
                    base.showMsg("暂无银行卡");
                }
            }else{
                base.showMsg(res.msg);
            }
        });
    }
    function addListeners(){
        $("#edit").on("click", function(){
            if(code)
                AddOrEditBankCard.showCont();
        });
    }
});
