define(function (require) {
    var app = require('../../js/app');

    app.controller('safeElectricityCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
        var settings = require('comm').settings;
        var global = require('comm').global;
        var feather = require('feather');
        var echarts = require('echarts');
        var moment = require('moment');

        window.echarts = echarts;
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

            category: $stateParams.category,
            types: settings.warningTypes,
            type: $stateParams.type,
            typeName: settings.warningTypes[$stateParams.type],
            subType: "",
            showActionMenu: false,

            fmt: "YYYY-MM",
            fromDate: moment().add(-1, 'year').format("YYYY-MM"),
            toDate: moment().format("YYYY-MM"),
            todayStr: moment().format("YYYY-MM-DD"),

            result: {
                summaryDatas: [],
                tableData: {},

                resources: [], // 对应布局资源内容
                resourceActive: 0, // 默认选中第一个
                datas: [],
            },
        }

        $scope.getDatas = function () {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getResource,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    category: $scope.data.category,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    if(res.data.length > 0) {
                        // 尝试字符串转array
                        res.data.map(function(d) {
                            try {
                                d.val = JSON.parse(d.val);
                            } catch(e) {
                                // pass
                            }
                            try {
                                d.otherData = JSON.parse(d.otherData);
                            } catch(e) {
                                // pass
                            }
                            return d;
                        });
                    }
                    $scope.data.result.resources = res.data;
                    $scope.data.result.resourceActive = 0; // 默认选中第一个
                });
            });

            //$scope.$apply(function () {
                // $scope.data.result["lines"] = [
                //     {
                //         class: "line",
                //         style: {
                //             "width": "1000px",
                //             "margin-left": "50px",
                //             "margin-top": "10px"
                //         },
                //     },
                //     {
                //         class: "hline",
                //         style: {
                //             "width": "250px",
                //             "margin-left": "75px",
                //             "margin-top": "10px"
                //         },
                //     },
                //     {
                //         class: "hline",
                //         style: {
                //             "width": "250px",
                //             "margin-left": "275px",
                //             "margin-top": "10px"
                //         },
                //     },
                //     {
                //         class: "hline",
                //         style: {
                //             "width": "250px",
                //             "margin-left": "475px",
                //             "margin-top": "10px"
                //         },
                //     },
                //     {
                //         class: "hline",
                //         style: {
                //             "width": "250px",
                //             "margin-left": "675px",
                //             "margin-top": "10px"
                //         },
                //     },
                //     {
                //         class: "hline",
                //         style: {
                //             "width": "250px",
                //             "margin-left": "875px",
                //             "margin-top": "10px"
                //         },
                //     }
                // ];
                $scope.data.result["datas"] = [
                    {
                        "id": 1,
                        "itemId": 1,
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
                            "margin-left": "300px",
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
                        "warningStatus": "notice",
                        "x": 00,
                        "y": 700,
                        "_style": {
                            "margin-top": "00px",
                            "margin-left": "500px",
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
                        "status": "off",
                        "warningStatus": "warning",
                        "x": 000,
                        "y": 1000,
                        "_style": {
                            "margin-top": "000px",
                            "margin-left": "700px",
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
                            "margin-left": "900px",
                        }
                    }
                ];

                // $scope.data.result.tableData = {
                //     "title": {
                //         "id":"序号",
                //         "baseType": "基础类型",
                //         "type": "报警类型",
                //         "recordedAt": "报警时间",
                //         "itemName": "设备名称",
                //         "planVal": "计划数据",
                //         "realVal": "实际数据",
                //         "unit": "单位",
                //         "note": "备注",
                //         "status": "是否处理",
                //     },
                //     "data": [
                //         {
                //             "id":"1",
                //             "baseType": "安全用电",
                //             "type": "电流超标",
                //             "recordedAt": "2019-05-01 14:20",
                //             "itemName": "2F 烹饪区、面点间、切配区",
                //             "planVal": "15",
                //             "realVal": "17.36",
                //             "unit": "A",
                //             "note": "因为暂时打开大功率设备,已处理",
                //             "status": "是",
                //         },
                //         {
                //             "id":"2",
                //             "baseType": "安全用电",
                //             "type": "温度超标",
                //             "recordedAt": "2019-06-12 10:30",
                //             "itemName": "-1F 指挥中心",
                //             "planVal": "50",
                //             "realVal": "65",
                //             "unit": "摄氏度",
                //             "note": "因为设备老化,已更换",
                //             "status": "是",
                //         },
                //         {
                //             "id":"3",
                //             "baseType": "安全用电",
                //             "type": "电压超标",
                //             "recordedAt": "2019-06-12 11:50",
                //             "itemName": "1#进线",
                //             "planVal": "380",
                //             "realVal": "550",
                //             "unit": "V",
                //             "note": "因为设备故障,已处理",
                //             "status": "是",
                //         },
                //         {
                //             "id":"4",
                //             "baseType": "安全用电",
                //             "type": "功率超标",
                //             "recordedAt": "2019-05-01 14:20",
                //             "itemName": "1#进线",
                //             "planVal": "457",
                //             "realVal": "487",
                //             "unit": "kw",
                //             "note": "因为全部设备都打开,已处理",
                //             "status": "是",
                //         },
                //         {
                //             "id":"5",
                //             "baseType": "水流平衡",
                //             "type": "流量偏低",
                //             "recordedAt": "2019-05-01 14:20",
                //             "itemName": "6下",
                //             "planVal": "1.25",
                //             "realVal": "0.78",
                //             "unit": "m3/s",
                //             "note": "因为管道堵塞,已处理",
                //             "status": "是",
                //         },
                //         {
                //             "id":"6",
                //             "baseType": "水流平衡",
                //             "type": "压力偏高",
                //             "recordedAt": "2019-05-01 14:20",
                //             "itemName": "6下",
                //             "planVal": "1.25",
                //             "realVal": "1.78",
                //             "unit": "千帕",
                //             "note": "因为管道堵塞,已处理",
                //             "status": "是",
                //         },
                //         {
                //             "id":"7",
                //             "baseType": "水流平衡",
                //             "type": "管道隐漏",
                //             "recordedAt": "2019-06-07 10:20",
                //             "itemName": "1总",
                //             "planVal": "1.05",
                //             "realVal": "1.15",
                //             "unit": "主管道,支路管道总流量比例",
                //             "note": "因为三楼支路管道老化,已处理",
                //             "status": "是",
                //         },
                //         {
                //             "id":"8",
                //             "baseType": "环境板块",
                //             "type": "二氧化碳超标",
                //             "recordedAt": "2019-06-07 10:20",
                //             "itemName": "3F会议室",
                //             "planVal": "800",
                //             "realVal": "1200",
                //             "unit": "PPM",
                //             "note": "因为使用会议室,人数较多,不用处理",
                //             "status": "是",
                //         },
                //         {
                //             "id":"9",
                //             "baseType": "环境板块",
                //             "type": "PM2.5超标",
                //             "recordedAt": "2019-06-07 10:20",
                //             "itemName": "3F会议室",
                //             "planVal": "250",
                //             "realVal": "330",
                //             "unit": "浓度",
                //             "note": "因为使用会议室,人数较多,不用处理",
                //             "status": "是",
                //         },
                //         {
                //             "id":"10",
                //             "baseType": "环境板块",
                //             "type": "温度超标",
                //             "recordedAt": "2019-06-07 10:20",
                //             "itemName": "3F会议室",
                //             "planVal": "30",
                //             "realVal": "32",
                //             "unit": "摄氏度",
                //             "note": "因为使用会议室,人数较多,不用处理",
                //             "status": "是",
                //         },
                //     ],
                // };
            //});
        };

        $scope.changeSubtype = function(subType) {
            $scope.data.subType = subType;
        }

        $scope.updateItem = function (status) {
            var note=prompt("请输入处理意见", "");
            if (note!=null && note!="") {
                $scope.data.showActionMenu = false;
            }
        };
        
        $scope.displayRecorce = function(ind) {
            $scope.data.result.resourceActive = ind;
        }

        $scope.changeType = function(type) {
            $scope.goto('warning', 'tp='+type);
        }

        $scope.showWarningList = function(item) {

        }

    }]);
});