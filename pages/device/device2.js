define(function (require) {
    var app = require('../../js/app');
    var feather = require('feather');
    var moment = require('moment');

    app.controller('device2Ctrl', function($scope) {
        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func();    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function () {
            global.on_loaded_func($scope);    // 显示页面内容
        });

        refreshInterval = 5*60*1000; // N 分钟刷新所有电站数据

        $scope.$watch('$viewContentLoaded', function() {
            //feather.replace();
            global.on_loaded_func($scope);    // 显示页面内容

            // 页面初始化,如果无子类展示,直接选中第一个楼层
            $scope.data.floor = (!$scope.data.subType && $scope.data.type.childs.length<=0) ? $scope.data.floors[Object.keys($scope.data.floors)[0]] : "";

            // 弹框绑定关闭事件
            $($scope.data.videoModalId).on("click", function(){
                $scope.data.cameraSelected = null;
                $($scope.data.videoModalId).hide();
            });
        });

        // 最后执行
        setTimeout(function(){
            $scope.getDatas();
        }, 0);

        var types = {
            "101": {
                id: 101,
                name: "消防水压",
                icon: "fa fa-bullseye",
                childs: [],
            },
            "102": {
                id: 102,
                name: "消防栓(室内)",
                icon: "fa fa-thermometer-full",
                childs: [],
            },
            "103": {
                id: 103,
                name: "消防栓(室外)",
                icon: "fa fa-adjust",
                childs: [],
            },
            "2": {
                id: 2,
                name: "灭火器",
                icon: "fa-paper-plane",
                childs: [],
            },
        };
        var devices = [
            // 消防水压
            {
                id: 1,
                type: 101,
                floor: 2,
                name: "顶楼楼东",
                iconClass: "icons icon-pump",
                // icon: "images/icon-wind-on.png",
                style: {"margin-left": "120px", "margin-top": "320px" }
            },
            {
                id: 3,
                type: 101,
                floor: 2,
                name: "二楼楼中",
                iconClass: "icons icon-pump",
                // video: "video.html",
                style: {"margin-left": "320px", "margin-top": "480px" }
            },
            // 消防栓
            {
                id: 3,
                type: 102,
                floor: 2,
                name: "二楼楼中",
                iconClass: "icons icon-vidio",
                // video: "video.html",
                style: {"margin-left": "250px", "margin-top": "190px" }
            },
            {
                id: 2,
                type: 102,
                floor: 2,
                name: "顶楼楼东",
                iconClass: "icons icon-vidio",
                // video: "video.html",
                style: {"margin-left": "430px", "margin-top": "320px" }
            },
            {
                id: 3,
                type: 102,
                floor: 2,
                name: "二楼楼中",
                iconClass: "icons icon-vidio",
                // video: "video.html",
                style: {"margin-left": "620px", "margin-top": "320px" }
            },
            // 消防栓
            {
                id: 1,
                type: 103,
                floor: 2,
                name: "顶楼楼东",
                iconClass: "icons icon-vidio",
                // icon: "images/icon-wind-on.png",
                style: {"margin-left": "150px", "margin-top": "400px" }
            },
            // 智能照明
            {
                id: 1,
                type: 2,
                floor: 2,
                name: "顶楼楼东",
                icon: "images/icon-wind-on.png",
                style: {"margin-left": "200px", "margin-top": "120px" }
            },
            {
                id: 3,
                type: 2,
                floor: 2,
                name: "二楼楼中",
                video: "video.html",
                style: {"margin-left": "620px", "margin-top": "400px" }
            },
            // 市内空调照明
            {
                id: 1,
                type: 3,
                floor: 2,
                name: "顶楼楼东",
                icon: "images/icon-wind-on.png",
                style: {"margin-left": "200px", "margin-top": "120px" }
            },
            {
                id: 3,
                type: 3,
                floor: 2,
                name: "二楼楼中",
                video: "video.html",
                style: {"margin-left": "620px", "margin-top": "400px" }
            },
            // 门禁管理
            {
                id: 1,
                type: 5,
                floor: 2,
                name: "顶楼楼东",
                icon: "images/icon-wind-on.png",
                style: {"margin-left": "200px", "margin-top": "120px" }
            },
            {
                id: 3,
                type: 5,
                floor: 2,
                name: "二楼楼中",
                video: "video.html",
                style: {"margin-left": "620px", "margin-top": "400px" }
            },
            // 消防监控
            {
                id: 1,
                type: 6,
                floor: 2,
                name: "顶楼楼东",
                icon: "images/icon-wind-on.png",
                style: {"margin-left": "200px", "margin-top": "120px" }
            },
            {
                id: 3,
                type: 6,
                floor: 2,
                name: "二楼楼中",
                video: "video.html",
                style: {"margin-left": "620px", "margin-top": "400px" }
            },
        ];
        var floors = {
            "2": {
                id: 2,
                name: "楼层一",
                resource: "./uploads/floor-1.png",
            },
            "3": {
                id: 3,
                name: "楼层二",
                resource: "./uploads/floor-2.png",
            },
        };

        $scope.data = {
            user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),
            
            pageTitle: settings.pageTitle,
            headLeft: "安全·舒适·节能",
            headRight: moment().format("YYYY-MM-DD dddd"),

            // 建筑id
            buildingId: 56, //global.read_storage("session", "building")["id"],
            types: types,
            type: types[((global.request("tp") != "" && global.request("tp") > 0) ? global.request("tp") : "1")],
            subType: "",
            floors: floors,
            floor: types[((global.request("fl") != "" && global.request("fl") > 0) ? global.request("fl") : "")],

            devices: devices,

            fmt: "YYYY-MM-DD",
            videoModalId: "#videoModal",
        }

        $scope.displayType = function(type) {
            //$scope.goto('device', 'tp='+type.id);
            $scope.data.type = type;
            if($scope.data.type.childs.length>0 && !$scope.data.subType) {
                $scope.data.subType = $scope.data.type.childs[0];
            }
            if(!$scope.data.floor) {
                $scope.data.floor = $scope.data.floors[Object.keys($scope.data.floors)[0]];
            }
        }

        $scope.displayFloor = function(floor) {
            //$scope.goto('device', 'tp='+$scope.data.type.id + '&fl='+floor.id);
            if(floor.hasOwnProperty("id")) {
                $scope.data.floor = floor;
            } else {
                $scope.data.floor = "";
            }
            if($scope.data.type.childs.length>0 && !$scope.data.subType) {
                $scope.data.subType = $scope.data.type.childs[0];
            }
        }
        $scope.displaySubType = function(subType) {
            if(subType.hasOwnProperty("id")) {
                $scope.data.subType = subType;
            } else {
                $scope.data.subType = null;
            }
            if(!$scope.data.floor) {
                $scope.data.floor = $scope.data.floors[Object.keys($scope.data.floors)[0]];
            }
        }

        $scope.displayDevice = function(device) {

        }

        $scope.getDatas = function() {
            $scope.$apply(function(){
                
            });
        }

        $scope.getFloorDevices = function(type, floor) {
            $scope.$apply(function(){
                // points: [
                //     {
                //         id: 1,
                //         name: "顶楼楼东",
                //         video: "video.html",
                //         style: {"margin-left": "200px", "margin-top": "120px" }
                //     }
                // ],
                // resource: "./uploads/floor-1.png",
                $scope.data.floors = [
                    {
                        id: 2,
                        name: "楼层一",
                        points: [
                            {
                                id: 1,
                                name: "顶楼楼东",
                                video: "video.html",
                                style: {"margin-left": "200px", "margin-top": "120px" }
                            }
                        ],
                        resource: "./uploads/floor-1.png",
                    },
                    {
                        id: 3,
                        name: "楼层二",
                        points: [
                            {
                                id: 1,
                                name: "顶楼楼东",
                                video: "video.html",
                                style: {"margin-left": "200px", "margin-top": "120px" }
                            },
                            {
                                id: 2,
                                name: "二楼楼中",
                                video: "video.html",
                                style: {"margin-left": "620px", "margin-top": "400px" }
                            }
                        ],
                        resource: "./uploads/floor-2.png",
                    },
                ];

                // 选中当前楼层
                $scope.data.floors.filter(function(f){
                    return f.id == $scope.data.floor;
                })[0];
                $scope.data.floorSelected = $scope.data.floors.filter(function(f){
                    return f.id == $scope.data.floor;
                })[0];
            });
        }
    });
});