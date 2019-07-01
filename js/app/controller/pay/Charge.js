define([
    'js/app/controller/base',
    'js/app/util/ajax',
    'js/app/module/loading/loading',
    'js/app/module/validate/validate'
], function(base, Ajax, loading, Validate) {
    var accountNumber;
    var userId = base.getUserId();
    var openId = "";
    init();
    function init(){
        addListeners();
        getOpeanId();
    }

    function addListeners(){
        $("#chargeForm").validate({
            'rules': {
                amount: {
                    required: true,
                    "isPositive": true
                }
            },
            onkeyup: false
        });
        $("#sbtn").on("click", function(){
            if($("#chargeForm").valid()){
                if(openId){
                    charge();
                }else{
                    base.showMsg("请用微信登录");
                }
            }
        });
    }
    function getOpeanId(refresh) {
        return Ajax.get("805056", {
            userId: userId
        }, !refresh)
            .then(function(res){
                if(res.success){
                    openId = res.data.openId;
                }
            });
    }
    // 充值
    function charge(){
        loading.createLoading("提交中...");
        var param = $("#chargeForm").serializeObject();
        param.applyUser = userId;
        param.channelType = "35";
        param.amount = +param.amount * 1000;
        param.openId = openId;
        Ajax.post("802710", {json: param})
            .then(wxPay, function() {
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
                        history.back();
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
            console.log(response1.msg)
            base.showMsg(response1.msg || "微信支付失败");
        }
    }
})
