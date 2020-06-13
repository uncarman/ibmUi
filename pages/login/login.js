define(function (require) {
    var app = require('../../js/app');
    var jQuery = require('jquery');

    app.controller('loginCtrl', ['$scope', function($scope) {
        $scope.data = {
        	title: "title"
        }
        setTimeout(function(){
        	$scope.$apply(function(){
        		$scope.data.userinfo = {
	        		name: "sam",
	        		mobile: "1584444444"
	        	}
        	});
        	session.userinfo = $scope.data.userinfo;
        });

        $scope.send_sms = function () {
        	var param = {
                _method: 'post',
                _url: settings.ajax_base_url,
                _param: {
                    act: settings.ajax_func.send_sms, //功能号
                    mobile: $scope.data.mobile,
                    sms_type: "login"
                }
            };
            global.ajax_data($scope, param,
                function (data) {
                    console.log(data);
                    if(data.code == -1) // 验证码已经发送成功并且还没失效
                    {
                        has_get_vcode = true;
                        countdown(); //倒计时
                        $scope.$apply(function(){
                            $scope.data.login_error = "";
                            $scope.data.login_info = "亲，您的验证码已经发送成功，失效时间是15分钟，请耐心等待。";
                        });
                        return;
                    }
                    else if(data.code == -4)    // 超过次数
                    {
                        $scope.$apply(function(){
                            $scope.data.login_error = data.message;
                            $scope.data.login_info = "";
                        });
                        return;
                    }
                    else if(data.code == -2 || data.code == -3) // 发送验证码失败
                    {
                        $scope.$apply(function(){
                            $scope.data.login_error = data.message;
                            $scope.data.login_info = "";
                        });
                        return;
                    }
                    else
                    {
                        if(configs.fake_sms)
                        {
                            alert("验证码是: " + data.result.sms_code);
                        }
                        has_get_vcode = true;
                        countdown(); //倒计时
                        return;
                    }
                }, [-1,-2,-3,-4],
                function (){
                    $scope.$apply(function(){
                        $scope.smsCanClick = true; //按钮可点击
                    });
                });
        };
    }]);
});
