define(function (require) {
    var app = require('../../js/app');

    app.controller('settingsBaseCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
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

            tableData: {},  // 显示table的分类数据
            cacheData: {},  // 原始分类数据

            // 当前编辑的item
            curMethod: "view",
            curItem: {},
            curItemCache: {},
        };

        $scope.ajaxGetBaseDatas = function() {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetBasicDatas,
                _param: {}
            };
            return global.return_promise($scope, param);
        }

        $scope.getDatas = function(){
            $scope.ajaxGetBaseDatas()
                .then($scope.buildBaseDatasTable)
                .catch($scope.ajaxCatch);
        };

        $scope.buildBaseDatasTable = function(res) {
            var tableData = {
                "title": ["id", "类型ID", "类型名称", "数据编码", "数据名称", "备注"],
                "data": [],
            };
            var cacheData = {};
            res.data.map(function (cur) {
                tableData.data.push([cur.id, cur.type, cur.name, cur.basicCode, cur.basicName, cur.note]);
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
            $(".itemEdit").modal("show");
        };

        $scope.editItem = function (ig) {
            $scope.data.curMethod = "edit";
            $scope.data.curMethodReadOnly = false;
            $scope.data.curItem = angular.copy($scope.data.cacheData[ig[0]]);
            $scope.data.curItemCache = angular.copy($scope.data.cacheData[ig[0]]);
            $(".itemEdit").modal("show");
        };

        $scope.createItem = function() {
            $scope.data.curMethod = "create";
            $scope.data.curMethodReadOnly = false;
            $scope.data.curItem = {};
            $scope.data.curItemCache = {};
            $(".itemEdit").modal("show");
        }

        $scope.removeItem = function (ig, ind) {
            if(confirm("确定删除?")) {
                var param = {
                    _method: 'post',
                    _url: settings.ajax_func.ajaxRemoveBasicData,
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
                _url: settings.ajax_func.ajaxUpdateBasicData,
                _param: {
                    id: curItem.id,
                    type: curItem.type,
                    name: curItem.name,
                    basicCode: curItem.basicCode,
                    basicName: curItem.basicName,
                    note: curItem.note,
                }
            };
            global.ajax_data($scope, param, function (res) {
                // 刷新页面
                $scope.getDatas();
                $(".itemEdit").modal("hide");
            });
        }

        $scope.saveItem = function() {
            var curItem = $scope.data.curItem;
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxCreateBasicData,
                _param: {
                    type: curItem.type,
                    name: curItem.name,
                    basicCode: curItem.basicCode,
                    basicName: curItem.basicName,
                    note: curItem.note,
                }
            };
            global.ajax_data($scope, param, function (res) {
                // 刷新页面
                $scope.getDatas();
                $(".itemEdit").modal("hide");
            });
        }

    }]);

});