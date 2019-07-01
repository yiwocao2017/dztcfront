define([
    'jquery',
    'app/util/ajax',
    'app/module/loading/loading',
    'iScroll'
], function ($, Ajax, loading, iScroll) {
    var tmpl = __inline("citySelect.html");
    var css = __inline("citySelect.css");
    var defaultOpt = {};
    var searchData = [];
    var PROVINCE, CITY, AREA;
    var DW_PROVINCE, DW_CITY, DW_AREA;
    var innerScroll, firstSelect = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }

    function _addListener(){
        var wrap = $("#city-select-module-wrap");
        wrap.find(".city-select-module-title").on("touchmove", function(e){
            e.preventDefault();
        });
        wrap.find(".city-select-module-back").on("click", function () {
            obj.hideCont();
        })
        wrap.on("click", ".city-select-module-city-list-item", function (e) {
            var _self = $(this),
                prov = _self.attr("prov"),
                city = _self.attr("city");
            _self.siblings(".on").removeClass("on");
            _self.addClass("on");
            //根据当前选择的城市更新
            PROVINCE = defaultOpt.cityList[prov].p;
            
            AREA = "";
            if(city){
                CITY = defaultOpt.cityList[prov].c[city].n;
                $("#city-select-module-dq").html('<span prov="' + prov + '" city="' + city + '">'+CITY+'</span>');
            }else{
                $("#city-select-module-dq").html('<span prov="' + prov + '">'+PROVINCE+'</span>');
                CITY = PROVINCE;
            }
            loading.createLoading();
            var myGeo = new BMap.Geocoder();
            // 将地址解析结果显示在地图上,并调整地图视野
            myGeo.getPoint(PROVINCE+CITY, function(point){
                loading.hideLoading();
                if (point) {
                    myGeo.getLocation(point, function(rs){
                        sessionStorage.setItem("address", rs.address);
                        sessionStorage.setItem("province", PROVINCE);
                        sessionStorage.setItem("city", CITY);
                        sessionStorage.setItem("area", AREA);
                        sessionStorage.setItem("longitude", point.lng);
                        sessionStorage.setItem("latitude", point.lat);
                    });
                }else{
                    // alert("您选择地址没有解析到结果!");
                    base.showMsg("地址选择解析失败");
                }
                obj.hideCont(defaultOpt.success);
            });
            
        });
        $("#city-select-module-dw, #city-select-module-dq").on("click", function () {
            var _self = $(this),
                prov = _self.find("span").attr("prov"),
                city = _self.find("span").attr("city");
            //根据当前选择的城市更新
            PROVINCE = defaultOpt.cityList[prov].p;
            AREA = "";
            if(city){
                CITY = defaultOpt.cityList[prov].c[city].n;
                $("#city-select-module-dq").html('<span prov="' + prov + '" city="' + city + '">'+CITY+'</span>');
                wrap.find(".on").removeClass("on");
                wrap.find(".city-select-module-city-list-item[prov="+PROVINCE+"][city="+CITY+"]").addClass("on");
            }else{
                $("#city-select-module-dq").html('<span prov="' + prov + '">'+PROVINCE+'</span>');
                CITY = PROVINCE;
                wrap.find(".on").removeClass("on");
                wrap.find(".city-select-module-city-list-item[prov="+PROVINCE+"]").addClass("on");
            }
            loading.createLoading();
            var myGeo = new BMap.Geocoder();
            // 将地址解析结果显示在地图上,并调整地图视野
            myGeo.getPoint(PROVINCE+CITY, function(point){
                loading.hideLoading();
                if (point) {
                    sessionStorage.setItem("province", PROVINCE);
                    sessionStorage.setItem("city", CITY);
                    sessionStorage.setItem("area", AREA);
                    sessionStorage.setItem("longitude", point.lng);
                    sessionStorage.setItem("latitude", point.lat);
                }else{
                    // alert("您选择地址没有解析到结果!");
                    base.showMsg("地址选择解析失败");
                }
                obj.hideCont(defaultOpt.success);
            });
        })
    }
    function _getCitySelect(cityList) {
        PROVINCE = sessionStorage.getItem("province");
        CITY = sessionStorage.getItem("city");
        AREA = sessionStorage.getItem("area");
        DW_PROVINCE = sessionStorage.getItem("dw-province");
        DW_CITY = sessionStorage.getItem("dw-city");
        DW_AREA = sessionStorage.getItem("dw-area");
        defaultOpt.success(CITY);
        if(PROVINCE == CITY){
            CITY = AREA;
            AREA = "";
        }
        var html = "";
        $.each(cityList, function(i, prov) {
            //省市区
            if (prov.c[0].a) {
                $.each(prov.c, function(j, city) {
                    //按顺序保存位置信息，工搜索用
                    searchData.push(city.n);
                    //如果是当前定位的位置，则显示并保存到session中
                    if (city.n == CITY) {
                        html += '<div class="city-select-module-city-list-item on" prov="' + i + '" city="' + j + '">' + city.n + '</div>';
                        $("#city-select-module-dq").html('<span prov="' + i + '" city="' + j + '">'+city.n+'</span>');
                    } else {
                        html += '<div class="city-select-module-city-list-item" prov="' + i + '" city="' + j + '">' + city.n + '</div>';
                    }
                    if(city.n == DW_CITY){
                        $("#city-select-module-dw").html('<span prov="' + i + '" city="' + j + '">'+city.n+'</span>');
                    }
                });
            //市区
            } else {
                //按顺序保存位置信息，供搜索用
                searchData.push(prov.p);
                //如果是当前定位的位置，则显示并保存到session中
                if (prov.p == PROVINCE) {
                    $("#city-select-module-dq").html('<span prov="' + i + '">'+prov.p+'</span>');
                    html += '<div class="city-select-module-city-list-item on" prov="' + i + '">' + prov.p + '</div>';
                } else {
                    html += '<div class="city-select-module-city-list-item" prov="' + i + '">' + prov.p + '</div>';
                }
                if(prov.p == DW_PROVINCE){
                    $("#city-select-module-dw").html('<span prov="' + i + '">'+prov.p+'</span>');
                }
            }
        });
        $("#city-select-module-city-list").html(html);
        innerScroll = new iScroll('city-select-module-wrapper', {
            useTransition: false
        });
    }
    var obj = {
        addCont: function (option) {
            if(!this.hasCont()){
                loading.createLoading();
                option = option || {};
                defaultOpt = $.extend(defaultOpt, option);
                var temp = $(tmpl);
                $("body").append(tmpl);
                _getCitySelect(defaultOpt.cityList);
                _addListener();
                loading.hideLoading();
            }
            return this;
        },
        hasCont: function(){
            var cont = $("#city-select-module-wrap");
            if(!cont.length)
                return false
            return true;
        },
        showCont: function (){
            if(!this.hasCont())
                this.addCont();
            var cont = $("#city-select-module-wrap");
            cont.show().animate({
                top: 0
            }, 200, function () {
                if(firstSelect){
                    innerScroll.refresh();
                }
                firstSelect = false;
            });
            return this;
        },
        hideCont: function (func){
            if(this.hasCont()){
                var cont = $("#city-select-module-wrap");
                cont.animate({
                    top: '100%'
                }, 200, function(){
                    cont.hide();
                });
                func && func(CITY);
            }
            return this;
        }
    };
    return obj;
});