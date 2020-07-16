define(function (require) {
    var app = require('../../js/app');

    app.controller('settingsItemCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
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

            tableData: {},  // 显示table的分类数据
            cacheData: {},  // 原始分类数据

            // 当前编辑的item
            curMethod: "view",
            curItem: {},
            curItemCache: {},

            ruleTemp: {
                warning_category: "规则分类: 文字描述",
                compare: "比较方式: >/>=/==/<=/<",
                key: "对应采集的关键字: 电压/电流/功率",
                val: "比较的数值: 整数或小数",
                err_msg: "规则信息提示: 文字描述",
                severity: "严重程度: 严重/一般",
                description: "规则描述: 文字描述",
                solution_ref: "处理方式: 文字描述",
            },
        };

        $scope.ajaxGetItems = function() {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetBuildingItems,
                _param: {
                    buildingId: $scope.data.curBuilding.id
                }
            };
            return global.return_promise($scope, param);
        }

        $scope.getDatas = function(){
            $scope.ajaxGetItems()
                .then($scope.buildItemTable)
                .catch($scope.ajaxCatch);
        };

        $scope.buildItemTable = function(res) {
            var tableData = {
                "title": ["id", "采集器ID", "类型ID", "编码", "设备名称", "描述", "数据类型", "数据单位", "变比系数", "最大数值"],
                "data": [],
            };
            var cacheData = {};
            res.data.map(function (cur) {
                tableData.data.push([cur.id, cur.collectorId, cur.itemType, cur.code, cur.name, cur.description, cur.dataType, cur.dataUnit, cur.coefficient, cur.maxValue]);
                cacheData[cur.id] = cur;
            });
            $scope.$apply(function () {
                $scope.data.tableData = tableData;
                $scope.data.cacheData = cacheData;
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

        $scope.removeItem = function (ig, ind) {
            if(confirm("确定删除?")) {
                var param = {
                    _method: 'post',
                    _url: settings.ajax_func.ajaxRemoveItem,
                    _param: {
                        id: ig[0]
                    }
                };
                global.ajax_data($scope, param, function (res) {
                    $scope.getDatas();
                });
            };
        }

        $scope.updateItem = function () {
            var curItem = $scope.data.curItem;
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxUpdateItem,
                _param: {
                    id: curItem.id,
                    collectorId: curItem.collectorId,
                    itemType: curItem.itemType,
                    code: curItem.code,
                    name: curItem.name,
                    description: curItem.description,
                    dataType: curItem.dataType,
                    dataUnit: curItem.dataUnit,
                    coefficient: curItem.coefficient,
                    maxValue: curItem.maxValue,
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
                _url: settings.ajax_func.ajaxCreateItem,
                _param: {
                    collectorId: curItem.collector_id,
                    itemType: curItem.item_type,
                    code: curItem.code,
                    name: curItem.name,
                    description: curItem.description,
                    dataType: curItem.data_type,
                    dataUnit: curItem.data_unit,
                    coefficient: curItem.coefficient,
                    maxValue: curItem.max_value,
                }
            };
            global.ajax_data($scope, param, function (res) {
                // 刷新页面
                $scope.getDatas();
                $(".itemEdit").removeClass("show");
                $(".itemEdit").modal("hide");
            });
        }

        $scope.editItemRules = function (ig) {
            $scope.data.curMethod = "edit";
            $scope.data.curMethodReadOnly = true;
            $scope.data.curItem = angular.copy($scope.data.cacheData[ig[0]]);
            $scope.data.curItemCache = angular.copy($scope.data.cacheData[ig[0]]);
            $(".itemRules").modal("show");
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetItemRule,
                _param: {
                    id: $scope.data.curItemCache.id
                }
            };
            global.ajax_data($scope, param, function(res) {
                $scope.$apply(function() {
                    var rules = JSON.parse(res.data.rules);
                    if(!rules) {
                        rules = [];
                    }
                    $scope.data.curItem.rules = rules;
                    $scope.data.curItemCache.rules = rules;
                });
            }, [], global.ajaxCatch);
        };

        $scope.addItemRule = function() {
            $scope.data.curItem.rules.push(deepCopy($scope.data.ruleTemp));
        }

        $scope.removeItemRule = function(ind) {
            $scope.data.curItem.rules.splice(ind, 1);
        }

        $scope.updateItemRule = function() {
            var rules = !$scope.data.curItem.rules ? [] : $scope.data.curItem.rules;
            var itemId = $scope.data.curItem.id;
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxUpdateItemRule,
                _param: {
                    itemId: itemId,
                    rules: JSON.stringify(rules),
                }
            };
            global.ajax_data($scope, param, function(res) {
                $scope.$apply(function() {
                    // 刷新页面
                    $scope.getDatas();
                    $(".itemRules").removeClass("show");
                    $(".itemRules").modal("hide");
                });
            }, [], global.ajaxCatch);
        }

    }]);

});