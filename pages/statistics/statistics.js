define(function (require) {
    var app = require('../../js/app');
    var feather = require('feather');
    var moment = require('moment');
    var echarts = require('echarts');

    app.controller('statisticsCtrl',function ($scope) {
        window.echarts = echarts;
        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func();    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function () {
            global.on_loaded_func($scope);    // 显示页面内容
            
            $scope.data.typeName = types[$scope.data.type];

            $scope.summaryChart = echarts.init(document.getElementById("summaryChart"));
            
            setTimeout(function(){
                $scope.getDatas();
            }, 0);
        });

        var types = {
            "all": "综合考评",
            "safety": "安全考评",
            "energy": "能耗考评",
        };

        $scope.data = {
            user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),

            pageTitle: settings.pageTitle,
            headLeft: "安全·舒适·节能",
            headRight: moment().format("YYYY-MM-DD dddd"),

            types: types,
            type: global.request("tp") != "" ? global.request("tp") : "all", // all 综合考评
            typeName: "",

            fmt: "YYYY-MM",
            fromDate: moment().add(-1, 'year').format("YYYY-MM"),
            toDate: moment().format("YYYY-MM"),
            todayStr: moment().format("YYYY-MM-DD"),

            result: {
                summaryDatas: [],
                tableData: {},
            },
        }

        $scope.getDatas = function () {
            $scope.$apply(function () {
                var radarOpt = {
                    color: _colors,
                    tooltip: {},
                    grid: {
                        top: 40,
                        left: 40,
                        right: 40,
                        bottom: 40,
                    },
                    legend: {
                        bottom: 5,
                        data: ['参考标准', '实际结果'],
                        textStyle: {
                            color: "rgba(60, 231, 218, 0.85)",
                            fontSize: "18",
                        },
                        y: "0px",
                        // selectedMode: 'single'
                    },
                    radar: {
                        // shape: 'circle',
                        name: {
                            textStyle: {
                                color: "rgba(255, 255, 255, 0.85)",
                                fontSize: "18",
                            }
                        },
                        splitNumber: 4,
                        splitLine: {
                            lineStyle: {
                                color: [
                                    'rgba(60, 231, 218, 0.2)',
                                    'rgba(60, 231, 218, 0.4)',
                                    'rgba(60, 231, 218, 0.6)',
                                    'rgba(60, 231, 218, 0.8)',
                                    'rgba(60, 231, 218, 1)'
                                ].reverse()
                            }
                        },
                        splitArea: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                color: 'rgba(60, 231, 218, 0.5)'
                            }
                        },
                        indicator: [
                            { name: '节约型设备', max: 100},
                            { name: '宣传教育工作', max: 100},
                            { name: '专项组织实施工作', max: 100},
                            { name: '资源节约效果', max: 100},
                            { name: '组织机构建设', max: 100},
                            { name: '管理制度', max: 100},
                            { name: '可再生能源利用', max: 100},
                            { name: '计量设备', max: 100},
                        ]
                    },
                    series: [
                        {
                            type: 'radar',
                            // areaStyle: {normal: {}},
                            data: [
                                // {
                                //     value: [100, 100, 100, 100, 100, 100, 100, 100],
                                //     name: '参考标准',
                                //     areaStyle: {
                                //         opacity: 0.15
                                //     }
                                // },
                                {
                                    value: [70, 50, 83, 67, 95, 88, 74, 92],
                                    name: '实际结果',
                                    areaStyle: {
                                        opacity: 0.15
                                    }
                                    // areaStyle: {normal: {}},
                                }
                            ]
                        }
                    ]
                };
                $scope.summaryChart.setOption(radarOpt, true);
                $scope.summaryChart.resize();
            });
        };

        $scope.changeType = function(type) {
            $scope.goto('statistics', 'tp='+type);
        }


    });
});