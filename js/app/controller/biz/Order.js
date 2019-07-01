define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/util/dict'
], function(base, Ajax, loading, Dict) {

    var code = base.getUrlParam("code");
    var orderStatus = Dict.get("orderStatus");

    init();

    function init() {
        if(!code){
            base.showMsg("未传入订单编号");
            return;
        }
        loading.createLoading();
        $.when(
            base.getDictList("wl_company"),
            getOrder()
        ).then(function(res1, res2){
            loading.hideLoading();
            if(res1.success && res2.success){
                var wl_data = res1.data, wlCompany = {};
                for(var i = 0; i < wl_data.length; i++){
                    wlCompany[wl_data[i].dkey] = wl_data[i].dvalue;
                }
                var data = res2.data;
                $("#code").html(data.code);
                $("#applyName").html(data.applyName);
                $("#applyMobile").html(data.applyMobile);
                $("#address").html(getAddress(data));
                $("#ltDatetime").html(base.formatDate(data.ltDatetime, "yyyy-MM-dd"));
                $("#applyNote").html(data.applyNote || "无");
                $("#createDatetime").html(base.formatDate(data.createDatetime, "yyyy-MM-dd hh:mm"));
                $("#status").html(orderStatus[data.status]);
                if(data.ltUserDO){
                    $("#ltMobileWrap, #ltRealNameWrap").removeClass("hidden");
                    $("#ltRealName").html(data.ltUserDO.realName);
                    $("#ltMobile").html('<a href="tel://'+data.ltUserDO.mobile+'">'+data.ltUserDO.mobile+'</a>');
                }
                if(data.logisticsCode){
                    $("#logisticsWrap").removeClass("hidden");
                    $("#logisticsCode").html(data.logisticsCode);
                    $("#logisticsCompany").html(wlCompany[data.logisticsCompany]);
                    $("#deliverer").html(data.deliverer);
                    $("#deliveryDatetime").html(base.formatDate(data.deliveryDatetime, "yyyy-MM-dd"));
                    $("#reAddress").html(data.reAddress);
                }
            }else{
                base.showMsg(res1.msg || res2.msg);
            }
        }, function(){
            loading.hideLoading();
            base.showMsg("订单信息加载失败");
        });
        getOrder();
    }

    function getOrder(){
        return Ajax.get("620221", {
            code: code
        });
    }
    function getAddress(addr){
        if(addr.ltProvince == addr.ltCity){
            addr.ltProvince = "";
        }
        return addr.ltProvince + addr.ltCity + addr.ltArea + addr.ltAddress;
    }
});
