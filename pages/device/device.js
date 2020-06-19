define(function (require) {
    var app = require('../../js/app');
    var feather = require('feather');
    var moment = require('moment');

    app.controller('deviceCtrl', function($scope) {
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
                name: "风机盘管",
                icon: "fa fa-bullseye",
                childs: [],
            },
            "102": {
                id: 102,
                name: "新风机组",
                icon: "fa fa-thermometer-full",
                childs: [],
            },
            "103": {
                id: 103,
                name: "冷热源",
                icon: "fa fa-adjust",
                childs: [],
            },
            // "1": {
            //     id: 1,
            //     name: "暖通空调",
            //     icon: "fa-plane",
            //     childs: [
            //         {
            //             id: 101,
            //             name: "风机盘管",
            //             icon: "images/icon-wind-on.png",
            //         },
            //         {
            //             id: 102,
            //             name: "新风机组",
            //             icon: "fa-plane",
            //             icon: "images/icon-wind-on.png",
            //         },
            //         {
            //             id: 103,
            //             name: "冷热源",
            //             icon: "fa-plane",
            //             icon: "images/icon-wind-on.png",
            //         },
            //     ],
            // },
            "2": {
                id: 2,
                name: "智能照明",
                icon: "fa fa-paper-plane",
                childs: [],
            },
            "200": {
                id: 200,
                name: "VRV空调",
                icon: "fa fa-leaf",
                childs: [],
            },
            "3": {
                id: 3,
                name: "室内空调照明",
                icon: "fa fa-plug",
                childs: [],
            },
            "4": {
                id: 4,
                name: "给排水",
                icon: "fa fa-shopping-basket",
                childs: [],
            },
            "6": {
                id: 6,
                name: "消防监控",
                icon: "fa fa-taxi",
                childs: [
                    {
                        id: 601,
                        name: "烟感探头",
                        icon: "images/device_smoke_sensor.png",
                    },
                    {
                        id: 602,
                        name: "温感探头",
                        icon: "images/device_smoke_sensor.png",
                    },
                    {
                        id: 603,
                        name: "消防水压",
                        icon: "images/icon-sy.png",
                    },
                    {
                        id: 604,
                        name: "消防水位",
                        icon: "fa-plane",
                        icon: "images/icon-sw-m.png",
                    }
                ],
            }
        };
        var devices = [
            // 暖通空调
            {
                id: 1,
                type: 101,
                floor: 2,
                name: "顶楼楼东",
                icon: "images/icon_panguan.png",
                iconClass: "icons icon-panguan",
                // icon: "images/icon-wind-on.png",
                style: {"margin-left": "200px", "margin-top": "120px" }
            },
            {
                id: 3,
                type: 101,
                floor: 2,
                name: "二楼楼中",
                icon: "images/icon_panguan.png",
                iconClass: "icons icon-panguan",
                // video: "video.html",
                style: {"margin-left": "620px", "margin-top": "400px" }
            },
            {
                id: 3,
                type: 101,
                floor: 2,
                name: "二楼楼中",
                icon: "images/icon_panguan.png",
                iconClass: "icons icon-panguan",
                // video: "video.html",
                style: {"margin-left": "420px", "margin-top": "120px" }
            },
            {
                id: 2,
                type: 102,
                floor: 2,
                name: "顶楼楼东",
                icon: "images/icon_xinfeng.png",
                iconClass: "icons icon-xinfeng",
                // video: "video.html",
                style: {"margin-left": "300px", "margin-top": "150px" }
            },
            {
                id: 3,
                type: 102,
                floor: 2,
                name: "二楼楼中",
                iconClass: "icons icon-xinfeng",
                // video: "video.html",
                style: {"margin-left": "620px", "margin-top": "400px" }
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
            "4": {
                id: 4,
                name: "楼顶",
                resource: "./uploads/floor-t1.png",
            },
            "5": {
                id: 5,
                name: "配电间",
                resource: "./uploads/floor-b1.png",
            }
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

            // 风冷热泵
            if($scope.data.type.id == "103") {
                $scope.data.floors = {
                    "103": {
                        id: 103,
                        name: "风冷热泵",
                        resource: "./uploads/fenglengrebeng.png",
                    }
                };
                $scope.data.floor = $scope.data.floors["103"];
            } else {
                $scope.data.floors = floors;
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
                    {
                        id: 4,
                        name: "楼顶",
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
                        resource: "./uploads/floor-t1.png",
                    },
                    {
                        id: 5,
                        name: "地下一层",
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
                        resource: "./uploads/floor-b1.png",
                    }
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