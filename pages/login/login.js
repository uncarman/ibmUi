define(function (require) {
    var app = require('../../js/app');

    app.directive('dateKeys', function () {
        return {
            restrict: 'A',
                link: function (scope, element, attrs, controller) {
                    element.on('keydown', function (event) {
                        if (event.keyCode == 13) {
                            scope.doLogin();
                        } else {
                            return true;
                        }
                    });
                }
            }
    }).controller('loginCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
        var particles = require('particles');
        var particleOpt = require('../../js/login-particles-opt');

        var settings = require('comm').settings;
        var global = require('comm').global;
        var feather = require('feather');
        var echarts = require('echarts');
        var moment = require('moment');

        $scope.is_debug = settings.is_debug;
        global.on_load_func();    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function () {
            global.on_loaded_func($scope, $state, $stateParams);    // 显示页面内容
            particlesJS('particles', particleOpt.opt);
        });

        $scope.data = {
            pageTitle: settings.pageTitle,

            data: {
                user: {},
                username: "",
                password: "",
            }
        }

        $scope.doLogin = function () {
            if($scope.data.username == "") {
                alert("请填写用户名.");
                return false;
            }
            if($scope.data.password == "") {
                alert("请填写密码.");
                return false;
            }
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxLogin,
                _param: {
                    userName: $scope.data.username,
                    password: $scope.data.password,
                }
            };
            global.ajax_data($scope, param, function (res) {
                var user = res.data;
                user.photo_url = user.photo_url ? user.photo_url : settings.default_photo;
                global.set_storage_key('session', [
                    {
                        key: 'user',
                        val: user,
                    }
                ]);
                $scope.data.user = user;
                $scope.getBuildingList();
            }, [], function (res) {
                if(res.message) {
                    alert(res.message);
                }
            });
        }

        $scope.getBuildingList = function() {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetUserBuildings,
                _param: {
                    userId: $scope.data.user.id
                }
            };
            global.ajax_data($scope, param, function (res) {
                // 缓存用户建筑列表
                global.set_storage_key('session', [
                    {
                        key: 'buildingList',
                        val: res.data,
                    },
                    {
                        key: 'building',
                        val: res.data[0],
                    }
                ]);
                $scope.goto("home");
            }, [], function (res) {
                if(res.message) {
                    alert(res.message);
                }
            });
        }
    }]);
});
