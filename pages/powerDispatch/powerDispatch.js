define(function (require) {
    var app = require('../../js/app');
    var feather = require('feather');
    var moment = require('moment');

    app.controller('powerDispatchCtrl', function($scope) {
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
            "1": {
                id: 1,
                name: "大楼配电房",
            },
            "2": {
                id: 2,
                name: "中压变电",
            },
            "3": {
                id: 3,
                name: "低压变电I",
            },
            "4": {
                id: 4,
                name: "低压变电II",
            },
            "5": {
                id: 5,
                name: "低压变电III",
            }
        };

        $scope.data = {
            user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),

            pageTitle: settings.pageTitle,
            headLeft: "安全·舒适·节能",
            headRight: moment().format("YYYY-MM-DD dddd"),

            types: types,
            type: types[((global.request("tp") != "" && global.request("tp") > 0) ? global.request("tp") : "1")],

            fmt: "YYYY-MM-DD",
            videoModalId: "#videoModal",
        }

        $scope.displayType = function(type) {
            $scope.goto('powerDispatch', 'tp='+type.id);
        }

        $scope.getDatas = function() {
            $scope.$apply(function(){
                // lines -> 实际背景线条
                // line -> 水平; hline -> 垂直
                // datas -> 显示内容
                // status 会改变开关图标
                // x,y 是原始数据, 用于计算 _style 样式
                $scope.data.types["1"]["lines"] = [
                    {
                        class: "line",
                        style: {
                            "width": "1470px",
                            "margin-left": "50px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "250px",
                            "margin-left": "75px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "250px",
                            "margin-left": "375px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "250px",
                            "margin-left": "675px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "250px",
                            "margin-left": "975px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "250px",
                            "margin-left": "1275px",
                            "margin-top": "10px"
                        },
                    }
                ];
                $scope.data.types["1"]["datas"] = [
                    {
                        "id": 1,
                        "name": "市电109线",
                        "vals": [
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 0,
                        "y": 100,
                        "_style": {
                            "margin-top": "0px",
                            "margin-left": "100px",
                        }
                    },
                    {
                        "id": 2,
                        "name": "1#变压器",
                        "vals": [
                            {
                                "val": "64.00",
                                "unit":"A",
                            },
                            {
                                "val": "82.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 00,
                        "y": 400,
                        "_style": {
                            "margin-top": "00px",
                            "margin-left": "400px",
                        }
                    },
                    {
                        "id": 3,
                        "name": "联络1",
                        "vals": [
                            {
                                "val": "445.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 00,
                        "y": 700,
                        "_style": {
                            "margin-top": "00px",
                            "margin-left": "700px",
                        }
                    },
                    {
                        "id": 4,
                        "name": "2#变压器",
                        "vals": [
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 000,
                        "y": 1000,
                        "_style": {
                            "margin-top": "000px",
                            "margin-left": "1000px",
                        }
                    },
                    {
                        "id": 5,
                        "name": "同乐743线",
                        "vals": [
                            {
                                "val": "134.00",
                                "unit":"A",
                            },
                            {
                                "val": "132.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 00,
                        "y": 1300,
                        "_style": {
                            "margin-top": "00px",
                            "margin-left": "1300px",
                        }
                    }
                ];

                $scope.data.types["2"]["lines"] = [
                    {
                        class: "line",
                        style: {
                            "width": "1270px",
                            "margin-left": "50px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "700px",
                            "margin-left": "75px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "450px",
                            "margin-left": "375px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "450px",
                            "margin-left": "675px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "700px",
                            "margin-left": "975px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "700px",
                            "margin-left": "1275px",
                            "margin-top": "10px"
                        },
                    }
                ];
                $scope.data.types["2"]["datas"] = [
                    {
                        "id": 1,
                        "name": "1P3G-1备用",
                        "vals": [
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 0,
                        "y": 100,
                        "_style": {
                            "margin-top": "0px",
                            "margin-left": "100px",
                        }
                    },
                    {
                        "id": 2,
                        "name": "1P3G-2主楼照明1",
                        "vals": [
                            {
                                "val": "64.00",
                                "unit":"A",
                            },
                            {
                                "val": "82.00",
                                "unit":"A",
                            },
                            {
                                "val": "62.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 200,
                        "y": 100,
                        "_style": {
                            "margin-top": "200px",
                            "margin-left": "100px",
                        }
                    },
                    {
                        "id": 3,
                        "name": "1P3G-3中央空调1",
                        "vals": [
                            {
                                "val": "445.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "512.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 400,
                        "y": 100,
                        "_style": {
                            "margin-top": "400px",
                            "margin-left": "100px",
                        }
                    },


                    {
                        "id": 4,
                        "name": "1P4G-1备用",
                        "vals": [
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 000,
                        "y": 400,
                        "_style": {
                            "margin-top": "000px",
                            "margin-left": "400px",
                        }
                    },
                    {
                        "id": 5,
                        "name": "1P4G-2大楼USB电源开关",
                        "vals": [
                            {
                                "val": "134.00",
                                "unit":"A",
                            },
                            {
                                "val": "132.00",
                                "unit":"A",
                            },
                            {
                                "val": "135.00",
                                "unit":"A",
                            }
                        ],
                        "status": "off",
                        "x": 200,
                        "y": 100,
                        "_style": {
                            "margin-top": "200px",
                            "margin-left": "400px",
                        }
                    },

                    {
                        "id": 6,
                        "name": "1P5G-1备用",
                        "vals": [
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 000,
                        "y": 700,
                        "_style": {
                            "margin-top": "000px",
                            "margin-left": "700px",
                        }
                    },
                    {
                        "id": 7,
                        "name": "1P5G-2泵房控制中心1",
                        "vals": [
                            {
                                "val": "134.00",
                                "unit":"A",
                            },
                            {
                                "val": "132.00",
                                "unit":"A",
                            },
                            {
                                "val": "135.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 200,
                        "y": 700,
                        "_style": {
                            "margin-top": "200px",
                            "margin-left": "700px",
                        }
                    },

                    {
                        "id": 8,
                        "name": "1P7G-1备用",
                        "vals": [
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 0,
                        "y": 1000,
                        "_style": {
                            "margin-top": "0px",
                            "margin-left": "1000px",
                        }
                    },
                    {
                        "id": 9,
                        "name": "1P7G-2电梯1",
                        "vals": [
                            {
                                "val": "64.00",
                                "unit":"A",
                            },
                            {
                                "val": "82.00",
                                "unit":"A",
                            },
                            {
                                "val": "62.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 200,
                        "y": 1000,
                        "_style": {
                            "margin-top": "200px",
                            "margin-left": "1000px",
                        }
                    },
                    {
                        "id": 10,
                        "name": "1P7G-3电梯2",
                        "vals": [
                            {
                                "val": "445.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "512.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 400,
                        "y": 1000,
                        "_style": {
                            "margin-top": "400px",
                            "margin-left": "1000px",
                        }
                    },
                ];

                $scope.data.types["3"]["lines"] = $scope.data.types["4"]["lines"] = $scope.data.types["5"]["lines"]  = [
                    {
                        class: "line",
                        style: {
                            "width": "1250px",
                            "margin-left": "50px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "1050px",
                            "margin-left": "75px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "600px",
                            "margin-left": "575px",
                            "margin-top": "10px"
                        },
                    },
                    {
                        class: "hline",
                        style: {
                            "width": "700px",
                            "margin-left": "1075px",
                            "margin-top": "10px"
                        },
                    }
                ];
                $scope.data.types["3"]["datas"] = $scope.data.types["4"]["datas"] = $scope.data.types["5"]["datas"] = [
                    {
                        "id": 1,
                        "name": "1P3G-1备用",
                        "vals": [
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 0,
                        "y": 100,
                        "_style": {
                            "margin-top": "0px",
                            "margin-left": "100px",
                        }
                    },
                    {
                        "id": 2,
                        "name": "1P3G-2北裙房",
                        "vals": [
                            {
                                "val": "64.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 200,
                        "y": 100,
                        "_style": {
                            "margin-top": "200px",
                            "margin-left": "100px",
                        }
                    },
                    {
                        "id": 3,
                        "name": "1P3G-3正源风机",
                        "vals": [
                            {
                                "val": "0.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 400,
                        "y": 100,
                        "_style": {
                            "margin-top": "350px",
                            "margin-left": "100px",
                        }
                    },
                    {
                        "id": 5,
                        "name": "1P3G-5监控室",
                        "vals": [
                            {
                                "val": "7.80",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 600,
                        "y": 100,
                        "_style": {
                            "margin-top": "500px",
                            "margin-left": "100px",
                        }
                    },
                    {
                        "id": 5,
                        "name": "1P3G-6监控室北柜",
                        "vals": [
                            {
                                "val": "4.30",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 600,
                        "y": 100,
                        "_style": {
                            "margin-top": "650px",
                            "margin-left": "100px",
                        }
                    },
                    {
                        "id": 5,
                        "name": "1P3G-7监控室南柜",
                        "vals": [
                            {
                                "val": "3.50",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 600,
                        "y": 100,
                        "_style": {
                            "margin-top": "800px",
                            "margin-left": "100px",
                        }
                    },

                    {
                        "id": 1,
                        "name": "1P4G-1备用",
                        "vals": [
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            },
                            {
                                "val": "0.00",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 0,
                        "y": 100,
                        "_style": {
                            "margin-top": "0px",
                            "margin-left": "600px",
                        }
                    },
                    {
                        "id": 2,
                        "name": "1P4G-2南电梯",
                        "vals": [
                            {
                                "val": "5.20",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 200,
                        "y": 100,
                        "_style": {
                            "margin-top": "200px",
                            "margin-left": "600px",
                        }
                    },
                    {
                        "id": 2,
                        "name": "1P4G-2北电梯",
                        "vals": [
                            {
                                "val": "4.50",
                                "unit":"A",
                            }
                        ],
                        "status": "on",
                        "x": 200,
                        "y": 100,
                        "_style": {
                            "margin-top": "350px",
                            "margin-left": "600px",
                        }
                    }
                ];
            });
        }
    });
});