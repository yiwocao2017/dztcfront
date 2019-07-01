define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/module/scroll/scroll',
    'app/util/dict'
], function(base, Ajax, loading, scroll, Dict) {

    var myScroll,
        isEnd = false,
        isLoading = false;
    var orderStatus = Dict.get("orderStatus");
    var config = {
            start: 1,
            limit: 10,
            applyUser: base.getUserId()
        },
        citylist;

    init();

    function init() {
        initIScroll();
        loading.createLoading();
        getInitData(true);
        addListener();
    }
    function getInitData(refresh) {

        $.when(getAccountList(refresh), getUser(refresh), getPageOrder(refresh)).then(function() {
            loading.hideLoading();
        }, function() {
            loading.hideLoading();
        });
    }
    // 获取用户详情
    function getUser(refresh) {
        return base.getUser(refresh).then(function(res) {
            if (res.success) {
                $("#nickname").html(res.data.nickname);
                $("#avatar").attr("src", base.getImg(res.data.userExt.photo));
                $("#mobile").html(res.data.mobile);
            }
            myScroll.refresh();
        }, function() {
            myScroll.refresh();
        });
    }
    // 获取账户信息
    function getAccountList(refresh) {
        return Ajax.get("802503", {
            userId: base.getUserId()
        }, !refresh).then(function(res) {
            if (res.success && res.data.length) {
                var data = res.data;
                $.each(data, function(i, d) {
                    if (d.currency == "CNY")
                        $("#amount").html(base.formatMoney(d.amount));
                    }
                );
            } else {
                res.msg && base.showMsg(res.msg);
            }
        }, function() {
            base.showMsg("账号信息获取失败");
        });
    }
    function initIScroll() {
        myScroll = scroll.getInstance().getNormalScroll({
            loadMore: function() {
                getPageOrder();
            },
            refresh: function() {
                isEnd = false;
                getInitData(true);
            }
        });
    }

    function getPageOrder(refresh) {
        if (!isLoading && (!isEnd || refresh)) {
            isLoading = true;
            base.showPullUp();
            config.start = refresh && 1 || config.start;
            /*
            "1": "待量体",         取消预约
            "2": "已定价",         去付款
            "3": "已支付",
            "4": "待复核",
            "5": "待生产",
            "6": "生产中",
            "7": "已发货",         确认收货
            "8": "已收货",
            "9": "取消订单"
            */
            return Ajax.get("620223", config, !refresh).then(function(res) {
                if (res.success && res.data.list.length) {
                    var list = res.data.list,
                        html = '';
                    if (list.length < config.limit) {
                        isEnd = true;
                    }
                    $.each(list, function(index, item) {
                        html += '<div class="mb20 index-order-item" data-code="' + item.code + '">' +
                            '<div class="ba wp100 plr30 fs26 ptb30 bb p-r">' +
                                '<div class="number co9 mb20">订单编号：' + item.code + '</div>' +
                                '<span class="fr p-a state fs24 red">' + orderStatus[item.status] + '</span>';
                        if(item.ltUserDO){
                            html += '<div class="mb20">' +
                                '<div class="phone co9  inline_block">联系电话：</div>' +
                                '<span class="blue">' + item.ltUserDO.mobile + '</span>' +
                            '</div>';
                        }
                        html += '<div class="map co9 mb20">地址：' + getAddress(item) + '</div>' +
                                '<div class="time co9 ">预约时间：' + base.formatDate(item.ltDatetime, "yyyy-MM-dd") + '</div>' +
                            '</div>' +
                        '<div class="wp100 lh100 hig100 ba plr30  pt18 clearfix">';
                        if (item.status == "1") {
                            html += '<input type="button" value="取消预约" class="cancel-order cha-but tc co9 fs26 ba fr  ml20 mtb20">';
                        } else if (item.status == "2") {
                            html += '<input type="button" value="去付款 " class="pay-order cancel tc red fs26 ba fr mtb20 ml20">';
                        } else if (item.status == "7") {
                            html += '<input type="button" value="确认收货" class="confirm-receive cha-but tc co9 fs26 ba fr  ml20 mtb20">';
                        }
                        html += '<input type="button" value="查看" class="watch-order cha-but tc co9 fs26 ba fr mtb20">' + '</div>' + '</div>';
                    });
                    $("#content")[refresh
                            ? "html"
                            : "append"](html);
                    config.start++;
                } else {
                    if (refresh) {
                        $("#content").html('');
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
                if (refresh) {
                    $("#content").html('');
                }
                base.hidePullUp();
                myScroll.refresh();
            });
        }
    }
    function getAddress(addr){
        if(addr.ltProvince == addr.ltCity){
            addr.ltProvince = "";
        }
        return addr.ltProvince + addr.ltCity + addr.ltArea + addr.ltAddress;
    }
    function addListener() {
        // 点击头部，进入用户信息页面
        $("#getMore").on('click', function() {
            location.href = './user/user.html';
        });
        // 点击余额，进入账户页面
        $("#goAccount").on('click', function() {
            location.href = './user/account.html';
        });
        // 预约量体
        $("#yylt").on("click", function() {
            location.href = './biz/book.html';
        });
        // 一键复购
        $("#yjfg").on("click", function() {
            location.href = './biz/repurchase.html';
        });
        // 查看订单
        $("#content").on("click", ".index-order-item", function(e) {
            location.href = './biz/order.html?code=' + $(this).attr("data-code");
        });
        // 查看订单
        $("#content").on("click", ".watch-order", function(e) {
            e.stopPropagation();
            e.preventDefault();
            location.href = './biz/order.html?code=' + $(this).closest(".index-order-item").attr("data-code");
        });
        // 支付订单
        $("#content").on("click", ".pay-order", function(e) {
            e.stopPropagation();
            e.preventDefault();
            location.href = './pay/pay.html?code=' + $(this).closest(".index-order-item").attr("data-code");
        });
        // 确认收货
        $("#content").on("click", ".confirm-receive", function(e) {
            e.stopPropagation();
            e.preventDefault();
            var code = $(this).closest(".index-order-item").attr("data-code");
            base.confirm("确认收货吗").then(function() {
                receiveOrder(code);
            }, base.emptyFun);
        });
        // 取消预约
        $("#content").on("click", ".cancel-order", function(e) {
            e.stopPropagation();
            e.preventDefault();
            var code = $(this).closest(".index-order-item").attr("data-code");
            base.confirm("确认取消预约吗").then(function() {
                cancelOrder(code);
            }, base.emptyFun);
        });
    }
    // 取消预约
    function cancelOrder(code) {
        loading.showLoading("取消中...");
        Ajax.post("620211", {
            json: {
                updater: base.getUserId(),
                orderCode: code
            }
        }).then(function(res) {
            loading.hideLoading();
            if (res.success) {
                base.showMsg("取消成功");
                getPageOrder(true);
            } else {
                base.showMsg(res.msg);
                loading.hideLoading();
            }
        }, function() {
            base.showMsg('取消失败');
            loading.hideLoading();
        });
    }
    // 确认收货
    function receiveOrder(code) {
        loading.showLoading("操作中...");
        Ajax.post("620210", {
            json: {
                orderCode: code,
                updater: base.getUserId()
            }
        }).then(function(res) {
            loading.hideLoading();
            if (res.success) {
                base.showMsg("收货成功");
                getPageOrder(true);
            } else {
                base.showMsg(res.msg);
                loading.hideLoading();
            }
        }, function() {
            base.showMsg('收货失败');
            loading.hideLoading();
        });
    }
});
