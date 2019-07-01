define([
    'Handlebars'
], function(Handlebars) {
    Handlebars.registerHelper('formatMoney', function(num, options){
        if(!num && num !== 0)
            return "--";
        num = +num / 1000;
        num = (num+"").replace(/^(\d+\.\d\d)\d*/i, "$1");
        return (+num).toFixed(2);
    });
    Handlebars.registerHelper('formatZeroMoney', function(num, places, options){
        // if (typeof num == 'undefined' || typeof num != 'number') {
        //     return "--";
        // }
        // num = +(num || 0) / 1000;
        // num = (num+"").replace(/^(\d+)(\.\d*)?/i, "$1");
        // return (+num).toFixed(0);
        if(!num && num !== 0)
            return "--";
        num = +num / 1000;
        num = (num+"").replace(/^(\d+\.\d\d)\d*/i, "$1");
        return (+num).toFixed(2);
    });

    Handlebars.registerHelper('compare', function(v1, v2, res1, res2, res3, options){
        if (v1 > v2) {
            return res1;
        } else if (v1 = v2) {
            return res2;
        } else {
            return res3;
        }
    });

    Handlebars.registerHelper('safeString', function(text, options){
        return new Handlebars.SafeString(text);
    });
    Handlebars.registerHelper('formatImage', function(pic, isAvatar, options){
        if(!pic)
            return "";
        pic = pic.split(/\|\|/)[0];
        if(/^http/.test(pic)){
            return pic;
        }
        return PIC_PREFIX + pic + THUMBNAIL_SUFFIX;
    });
    Handlebars.registerHelper('formateDateTime', function(date, options){
        if(!date)
            return "--";
        date = date.replace(/(12:\d\d:\d\d\s)AM$/, "$1PM");
        return new Date(date).format("yyyy-MM-dd hh:mm:ss");
    });
    Handlebars.registerHelper('formateDateTime1', function(date, options){
        if(!date)
            return "--";
        date = date.replace(/(12:\d\d:\d\d\s)AM$/, "$1PM");
        return new Date(date).format("yyyy-MM-dd hh:mm");
    });
    Handlebars.registerHelper('formateDate', function(date, options){
        if(!date)
            return "--";
        date = date.replace(/(12:\d\d:\d\d\s)AM$/, "$1PM");
        return new Date(date).format("yyyy-MM-dd");
    });
    Handlebars.registerHelper('formatePointDate', function(date, options){
        if(!date)
            return "--";
        date = date.replace(/(12:\d\d:\d\d\s)AM$/, "$1PM");
        return new Date(date).format("yyyy.MM.dd");
    });
    Handlebars.registerHelper('formateTime', function(date, options){
        if(!date)
            return "--";
        date = date.replace(/(12:\d\d:\d\d\s)AM$/, "$1PM");
        return new Date(date).format("hh:mm");
    });
    Handlebars.registerHelper('clearTag', function(des, options){
        return des && des.replace(/(\<[^\>]+\>)|(\<\/[^\>]+\>)|(\<[^\/\>]+\/\>)/ig, "") || "";
    });

    return Handlebars;
});
