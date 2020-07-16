define(function (require) {
    var app = require('../../js/app');

    app.controller('emptyCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
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
            //$scope.getBuildingRecource();

            $scope.initMap();
        });
        
        $scope.data = {
            user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),

            category: "消防安全",

            result: {
                itemList: [],
            }
        };

        $scope.gotoPage = function(page, id) {
            $scope.goto(page, {"id": id});
        };

        // 获取图表数据
        $scope.getBuildingRecource = function () {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetBuildingResourceList,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    category: "消防安全",
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.itemList = res.data;
                });
            });
        };


        $scope.initMap = function() {
            map = new AMap.Map("map", {
                center: [121.49972, 31.23969], //东方明珠
                viewMode: '3D',
                pitch: 60,
                rotation: -35,
                features: ['bg', 'road', 'point'], //隐藏默认楼块
                layers: [new AMap.Buildings({
                    zooms: [16, 18],
                    zIndex: 10,
                    heightFactor: 3 //2倍于默认高度，3D下有效
                }) //楼块图层
                ],
                zoom: 20,
                zoomEnable: false,
                dragEnable: false,
                mapStyle: "amap://styles/fa976a97e299c0866958baf4cf5d4d33",
            });
            map.on("complete", function(e) {
                $("#map").css("background-color", "transparent");
            });
        }

    }]);

});
