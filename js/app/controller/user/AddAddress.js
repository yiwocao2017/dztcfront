define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function (base, Ajax, dialog) {
    $(function () {
    	var userId = base.getUserId();
    	var token = sessionStorage.getItem("token");
    	var returnUrl = base.getUrlParam("return");
    	var id =  base.getUrlParam("id");
    	var id_l =  base.getUrlParam("id_l");
    	addListener();

    	function addListener(){
    		$("#provinceCode").cityPicker({
    		           title: "选择省市区"
    		       });
	        $("#accept_name").on("change", checkAName);
	        $("#mobile").on("change", checkMobile);
	        $("#provinceCode").on("change", checkPCode);
	        $("#provinceCode").on("click",function(){
	        	 $("#mobile").focus().blur();
	        })
	        // $("#cityCode").on("change", checkCCode);
	        // $("#districtCode").on("change", checkDCode);
	        $("#street").on("change", checkStreet);
	        $("#sbtn").on("click", function(){
	        	if(valide()){
	        		addNewAddr();
	        	}
	        });
    	}
    	function addNewAddr(){
    		$("#loaddingIcon").removeClass("hidden");
    		var addr = $("#provinceCode").val().split(/\s/);
    		var province = addr[0], city = addr[1], area = addr[2],
    			addressee = $("#accept_name").val(),
    			mobile = $("#mobile").val(),
    			detailAddress = $("#street").val(),
    			district = area;

    		var param = {
				"userId": userId,
				"token": token,
			   "addressee": addressee,
                "mobile": mobile,
                "province": province,
                "city": city,
                "district": area,
                "detailAddress": detailAddress,
                "isDefault": "1"
            };
            Ajax.post("805160", {json:param})
                .then(function (response) {
                	$("#loaddingIcon").addClass("hidden");
                    if(response.success){
                        if(id){
                        	location.replace('../biz/book.html?addressee='+addressee+'&mobile='+mobile+'&province='+province+'&city='+city+'&district='+district+'&detailAddress='+detailAddress);
                        }else{
                        	location.replace('../user/address_list.html?id_l='+id_l);
                        }
                        
                    }else{
                        showMsg("量体地址添加失败！")
                    }
                });
    	}
    	function showMsg(cont){
    		var d = dialog({
						content: cont,
						quickClose: true
					});
			d.show();
			setTimeout(function () {
				d.close().remove();
			}, 2000);
    	}

	    function checkAName(){
	    	if($("#accept_name").val() == ""){
	            $("#accept_name").next().fadeIn(300).fadeOut(2000);
	            return false;
	        }else if ($("#accept_name").val().length > 20){
	            $("#accept_name").next().next().fadeIn(300).fadeOut(2000);
	            return false;
	        }
	        return true;
	    }
	    function checkMobile(){
	    	if($("#mobile").val() == ""){
	            $("#mobile").next().fadeIn(300).fadeOut(2000);
	            return false;
	        }else if(!/^1[3,4,5,7,8]\d{9}$/.test($("#mobile").val())){
	            $("#mobile").next().next().fadeIn(300).fadeOut(2000);
	            return false;
	        }
	        return true;
	    }
	    function checkPCode(){
	    	if($("#provinceCode").val() == ""){
	            $("#provinceCode").next().fadeIn(300).fadeOut(2000);
	            return false;
	        }else if ($("#provinceCode").val().length > 20){
	            $("#provinceCode").next().next().fadeIn(300).fadeOut(2000);
	            return false;
	        }
	        return true;
	    }
	    // function checkCCode(){
	    // 	if($("#cityCode").val() == ""){
	    //         $("#cityCode").next().fadeIn(300).fadeOut(2000);
	    //         return false;
	    //     }else if ($("#cityCode").val().length > 20){
	    //         $("#cityCode").next().next().fadeIn(300).fadeOut(2000);
	    //         return false;
	    //     }
	    //     return true;
	    // }
	    // function checkDCode(){
	    // 	if($("#districtCode").val() == ""){
	    //         $("#districtCode").next().fadeIn(300).fadeOut(2000);
	    //         return false;
	    //     }else if ($("#districtCode").val().length > 20){
	    //         $("#districtCode").next().next().fadeIn(300).fadeOut(2000);
	    //         return false;
	    //     }
	    //     return true;
	    // }
	    function checkStreet(){
	    	if($("#street").val() == ""){
	            $("#street").next().fadeIn(300).fadeOut(2000);
	            return false;
	        }else if ($("#street").val().length > 128){
	            $("#street").next().next().fadeIn(300).fadeOut(2000);
	            return false;
	        }
	        return true;
	    }

    	function valide(){
	        if(checkAName() && checkMobile() && checkPCode() 
	        	// && checkCCode() && checkDCode()
	        	 && checkStreet()){
	        	return true;
	        }
	        return false;
	    }
    });
});