define([
    'js/app/controller/base',
    'js/app/util/ajax',
    'js/app/module/loading/loading',
    'js/app/module/validate/validate',
    'Handlebars'
], function(base, Ajax, loading, Validate,Handlebars) {
    var arg = {
        addressee:base.getUrlParam("addressee"),
        mobile:base.getUrlParam("mobile"),
        province:base.getUrlParam("province"),
        city:base.getUrlParam("city"),
        district:base.getUrlParam("district"),
        detailAddress:base.getUrlParam("detailAddress")
    };
    var code = base.getUrlParam("code");
    var userId = base.getUserId();
    var token = sessionStorage.getItem("token");
    var addressTmpl = __inline("../../ui/submit-order-address.handlebars");
    var id ="";
    var id_l = base.getUrlParam("id");
    var param = {
            "userId": userId,
            "token":token,
            "isDefault": ""
        };
    init(); 
    function init() {
        loading.createLoading();
        getCont();
        addListeners();
        getAdressList()
    }

    function getAdressList(){
        Ajax.post("805165", {json:param})
            .then(function(response){
                if(response.success){
                    var data = response.data
                    // console.log(arg.addressee)
                    if(data.length){
                        if(arg.addressee == undefined || arg.addressee == ""){
                            var content = addressTmpl(data[0]);
                            $("#ltAddressCont").append(content);
                            return;
                        }else{
                            var content = addressTmpl(arg);
                            $("#ltAddressCont").append(content);
                            return
                        }
                        // for (var i = 0 ; i < data.length; i++) {
                        //     if (data[i].isDefault == "1") {
                                // html += '<div  id= "ltAddress0" class="wp100 in-ba plr20 mt20 fs28" ltProvince='+data[i].province+' ltCity="'+data[i].city + '" ltArea="' + data[i].district + '" ltAddress="'+data[i].detailAddress +'">'+ data[i].province+data[i].city+data[i].district+data[i].detailAddress+'</div>'
                                // $("#ltAddressCont").html(html);
                                
                        //     }
                        // }
                        // $.each(data, function(i, item){
                        //      html += '<option value="'+item.detailAddress+'">'+item.province+item.city+item.district+item.detailAddress+'</option>';
                        // });
                    }else{
                        var html = "";
                        html += '<div   class="wp100 in-ba plr20 mt20 fs28">还没有量体地址，去<a  class="fs28 red">添加</a></div>'
                        $("#ltAddressCont").append(html);
                    }
                }else{
                    base.showMsg(response.msg);
                }
            });
    }

    function getCont(){
        Ajax.get("807717", {
            ckey: "yuyuePic"
        }).then(function(res){
            id = res.data.id;
            loading.hideLoading();
            if(res.success){
                $("#content").html('<img src="'+base.getImg1(res.data.note)+'"/>');
                if(id_l){
                    // (function(){$('html,body').animate({scrollTop:document.body.clientHeight+'px'}, 800);}());
                    isVisibile()
                }
            }else{
                base.showMsg(res.msg);
            }
        }, loading.hideLoading);
    }

    function addListeners() {
        var bookForm = $("#bookForm");
        // $("#address").cityPicker({
        //     title: "选择省市县"
        // });
        $("#ltDatetime").calendar();
        $("#ltDatetime").on("click", function(){
            $("#ltDatetime").focus().blur();
        });
        $("#ltAddressCont").on("click","a",function(){
            if(this.id == "ltCustAddr"){
                location.href = "/user/address_list.html?id="+id;
            }else{
                location.href = "/user/add_address.html?id="+id;
            }
        });
        // $("#ltAddress0").on("click", function(){
        //     $("#ltAddress0").focus().blur();
        //     getAdressList()
        // });
        // $("#ltAddress").on("change", function(){
        //     // $("#ltAddress0").html($("#ltAddress option:selected").html());
        // });
        bookForm.validate({
            'rules': {
                applyName: {
                    required: true,
                    isNotFace: true
                },
                applyMobile: {
                    required: true,
                    mobile: true
                },
                address: {
                    required: true,
                    isNotFace: true,
                },
                ltProvince: {
                    required: true,
                    isNotFace: true,
                },
                ltAddress: {
                    required: true,
                    isNotFace: true,
                    maxlength: 255
                },
                ltDatetime: {
                    required: true
                },
                applyNote: {
                    isNotFace: true,
                    maxlength: 255
                }
            },
            onkeyup: false
        });

        $("#sbtn").on("click", function(){
            if(isVisibile()){
                var ltProvince = $("#ltCustAddr").attr("ltProvince");
                if(ltProvince == undefined){
                    html="";
                    html='<label id="ltDatetime-error" class="error" for="ltDatetime" style="display: block;">不能为空</label>'
                    $("#nameWrap").append(html);
                }else if(bookForm.valid()){
                    var param = bookForm.serializeObject();
                    // var addr = param.address.split(/\s/);
                    // var province = addr[0], city = addr[1], area = addr[2];
                    // if( province + "市" == city ){
                    //     province = city;
                    // }
                    param.ltProvince = $("#ltCustAddr").attr("ltProvince");
                    param.ltCity = $("#ltCustAddr").attr("ltCity");
                    param.ltArea = $("#ltCustAddr").attr("ltArea");
                    param.ltAddress = $("#ltCustAddr").attr("ltAddress");
                    param.applyName = $("#ltCustAddr").attr("applyName");
                    param.applyMobile = $("#ltCustAddr").attr("applyMobile");
                    param.applyUser = param.updater = base.getUserId();
                    book(param);
                }
            }else{
                $("#nameWrap")[0].scrollIntoView();
            }
        });
    }
    function isVisibile(){
        var $win = $(window), $wrap = $("#nameWrap");
        if($win.height() + $win.scrollTop() - $wrap.offset().top - $wrap.innerHeight() <= 0){
            return false;
        }
        return true;
    }

    function book(param){
        Ajax.post("620200", {json: param})
            .then(function(res){
                if(res.success){
                    base.showMsg("预约成功");
                    setTimeout(function(){
                        location.href = "/";
                    }, 1000);
                }else{
                    base.showMsg(msg);
                }
            }, function(){
                base.showMsg("预约失败");
            });
    }

})
