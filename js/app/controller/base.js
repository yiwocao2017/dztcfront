define([
    'jquery',
    'app/util/ajax',
    'app/util/dialog'
], function($, Ajax, dialog) {

    if (Number.prototype.toFixed) {
        var ori_toFixed = Number.prototype.toFixed;
        Number.prototype.toFixed = function() {
            var num = ori_toFixed.apply(this, arguments);
            if (num == 0 && num.indexOf('-') == 0) { // -0 and 0
                num = num.slice(1);
            }
            return num;
        }
    }

    String.prototype.temp = function(obj) {
        return this.replace(/\$\w+\$/gi, function(matchs) {
            var returns = obj[matchs.replace(/\$/g, "")];
            return (returns + "") == "undefined" ? "" : returns;
        });
    };

    Date.prototype.format = function(format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };

    $.prototype.serializeObject = function() {
        var a, o, h, i, e;
        a = this.serializeArray();
        o = {};
        h = o.hasOwnProperty;
        for (i = 0; i < a.length; i++) {
            e = a[i];
            if (!h.call(o, e.name)) {
                o[e.name] = e.value;
            }
        }
        return o;
    };

    var Base = {
        encodeInfo: function(info, headCount, tailCount, space) {
            headCount = headCount || 0;
            tailCount = tailCount || 0;
            info = info.trim();
            var header = info.slice(0, headCount),
                len = info.length,
                tailer = info.slice(len - tailCount),
                mask = '**************************************************', // allow this length
                maskLen = len - headCount - tailCount;
            if (space) {
                mask = '**** **** **** **** **** **** **** **** **** **** **** ****';
            }
            return maskLen > 0 ? (header + mask.substring(0, maskLen + (space ? maskLen / 4 : 0)) + (space ? ' ' : '') + tailer) : info;
        },
        formatDate: function(date, format){
            if(!date)
                return "--";
            if(typeof date == "string")
                date = date.replace(/(12:\d\d:\d\d\s)AM$/, "$1PM");
            return new Date(date).format(format || "yyyy-MM-dd");
        },
        getImg: function(pic){
            if(!pic){
                return "";
            }
            pic = pic.split(/\|\|/)[0];
            if(!/^http/i.test(pic)){
                pic = PIC_PREFIX + pic + THUMBNAIL_SUFFIX;
            }
            return pic;
        },
        getImg1: function(pic){
            if(!pic){
                return "";
            }
            pic = pic.split(/\|\|/)[0];
            if(!/^http/i.test(pic)){
                pic = PIC_PREFIX + pic;
            }
            return pic;
        },
        getUrlParam: function(name, locat) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = (locat || window.location.search).substr(1).match(reg);
            if (r != null) return decodeURIComponent(r[2]);
            return '';
        },
        findObj: function(array, key, value, key2, value2) {
            var i = 0,
                len = array.length,
                res;
            for (i; i < len; i++) {
                if (array[i][key] == value && !key2) {
                    return array[i];
                } else if (key2 && array[i][key] == value && array[i][key2] == value2) {
                    return array[i];
                }
            }
        },
        formatMoney: function(s, t) {
            if(!$.isNumeric(s))
                return "--";
            var num = +s / 1000;
            num = (num+"").replace(/^(\d+\.\d\d)\d*/i, "$1");
            return (+num).toFixed(t || 2);
        },
        fZeroMoney: function(s) {
            // if(!$.isNumeric(s))
            //     return "--";
            // var num = +s / 1000;
            // num = (num+"").replace(/^(\d+)(\.\d*)?/i, "$1");
            // return (+num).toFixed(0);
            return Base.formatMoney(s);
        },
        getDictList: function(type){
            return Ajax.get("807706", {
                parentKey: type
            });
        },
        getSysConfig: function (key) {
            return Ajax.get("807717", {
                "ckey": key
            });
        },
        calculateSecurityLevel: function(password) {
            var strength_L = 0;
            var strength_M = 0;
            var strength_H = 0;

            for (var i = 0; i < password.length; i++) {
                var code = password.charCodeAt(i);
                // 数字
                if (code >= 48 && code <= 57) {
                    strength_L++;
                    // 小写字母 大写字母
                } else if ((code >= 65 && code <= 90) ||
                    (code >= 97 && code <= 122)) {
                    strength_M++;
                    // 特殊符号
                } else if ((code >= 32 && code <= 47) ||
                    (code >= 58 && code <= 64) ||
                    (code >= 94 && code <= 96) ||
                    (code >= 123 && code <= 126)) {
                    strength_H++;
                }
            }
            // 弱
            if ((strength_L == 0 && strength_M == 0) ||
                (strength_L == 0 && strength_H == 0) ||
                (strength_M == 0 && strength_H == 0)) {
                return "1";
            }
            // 强
            if (0 != strength_L && 0 != strength_M && 0 != strength_H) {
                return "3";
            }
            // 中
            return "2";
        },
        isAddrEqual: function(name1, name2){
            return name1 == name2 || name2.indexOf(name1) != -1 || name1.indexOf(name2) != -1 || false
        },
        //获取地址json
        getAddress: function() {
            var addr = localStorage.getItem("addr");
            if (addr) {
                var defer = jQuery.Deferred();
                addr = $.parseJSON(addr);
                if (!addr.citylist) {
                    addr = $.parseJSON(addr);
                }
                defer.resolve(addr);
                return defer.promise();
            } else {
                return Ajax.get1("/static/js/lib/city.min.json")
                    .then(function(res) {
                        if (res.citylist) {
                            localStorage.setItem("addr", JSON.stringify(res));
                            return res;
                        }
                        localStorage.setItem("addr", JSON.stringify(res));
                        return $.parseJSON(res);
                    });
            }
        },
        getDomain: function() {
            return location.origin;
        },
        isNotFace: function(value) {
            var pattern = /^[\s0-9a-zA-Z\u4e00-\u9fa5\u00d7\u300a\u2014\u2018\u2019\u201c\u201d\u2026\u3001\u3002\u300b\u300e\u300f\u3010\u3011\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff0d\uff03\uffe5\x21-\x7e]*$/;
            return pattern.test(value);
        },
        showMsg: function(msg, time) {
            var d = dialog({
                content: msg,
                quickClose: true
            });
            d.show();
            setTimeout(function() {
                d.close().remove();
            }, time || 1500);
        },
        makeReturnUrl: function(param) {
            var url = location.pathname + location.search;
            if(param){
                var str = "";
                for(var n in param){
                    str += "&" + n + "=" + param[n];
                }
                if(/\?/i.test(url)){
                    url = url + str;
                }else{
                    url = url + "?" + str.substr(1, str.length);
                }
            }
            return encodeURIComponent(url);
        },
        getReturnParam: function() {
            var re = Base.getUrlParam("return");
            if (re) {
                return encodeURIComponent(re);
            }
            return "";
        },
        goBackUrl: function(url, isLoginBack) {
            var rUrl = Base.getUrlParam("return");
            if(isLoginBack){
                var returnUrl = sessionStorage.getItem("l-return");
                location.href = returnUrl || url || "../user/user.html";
            }else{
                if (rUrl) {
                    location.href = rUrl;
                } else {
                    location.href = url || "../index.html";
                }
            }

        },
        isLogin: function() {
            return !!sessionStorage.getItem("user");
        },
        getUser: function(refresh) {
            return Ajax.get("805056", {
                userId: Base.getUserId()
            }, !refresh)
                .then(function(res){
                    if(res.success){
                        Base.setSessionUserInfo(res.data);
                    }
                    return res;
                }, function(res){
                    return res;
                });
        },
        getUserId: function() {
            return sessionStorage.getItem("user") || "";
        },
        setSessionUser: function(res) {
            sessionStorage.setItem("user", res.data.userId);
            sessionStorage.setItem("tk", res.data.token);
        },
        setSessionUserInfo: function(data){
            data && sessionStorage.setItem("u_info", JSON.stringify(data));
        },
        getSessionUserInfo: function(){
            var info = sessionStorage.getItem("u_info");
            return info && $.parseJSON(info) || {};
        },
        //清除sessionStorage中和用户相关的数据
        clearSessionUser: function() {
            sessionStorage.removeItem("user"); //userId
            sessionStorage.removeItem("tk"); //token
        },
        //登出
        logout: function() {
            Base.clearSessionUser();
        },
        hidePullUp: function(){
            $("#pullUp").css("visibility", "hidden");
        },

        showPullUp: function(){
            $("#pullUp").css("visibility", "visible");
        },
        goLogin: function(){
            sessionStorage.setItem("l-return", location.pathname + location.search);
            location.href = "../user/redirect.html";
        },
        confirm: function(msg) {
            return (new Promise(function (resolve, reject) {
                var d = dialog({
                    content: msg,
                    ok: function () {
                        var that = this;
                        setTimeout(function () {
                            that.close().remove();
                        }, 1000);
                        resolve();
                        return true;
                    },
                    cancel: function () {
                        reject();
                        return true;
                    },
                    cancelValue: '取消',
                    okValue: '确定'
                });
                d.showModal();
            }));

        },
        setTitle: function (title) {
            document.title = title;
            var $iframe = $('<iframe src="../images/favicon.ico" style="visibility: hidden;"></iframe>');
            $iframe.on('load', function() {
                setTimeout(function() {
                    $iframe.off('load').remove();
                }, 0);
            }).appendTo($('body'));
        },
        emptyFun: function () {

        },
        /*
         * 冒泡排序，默认升序
         * @param list 排序数组
         * @param key 按数组的哪个key排序
         * @param isDesc 是否降序，默认升序,
         * @return {array}  排序好到数组
         */
        bubbleSort: function (list, key, isDesc) {
            for(var i = 0; i < list.length - 1; i++){
                for(var j = i + 1; j < list.length; j++){
                    if(!isDesc){
                        if(list[i][key] > list[j][key]){
                            var temp = list[i];
                            list[i] = list[j];
                            list[j] = temp;
                        }
                    }else{
                        if(list[i][key] < list[j][key]){
                            var temp = list[i];
                            list[i] = list[j];
                            list[j] = temp;
                        }
                    }
                }
            }
            return list;
        },
        getBankCard: function(card){
            if(!card)
                return "";
            if(card.length == 16){
                card = "**** **** **** " + card.substr(12);
            }else if(card.length == 19){
                card = "**** **** **** **** " + card.substr(16);
            }
            return card;
        }
    };
    // 判断是否登录
    if(!/\/redirect\.html/.test(location.href)){
        if(!Base.isLogin()){
            Base.goLogin();
        }
    }

    return Base;
});
