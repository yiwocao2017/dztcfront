define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/module/scroll/scroll',
    'app/util/handlebarsHelpers',
    'app/module/setTradePwd/setTradePwd',
], function(base, Ajax, loading, scroll, Handlebars, SetTradePwd) {

    var myScroll, isEnd = false, isLoading = false;
    var integralTmpl = __inline("../../ui/integral.handlebars");
    var config = {
        start: 1,
        limit: 20,
        currency: "CNY"
    }, tradepwdFlag = false;

    init();

    function init() {
        initIScroll();
        getInitData();

        addListener();
    }

    function initIScroll(){
        myScroll = scroll.getInstance().getNormalScroll({
            loadMore: function () {
                getPageintegral();
            },
            refresh: function () {
                isEnd = false;
                getPageintegral(true);
            }
        });
    }
    function getInitData() {
        loading.createLoading();
        $.when(
            base.getUser(),
            getAccountList()
        ).then(function(res){
            if(res.success && res.data.tradepwdFlag == "1"){
                tradepwdFlag = true;
            }else{
                tradepwdFlag = false;
                SetTradePwd.addCont({
                    success: function(){
                        tradepwdFlag = true;
                        $("#tradeName").text("修改交易密码");
                    },
                    error: function(msg){
                        base.showMsg(msg);
                    },
                    mobile: res.data.mobile
                });
            }
            getPageintegral().then(loading.hideLoading);
        }, function () {
            loading.hideLoading();
        });
        Handlebars.registerHelper('formatAmount', function(num) {
            if (!num && num !== 0)
                return "--";
            num = +num / 1000;
            num = (num+"").replace(/^(-?\d+\.\d\d)\d*/i, "$1");
            num = +num;
            return num > 0 ? "+" + (num.toFixed(2)) : num.toFixed(2);
        });
    }
    // 获取账户信息
    function getAccountList() {
        return Ajax.get("802503", {
            userId: base.getUserId()
        }).then(function (res) {
            if(res.success && res.data.length){
                var data = res.data;
                $.each(data, function (i, d) {
                    if(d.currency == "CNY"){
                        $("#amount").html(base.formatMoney(d.amount));
                        config.accountNumber = d.accountNumber;
                    }
                });
            }else{
                res.msg && base.showMsg(res.msg);
            }
        }, function () {
            base.showMsg("账户信息获取失败");
        });
    }
    // 分页查询流水
    function getPageintegral(refresh) {
        if (!isLoading && (!isEnd || refresh)) {
            config.start = refresh && 1 || config.start;
            isLoading = true;
            base.showPullUp();

            return Ajax.get("802524", config, !refresh).then(function(res) {
                if (res.success && res.data.list.length) {
                    var list = res.data.list, html = "";
                    if (list.length < config.limit) {
                        isEnd = true;
                    }
                    $("#integralWrap")[refresh
                            ? "html"
                            : "append"](integralTmpl({items: list}));
                    config.start++;
                } else {
                    if (refresh) {
                        $("#integralWrap").empty();
                    }
                    isEnd = true;
                    res.msg && base.showMsg(res.msg);
                }
                base.hidePullUp();
                myScroll.refresh();
                isLoading = false;
            }, function() {
                isLoading = false;
                isEnd = true;
                base.hidePullUp();
            });
        }
    }
    function addListener(){
        $("#charge").on("click", function(){
            location.href = "../pay/charge.html";
        });
        $("#withdraw").on("click", function(){
            if(tradepwdFlag){
                location.href = "./withdraw.html";
            }else{
                base.confirm("您还未设置交易密码，无法提现。<br/>请先设置交易密码")
                    .then(function(){
                        SetTradePwd.showCont();
                    }, function(){});
            }
        });
    }
});
