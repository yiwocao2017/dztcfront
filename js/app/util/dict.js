define([], function() {
    var dict = {
        orderStatus: {
            "1": "待量体",
            "2": "已定价",
            "3": "已支付",
            "4": "待复核",
            "5": "待生产",
            "6": "生产中",
            "7": "已发货",
            "8": "已收货",
            "9": "取消订单"
        }
    };

    return {
        get: function(code) {
            return dict[code];
        }
    }
});
