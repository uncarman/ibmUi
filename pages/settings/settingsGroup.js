define(function (require) {
    var app = require('../../js/app');

    app.controller('settingsGroupCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
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

            // 初始化数据
            $scope.getDatas();
            $scope.getItems();
        });

        $scope.data = {
            user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),

            // pageTitle: settings.pageTitle,
            // headLeft: "安全·舒适·节能",
            headRight: moment().format("YYYY-MM-DD dddd"),

            // 左侧菜单
            settingsRouteInd: $stateParams.routeId,
            settingsRoutes: settings.settingsRoutes,
            
            type: $stateParams.type,

            levelLength: 2,  // group code level 长度

            itemList: [],   // 所有设备列表
            tableData: {},  // 显示table的分类数据
            cacheData: {},  // 原始分类数据

            filterKey: "",

            // 当前编辑的item
            curMethod: "view",
            curItem: {},
            curItemCache: {},
        };

        $scope.getDatas = function(){
            $scope.ajaxGetItemGroups()
                .then($scope.buildItemGroupTable)
                .catch($scope.ajaxCatch);
        };

        $scope.ajaxGetItemGroups = function () {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetItemGroups,
                _param: {
                    buildingId: $scope.data.curBuilding.id
                }
            };
            return global.return_promise($scope, param);
        };

        $scope.buildItemGroupTable = function (res) {
            var tableData = {
                "title": ["id", "编号", "名称", "类型", "面积", "设备数量", "备注"],
                "data": [],
            };
            var cacheData = {};
            res.data.map(function (cur) {
                var displayName = cur.name;
                var level = cur.code.length / $scope.data.levelLength;
                for(var i=1; i<level; i++) {
                    displayName = (cur.code.substring($scope.data.levelLength*i, (i+1)*$scope.data.levelLength) != 0 ? "|------" : "" ) + displayName;
                }
                tableData.data.push([cur.id, cur.code, displayName, cur.type, cur.area, cur.itemNum, cur.note]);
                cacheData[cur.id] = cur;
            });
            $scope.$apply(function () {
                $scope.data.tableData = tableData;
                $scope.data.cacheData = cacheData;
            });
        }

        $scope.getItems = function() {
            // 缓存系统中所有设备类型
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetBuildingItems,
                _param: {
                    buildingId: $scope.data.curBuilding.id
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.itemList = res.data;
                });
            });
        }

        $scope.viewItem = function (ig) {
            $scope.data.curMethod = "view";
            $scope.data.curMethodReadOnly = true;
            $scope.data.curItem = angular.copy($scope.data.cacheData[ig[0]]);
            $scope.data.curItemCache = angular.copy($scope.data.cacheData[ig[0]]);
            $(".itemEdit").addClass("show");
            $(".itemEdit").modal("show");
        };

        $scope.editItem = function (ig) {
            $scope.data.curMethod = "edit";
            $scope.data.curMethodReadOnly = false;
            $scope.data.curItem = angular.copy($scope.data.cacheData[ig[0]]);
            $scope.data.curItemCache = angular.copy($scope.data.cacheData[ig[0]]);
            $(".itemEdit").addClass("show");
            $(".itemEdit").modal("show");
        };

        $scope.createItem = function() {
            $scope.data.curMethod = "create";
            $scope.data.curMethodReadOnly = false;
            $scope.data.curItem = {};
            $scope.data.curItemCache = {};
            $(".itemEdit").addClass("show");
            $(".itemEdit").modal("show");
        }

        $scope.bindItem = function(ig) {
            $scope.data.curItem = angular.copy($scope.data.cacheData[ig[0]]);
            $scope.data.curItemCache = angular.copy($scope.data.cacheData[ig[0]]);
            $(".itemMapper").addClass("show");
            $(".itemMapper").modal("show");
            $scope.getItemsByGroupId($scope.data.cacheData[ig[0]]);
        }

        $scope.removeItem = function (ig, ind) {
            if(confirm("确定删除?")) {
                var param = {
                    _method: 'post',
                    _url: settings.ajax_func.ajaxRemoveItemGroup,
                    _param: {
                        id: ig[0]
                    }
                };
                global.ajax_data($scope, param, function (res) {
                    $scope.$apply(function(){
                        $scope.data.tableData.data.splice(ind, 1);
                    });
                });
            };
        }

        $scope.updateItem = function () {
            var curItem = $scope.data.curItem;
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxUpdateItemGroup,
                _param: {
                    id: curItem.id,
                    code: curItem.code,
                    buildingId: $scope.data.curBuilding.id,
                    type: curItem.type,
                    name: curItem.name,
                    parent: curItem.parent,
                    area: curItem.area,
                    note: curItem.note,
                }
            };
            global.ajax_data($scope, param, function (res) {
                // 刷新页面
                $scope.getDatas();
                $(".itemEdit").removeClass("show");
                $(".itemEdit").modal("hide");
            });
        }

        $scope.saveItem = function() {
            var curItem = $scope.data.curItem;
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxCreateItemGroup,
                _param: {
                    code: curItem.code,
                    name: curItem.name,
                    buildingId: $scope.data.curBuilding.id,
                    type: curItem.type,
                    parent: curItem.parent,
                    area: curItem.area,
                    note: curItem.note,
                }
            };
            global.ajax_data($scope, param, function (res) {
                // 刷新页面
                $scope.getDatas();
                $(".itemEdit").removeClass("show");
                $(".itemEdit").modal("hide");
            });
        }

        $scope.getItemsByGroupId = function(group) {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetItemsByGroupId,
                _param: {
                    groupId: group.id
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    var list = [];
                    if(res.data) {
                        res.data.map(function(i){
                            list.push(i.id);
                        });
                    }
                    $scope.data.itemList.map(function(i){
                        if(list.indexOf(i.id) >= 0) {
                            i.checked = true;
                        } else {
                            i.checked = false;
                        }
                    });
                });
            });
        }

        $scope.updateGroupItem = function() {
            var list = [];
            $scope.data.itemList.map(function(i){
                if(i.checked) {
                    list.push(i.id);
                }
            });
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxUpdateGroupItem,
                _param: {
                    groupId: $scope.data.curItemCache.id,
                    itemIds: list.join(",")
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.getDatas();
                $(".itemMapper").removeClass("show");
                $(".itemMapper").modal("hide");
            });
        }

    }]);

});