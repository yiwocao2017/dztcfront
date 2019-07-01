define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading'
], function(base, Ajax, loading) {
    var code = base.getUrlParam("code");
    var choseIdx = 0;

    init();

    function init() {
        if (!code) {
            base.showMsg("未传入订单编号");
            return;
        }

        $.when(
            getAccount(),
            getOrder()
        ).then(function () {
            loading.hideLoading();
        }, function () {
            loading.hideLoading();
        });
        addListener();
    }

    function getAccount() {
        return Ajax.get("802503", {
            userId: base.getUserId()
        }).then(function (res) {
            if(res.success && res.data.length){
                var data = res.data;
                $.each(data, function (i, d) {
                    if(d.currency == "CNY")
                        $("#CNYAmount").html(base.formatMoney(d.amount));
                });
            }else{
                res.msg && base.showMsg(res.msg);
            }
        }, function () {
            base.showMsg("账号信息获取失败");
        });
    }

    function getOrder() {
        return Ajax.get("620221", {
                code: code
            })
            .then(function(res) {
                if (res.success) {
                    if(res.data.status != "2"){
                        base.showMsg("该订单不是带支付状态");
                        setTimeout(function(){
                            location.href = "/";
                        }, 1000);
                        return;
                    }
                    $("#price").html(base.formatMoney(res.data.amount));
                } else {
                    base.showMsg(res.msg);
                }
            }, function () {
                base.showMsg("订单信息获取失败");
            });
    }

    function addListener() {
        $("#content").on("click", ".pay-item", function() {
            var _self = $(this),
                idx = _self.index();
            _self.siblings(".active").removeClass("active");
            _self.addClass("active");
            choseIdx = idx;
        });
        $("#payBtn").on("click", function() {
            if (choseIdx == 1) {
                // 微信支付
                wxPayOrder();
            } else if(choseIdx == 0){
                // 余额支付
                payOrder();
            }
        });
    }
    // 余额支付
    function payOrder() {
        loading.createLoading("支付中...");
        Ajax.post("620204", {
            json: {
                orderCode: code,
                payType: "1"
            }
        }).then(function(res) {
            loading.hideLoading();
            if(res.success) {
                base.showMsg("支付成功");
                setTimeout(function() {
                    location.href = "/";
                }, 1000);
            }else{
                base.showMsg(res.msg);
            }
        }, function() {
            loading.hideLoading();
            base.showMsg("非常抱歉，支付失败");
        });
    }
    // 微信支付
    function wxPayOrder() {
        loading.createLoading("支付中...");
        Ajax.post("620204", {
            json: {
                orderCode: code,
                payType: "2"
            }
        }).then(wxPay, function() {
            loading.hideLoading();
            base.showMsg("非常抱歉，支付请求提交失败");
        });
    }
    var response = {};

    function onBridgeReady() {
        WeixinJSBridge.invoke(
            'getBrandWCPayRequest', {
                "appId": response.data.appId, //公众号名称，由商户传入
                "timeStamp": response.data.timeStamp, //时间戳，自1970年以来的秒数
                "nonceStr": response.data.nonceStr, //随机串
                "package": response.data.wechatPackage,
                "signType": response.data.signType, //微信签名方式：
                "paySign": response.data.paySign //微信签名
            },
            function(res) {
                loading.hideLoading();
                // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                if (res.err_msg == "get_brand_wcpay_request:ok") {
                    base.showMsg("支付成功");
                    setTimeout(function() {
                        location.href = "/";
                    }, 1000);
                } else {
                    base.showMsg("支付失败");
                }
            }
        );
    }

    function wxPay(response1) {
        response = response1;
        if (response.data && response.data.signType) {
            if (typeof WeixinJSBridge == "undefined") {
                if (document.addEventListener) {
                    document.removeEventListener("WeixinJSBridgeReady", onBridgeReady);
                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                } else if (document.attachEvent) {
                    document.detachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.detachEvent('onWeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                }
            } else {
                onBridgeReady();
            }
        } else {
            loading.hideLoading();
            base.showMsg(response1.msg || "微信支付失败");
        }
    }
});
