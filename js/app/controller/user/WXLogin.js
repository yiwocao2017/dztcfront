define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading'
], function(base, Ajax, loading) {
    var returnUrl = base.getReturnParam();
    init();
    function init(){
        loading.createLoading();
        getAppID();
    }
    function getAppID(){
        Ajax.get("806031", {
            companyCode: SYSTEM_CODE,
            account: "ACCESS_KEY",
            type: "3"
        })
        .then(function(res) {
            if (res.success && res.data.length) {
                var appid = res.data[0].password;
                var redirect_uri = base.getDomain() + "/user/redirect.html";
                location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_userinfo#wechat_redirect";
            } else {
                loading.hideLoading();
                base.showMsg("非常抱歉，微信登录失败");
                setTimeout(function(){
                    location.href = "../index.html";
                }, 1000);
            }
        }, function() {
            loading.hideLoading();
            base.showMsg("非常抱歉，微信登录失败");
            setTimeout(function(){
                location.href = "../index.html";
            }, 1000);
        });
    }
});