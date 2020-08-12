define(function (require) {
    var app = require('../../js/app');

    app.controller('fireFighterDeviceCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
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
            itemType: "22", // 设备类别, 22 =消防相关
            map: null, //地图

            recourceList: [],  // 资源列表
            itemList: [], // 设备列表
            recourceItemList: [], // 某个资源相关的设备
            itemListTypes: {},  // 设备分类列表
            curItemListType: "", // 选中分类
        }


        $scope.getDatas = function() {
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

            // 设备列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetItemListByTypes,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    typeIds: $scope.data.itemType,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.itemList = res.data;
                    // 生成设备分类列表
                    res.data.map(function(it) {
                        if(typeof $scope.data.itemListTypes[it.itemTypeId] == "undefined") {
                            $scope.data.itemListTypes[it.itemTypeId] = {
                                id: it.itemTypeId,
                                code: it.itemTypeCode,
                                name: it.itemTypeName,
                                calculate: it.itemTypeCalculate,
                                parent: it.itemTypeParent,
                                count: 1,
                            }
                        } else {
                            $scope.data.itemListTypes[it.itemTypeId].count += 1;
                        }
                    });
                });
            });
        };

        // 切换楼层
        $scope.changeFloor = function(recource) {
            $scope.data.curRecource = recource;
            $scope.getFloorItems();
        }
        $scope.getFloorItems = function() {
            // 设备列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetItemListByResourceIds,
                _param: {
                    resourceIds: $scope.data.curRecource.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.recourceItemList = res.data.map(function(it) {
                        it.style = {"margin-left": it.xAxis+"px", "margin-top": it.yAxis+"px" };
                        return it;
                    });
                });
            });
        }

        // 切换设备类别
        $scope.changeItemType = function(typeId) {
            $scope.data.curItemListType = typeId;
        }


        $scope.displayItem = function(item) {
            $scope.data.curItem = item;
            $scope.data.curItemDetail = global.fmtDeviceDetail(item);
            $(".itemDetail").addClass("show");
            $(".itemDetail").modal("show");
        }

    }]);

});
