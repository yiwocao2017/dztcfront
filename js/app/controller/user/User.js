define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/module/bindMobile/bindMobile',
    'app/module/changeMobile/changeMobile',
    'app/module/identity/identity',
    'app/module/setTradePwd/setTradePwd',
    'app/module/changeTradePwd/changeTradePwd',
    'app/module/addOrEditBankCard'
], function(base, Ajax, loading, BindMobile, ChangeMobile, Identity, SetTradePwd, ChangeTradePwd, AddOrEditBankCard) {
    var mobile, identityFlag, bankFlag, tradepwdFlag, addressFlag;

    init();

    function init() {
        addListener();
        loading.createLoading();
        $.when(
            getBankCardList(),
            getUser()
        ).then(function() {
            loading.hideLoading();
        }, function() {
            loading.hideLoading();
        })
    }
    // 获取银行卡列表
    function getBankCardList(){
        return Ajax.get("802016", {
            userId: base.getUserId(),
            status: "1"
        }).then(function(res){
            if(res.success && res.data.length){
                bankFlag = 1;
                $("#bankFlag").html("已绑定");
            }else{
                AddOrEditBankCard.addCont({
                    success: function(bankcardNumber, bankName){
                        bankFlag = 1;
                        $("#bankFlag").html("已绑定");
                    },
                    error: function(msg){
                        base.showMsg(msg);
                    }
                });
                $("#bankFlag").html("未绑定");
            }
        });
    }
    function addListener() {
        $("#mobileWrap").on("click", function() {
            if (mobile)
                ChangeMobile.showMobileCont();
            else
                BindMobile.showMobileCont();
            }
        );
        $("#identityWrap").on("click", function(){
			Identity.showIdentity();
		});
        $("#bankWrap").on("click", function() {
            if (bankFlag)               //已经绑定银行卡
                location.href = "./bankcard.html";
            else                        //未绑定银行卡
                AddOrEditBankCard.showCont();
        });
        $("#tradeWrap").on("click", function(){
            if(!mobile){
                base.showMsg("请先绑定手机号");
                return;
            }
            if(tradepwdFlag){
                ChangeTradePwd.showCont();
            }else{
                SetTradePwd.addCont({
                    success: function(){
                        tradepwdFlag = true;
                        $("#tradeName").text("修改交易密码");
                    },
                    error: function(msg){
                        base.showMsg(msg);
                    },
                    mobile: mobile
                });
                SetTradePwd.showCont();
            }
		});
        $("#address").on("click", function() {
            if (addressFlag)               
                location.href = "./add_address.html";
            else                        
                location.href = "./address_list.html";
        });
    }

    function getUser() {
        return base.getUser().then(function(res) {
            if (res.success) {
                $("#nickname").html(res.data.nickname);
                mobile = res.data.mobile;
                if (mobile = res.data.mobile) {
                    $("#mobileName").text("修改手机号");
                    $("#mobile").text(mobile);
                    ChangeMobile.addMobileCont({
                        success: function(res) {
                            mobile = res;
                            $("#mobile").text(mobile);
                        },
                        error: function(msg) {
                            base.showMsg(msg);
                        }
                    });
                } else {
                    BindMobile.addMobileCont({
                        success: function(res) {
                            mobile = res;
                            $("#mobile").text(mobile);
                            $("#mobileName").text("修改手机号");
                            ChangeMobile.addMobileCont({
                                success: function(res) {
                                    mobile = res;
                                    $("#mobile").text(mobile);
                                },
                                error: function(msg) {
                                    base.showMsg(msg);
                                }
                            });
                        },
                        error: function(msg) {
                            base.showMsg(msg);
                        }
                    });
                }
                identityFlag = !!res.data.realName;
				if( identityFlag ){
					$("#identityFlag").text("已绑定");
					Identity.addIdentity({
						disabled: true,
						realName: res.data.realName,
						idNo: res.data.idNo
					});
				}else{
					Identity.addIdentity({
						success: function(realName, idNo){
							identityFlag = true;
							$("#identityFlag").text("已绑定");
                            Identity.refreshOption({
                                realName: realName,
                                idNo: idNo,
                                disabled: 1
                            });
						},
						error: function(msg){
							base.showMsg(msg);
						}
					});
					$("#identityFlag").text("未绑定");
				}
                tradepwdFlag = res.data.tradepwdFlag != "0";
                if( tradepwdFlag ){
                    $("#tradeName").text("修改交易密码");
                    ChangeTradePwd.addCont({
                        error: function(msg){
                            base.showMsg(msg);
                        }
                    });
                }else{
                    if(mobile){
                        SetTradePwd.addCont({
                            success: function(){
                                tradepwdFlag = true;
    							$("#tradeName").text("已绑定");
                            },
    						error: function(msg){
    							base.showMsg(msg);
    						},
                            mobile: mobile
                        });
                    }

                }
            }
        });
    }
});
