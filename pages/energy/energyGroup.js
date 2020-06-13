define(function (require) {
    var app = require('../../js/app');
    var feather = require('feather');
    var moment = require('moment');
    var echarts = require('echarts');

    app.controller('energyGroupCtrl', function($scope) {
        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func();    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function () {
            global.on_loaded_func($scope);    // 显示页面内容
        });

        refreshInterval = 5*60*1000; // N 分钟刷新所有电站数据
        var mapId = "map";

        var startDay = "2020-03-24";


        $scope.$watch('$viewContentLoaded', function() {
            //feather.replace();
            global.on_loaded_func($scope);    // 显示页面内容
        });

        // 最后执行
        setTimeout(function(){
            // 初始化日期控件
            $($scope.data.datePickerDom).datepicker({
                autoclose: true,
                todayHighlight: true,
                language: "zh-CN",
                format: "yyyy-mm-dd"
            });
            $scope.$apply(function () {
                $scope.data.chartType = $scope.data.chartTypes[1];
                $scope.data.chartCompare = $scope.data.chartCompares[0];
            });
            $scope.dailyChart = echarts.init(document.getElementById("dailyChart"));
            $scope.summaryPieChart = echarts.init(document.getElementById("summaryPieChart"));
            $scope.getDatas();
        }, 0);

        $scope.data = {
            // 空气质量
            "cityId": "1233",  // 嘉兴市
            "AppCode": "1b676b19152f4f41b16a961742c49ac0",  // aliyun墨迹

            user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),

            pageTitle: settings.pageTitle,
            headLeft: "安全·舒适·节能",
            headRight: moment().format("YYYY-MM-DD dddd"),

            safeDays: moment().diff(moment(startDay), "days"), // 安全运行天数

            // showType ->  hour/day/month/year
            // energyType -> 01/02/03/04
            // energySubType -> 能耗分项/建筑区域/组织机构
            showType: "day", // 默认固定
            energyType: global.request("et"), // 01 -> 电
            energySubType: global.request("est"),
            parent: global.request("pid"),
            typeName: settings.types[global.request("et")],
            subTypeName: settings.subTypes[global.request("est")],

            fmt: "YYYY-MM-DD",
            leftOn: true,
            datePickerDom: ".datePicker",
            fromDate: moment().add(-7, 'day').format("YYYY-MM-DD"),
            toDate: moment().format("YYYY-MM-DD"),

            internationalValues: {
                "01": 0.0015,
                "02": 0.0015,
                "03": 0.0015,
                "04": 0.0015,
                "05": 0.0015,
            },

            typeNames: settings.typeNames,
            chartTypes: settings.defaultDateTypes,
            chartCompares: [
    //                        {
    //                            val: 2018,
    //                            name: "2018年同比数据"
    //                        }
            ],
            query: {
    //                    type: null,
    //                    compareTo: null,
            },
            chartType: null,  // 默认按天
            chartCompare: null,  // 默认上一年度

            result:{
                itemGroups: {},
                summaryDatas: {},
                chartDatas: {},
                tableData: {},
            },

            hasChilds : true,

            lineOpt: settings.defaultLineOpt,

            pieOpt: settings.defaultPieOpt,

        }

        // 生成对比年份
        for(var i = 1; i < 6; i++) {
            var year = moment().add(-i, 'year').format("YYYY");
            $scope.data.chartCompares.push({
                val: year,
                name: year,
            })
        }

        // 获取分类标题
        $scope.getItemGroupByType = function (callback) {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getItemGroupByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    type: $scope.data.energyType,
                    subType: $scope.data.energySubType,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.itemGroups = {};
                    // 先遍历出零级分组
                    res.data.map(function (ig) {
                        if(!ig.parent) {
                            $scope.data.result.itemGroups = ig;
                            $scope.data.result.itemGroups.childs = [];
                        }
                    });
                    // 再遍历出一级分组
                    res.data.map(function (ig) {
                        if(ig.parent == $scope.data.result.itemGroups.id) {
                            $scope.data.result.itemGroups.childs.push(ig);
                        }
                    });

                    if(typeof callback == "function") {
                        callback();
                    }
                });
            });
        }

        // 获取分类标题
        $scope.getEnergyChartDataByType = function() {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getEnergyChartDataByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: $scope.data.fromDate,
                    to: $scope.data.toDate,
                    type: $scope.data.chartType.val,
                    energyType: $scope.data.energyType,
                    parent: $scope.data.parent ? $scope.data.parent : $scope.data.result.itemGroups.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.chartDatas = res.data;
                    if(Object.keys(res.data).length > 1) {
                        $scope.data.hasChilds = true;
                    } else {
                        $scope.data.hasChilds = false;
                    }
                    summaryPieDraw();
                    dailyChartDraw();
                });
            });
        }

        // 获取table数据
        $scope.getEnergyTableDataByType = function() {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getEnergyTableDataByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: $scope.data.fromDate,
                    to: $scope.data.toDate,
                    type: $scope.data.chartType.val,
                    energyType: $scope.data.energyType,
                    parent: $scope.data.parent ? $scope.data.parent : $scope.data.result.itemGroups.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.tableData.title = res.data[0];
                    $scope.data.result.tableData.data = res.data.slice(1, res.data.length);
                });
            });
        }

        $scope.getDatas = function () {
            // 获取分类标题
            $scope.getItemGroupByType(function () {
                // 获取图表数据
                $scope.getEnergyChartDataByType();
                // 获取table数据
                $scope.getEnergyTableDataByType();
            });
        };

        function summaryPieDraw() {
            var opt = angular.copy($scope.data.pieOpt);
            var legend_data = [];

            for(i in $scope.data.result.chartDatas) {
                var d = $scope.data.result.chartDatas[i];
                opt.legend.data.push(d["name"]);
                var data = 0;
                for(var i=0; i< d.datas.length; i++) {
                    data += parseFloat(d.datas[i][d.val]);
                }
                opt.series[0].data.push({
                    value: data.toFixed(2),
                    name: d["name"]
                });
            }
            console.log("summaryPieDraw", opt);
            $scope.summaryPieChart.setOption(opt, true);
            $("#summaryPieChart").width("100%");
            $scope.summaryPieChart.resize();
            return data;
        };

        function dailyChartDraw () {
            var opt = angular.copy($scope.data.lineOpt);
            opt.xAxis[0].type = 'category';
            opt.xAxis[0].data = [];
            for(var i=0; i<=moment($scope.data.toDate).diff(moment($scope.data.fromDate), "days"); i++) {
                opt.xAxis[0].data.push(moment($scope.data.fromDate).add(i, "day").format("YYYY-MM-DD"));
            }
            var legend_data = [];
            var tmp_sub_data = {};
            // 生成处理函数
            var func = null;
            if($scope.data.selectSummaryChartType == 1) {
                func = function(a) {
                    return parseFloat(a).toFixed(4);
                }
            } else {
                func = function(a, b) {
                    try {
                        return (a / b).toFixed(4);
                    } catch (e) {
                        return a;
                    }
                }
            }
            // 先清空模板
            opt.series=[];
            for(i in $scope.data.result.chartDatas) {
                var d = $scope.data.result.chartDatas[i];
                legend_data.push(d["name"]);
                var tmpSeries = {
                    name: d["name"],
                    type:'line',
                    //stack: '总量',
                    //itemStyle: {normal: {lineStyle: {type: 'default'}}},
                    data: fmtEChartData(opt.xAxis[0].data, d, func),
                };
                opt.series.push(tmpSeries);
                tmp_sub_data[d["gid"]] = d["name"];
            }

            // 添加国际值线
            legend_data.push("国际值");
            opt.series.push({
                name: "国际值",
                type: "line",
                symbol: 'none',
                itemStyle: {normal: {lineStyle: {type: 'dotted'}}},
                data: fmtEChartData(opt.xAxis[0].data, {data: []}, undefined, $scope.data.internationalValues[$scope.data.type]),
                z: 100,  // 显示在最顶层
            });
            opt.legend.data = legend_data;
            $scope.data.subTypes = tmp_sub_data;
            console.log("dailyChartDraw", opt);
            global.drawEChart($scope.dailyChart, opt);
            setTimeout(function(){
                $("#dailyChart").width("100%");
                $scope.dailyChart.resize();
            }, 0);
        };
        function fmtEChartData (categroys, data, func, defaultVal) {
            if(typeof defaultVal == "undefined") { defaultVal = 0; }
            if(typeof func == "undefined") { func = function(a){ return a.val; } };
            var tmpSeriesData = [];
            for (var i in categroys) {
                tmpSeriesData[i] = defaultVal;
                for (var j in data.datas) {
                    if (data.datas[j][data.key] == categroys[i]) {
                        tmpSeriesData[i] = func(data.datas[j][data.val], data.area);
                        break;
                    }
                }
            }
            return tmpSeriesData;
        }

        $scope.refreshDatas = function () {
            // 获取图表数据
            $scope.getEnergyChartDataByType();
            // 获取table数据
            $scope.getEnergyTableDataByType();
        }

        $scope._goto = function(page, pid) {
            $scope.goto(page, {
                "et" : $scope.data.energyType,
                "est" : $scope.data.energySubType,
                "pid":pid,
            });
        }
    });
});