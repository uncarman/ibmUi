define(function (require) {
    var app = require('../../js/app');

    app.controller('settingsBuildingResourceCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
        var settings = require('comm').settings;
        var global = require('comm').global;
        var feather = require('feather');
        var echarts = require('echarts');
        var moment = require('moment');

        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func();    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function() {
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

            // 左侧菜单
            settingsRouteInd: $stateParams.routeId,
            settingsRoutes: settings.settingsRoutes,

            category: "智慧消防", //$stateParams.category, //资源类别
            type: "消防设备", //$stateParams.type, //资源子类
            map: null, //地图

            recourceList: [],  // 资源列表
            itemList: [], // 设备列表
            recourceItemList: [], // 某个资源相关的设备
            itemListTypes: {}, // 设备分类列表
            curItemListType: "", // 选中分类
            curItem: {}, // 选中的设备

            // 拖拽元素全局变量
            tmpPos: {
                "dom": null,
                "margin-top": 0,
                "margin-left": 0,
                "mouse-top": 0,
                "mouse-left": 0,
            },
        };

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
                _url: settings.ajax_func.ajaxGetBuildingItems,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
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
        $scope.displayItem = function(item) {
            $scope.data.curItem = item;
        }
        $scope.removeItem = function() {
            // 设备删除
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxRemoveResourceItem,
                _param: {
                    id: $scope.data.curItem.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.getFloorItems();
            });
        }
        // 切换设备类别
        $scope.changeItemType = function(typeId) {
            $scope.data.curItemListType = typeId;
        }
        // 添加,更新元素到地图中
        $scope.addItemToRecource = function(item) {
            // 设备添加
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxCreateResourceItem,
                _param: {
                    resourceId: $scope.data.curRecource.id,
                    itemId: item.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.getFloorItems();
            });
        }
        // 添加,更新元素到地图中
        $scope.removeItemToRecource = function(item) {
            // 设备列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxRemoveResourceItem,
                _param: {
                    resourceId: $scope.data.curRecource.id,
                    itemId: item.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.getFloorItems();
                $scope.$apply(function() {
                    $scope.data.curItem = {};
                });
            });
        }
        $scope.updateItemToRecource = function(item) {
            // 设备列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxUpdateResourceItem,
                _param: {
                    ...item
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.getFloorItems();
            });
        }

        // 地图中元素移动
        $scope.dragChangeStatus = function(item, ev) {
            if($scope.data.tmpPos.dom) {
                item.yAxis = parseInt($scope.data.tmpPos.dom.css("margin-top"));
                item.xAxis = parseInt($scope.data.tmpPos.dom.css("margin-left"));
                $scope.data.tmpPos.dom = null;
                $scope.updateItemToRecource(item);
            } else {
                var $dom = $(ev.target).closest(".dynamicPlot");
                $scope.data.tmpPos = {
                    "dom": $dom,
                    "margin-top": parseInt($dom.css("margin-top")),
                    "margin-left": parseInt($dom.css("margin-left")),
                    "mouse-top": ev.pageY,
                    "mouse-left": ev.pageX,
                }
            }
        }
        $scope.dragMove = function(item, ev) {
            if($scope.data.tmpPos.dom) {
                var newTop = ev.pageY;
                var newLeft = ev.pageX;
                var newDomTop = $scope.data.tmpPos["margin-top"] + (newTop - $scope.data.tmpPos["mouse-top"]);
                var newDomLeft = $scope.data.tmpPos["margin-left"] + (newLeft - $scope.data.tmpPos["mouse-left"]);
                $scope.data.tmpPos.dom.css("margin-top", newDomTop + "px");
                $scope.data.tmpPos.dom.css("margin-left", newDomLeft + "px");
            }
        }

    }]);

});

/*
{
    "离线": "offline",
    "运行": "on",
    "停机": "off",
    "预警": "warning",
    "故障": "error",
    "未知": "unknow",
}

{
    "key": "" 
}
*/
