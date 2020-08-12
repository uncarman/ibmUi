define(function (require) {
    var app = require('../../js/app');

    app.controller('emergencyPlanCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
        var settings = require('comm').settings;
        var global = require('comm').global;
        var feather = require('feather');
        var echarts = require('echarts');
        var moment = require('moment');

        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func();    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function () {
            global.on_loaded_func($scope, $state, $stateParams);    // 显示页面内容

            $scope.getDatas();
        });
		
		$scope.data = {
			user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),

            pageTitle: settings.pageTitle,
            headLeft: "安全·舒适·节能",
            headRight: moment().format("YYYY-MM-DD dddd"),

            category: $stateParams.category, //资源类别
            type: $stateParams.type, //资源子类
            fireMenu: $stateParams.fireMenu,

            personGroupList: [], // 应急预案组织列表
            curRecource: "",
            recourceList: [],
            _emergencyPlanTimeSpan: null,
            emergencyPlanList: [],
            emergencyPlan: {},
		}

        $scope.getDatas = function() {
            // 组织列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetFirePersonGroup,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    category: $scope.data.category,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.personGroupList = res.data;
                });
            });

            // 资源列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxBuildingResourceList,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    category: $scope.data.category,
                    type: $scope.data.type,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.recourceList = res.data;
                    // 默认选中第一个
                    $scope.changeFloor(res.data[0]);
                });
            });

            $scope.getBuildingFireEmergencyPlan();
        }

        // 当前建筑预案状态
        $scope.getBuildingFireEmergencyPlan = function() {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetFireEmergencyPlanList,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.emergencyPlanList = res.data.map(function(p) {
                        p.timeSpan = moment(p.updatedAt).diff(moment(p.createdAt), "seconds");
                        if(p.status == "开始") {
                            p.updatedAt = "";
                            p.timeSpan = "--"
                        }
                        return p;
                    });
                    $scope.data.emergencyPlan = res.data && res.data.length > 0 ? res.data[0] : {};
                    if($scope.data.emergencyPlan.status == "开始") {
                        $scope.resetTimeSpan($scope.data.emergencyPlan.createdAt);
                    }
                });
            });
        }

        $scope.resetTimeSpan = function(date) {
            var totalSeconds = moment().diff(moment(date, "YYYY-MM-DD HH:mm:ss SSS"), "seconds");
            clearInterval($scope.data._emergencyPlanTimeSpan);
            $scope.data.emergencyPlan.totalSeconds = Math.abs(totalSeconds);
            $scope.data._emergencyPlanTimeSpan = setInterval(function() {
                $scope.$apply(function() {
                    $scope.data.emergencyPlan.totalSeconds += 1;
                });
            }, 1000);
        }

        // 切换楼层
        $scope.changeFloor = function(recource) {
            $scope.data.curRecource = recource;
        }

        // 
        $scope.startPlan = function() {
            // 资源列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxFireEmergencyPlanStart,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.getBuildingFireEmergencyPlan();
            });
        }

        $scope.endPlan = function() {
            // 资源列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxFireEmergencyPlanEnd,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.getBuildingFireEmergencyPlan();
            });
        }

        $scope.showEmergencyPlanHistory = function() {
            $(".history").addClass("show");
            $(".history").modal("show");
        }

    }]);

});
