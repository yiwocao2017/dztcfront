define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading'
], function(base, Ajax, loading) {

    init();

    function init() {
        loading.createLoading();
        getCont();
        addListener();
    }
    function getCont(){
        Ajax.get("807717", {
            ckey: "fugouPic"
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                $("#content").html('<img src="'+base.getImg1(res.data.note)+'"/>');
            }else{
                base.showMsg(res.msg);
            }
        }, loading.hideLoading);
    }

    function addListener(){
        $("#sbtn").on("click", function(){
            Ajax.post("620201", {
                json: {
                    applyUser: base.getUserId()
                }
            }).then(function(res){
                if(res.success){
                    base.showMsg("申请提交成功");
                    setTimeout(function(){
                        location.href = "/";
                    }, 1000);
                }else{
                    base.showMsg(res.msg);
                }
            }, function(){
                base.showMsg("一键复购失败");
            });
        });
    }
});
