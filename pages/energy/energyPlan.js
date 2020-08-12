define(function (require) {
    var app = require('../../js/app');

    app.controller('energyPlanCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
        var settings = require('comm').settings;
        var global = require('comm').global;
        var feather = require('feather');
        var echarts = require('echarts');
        var moment = require('moment');

        window.echarts = echarts;
        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func();    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function() {
            global.on_loaded_func($scope, $state, $stateParams);    // 显示页面内容
            
            // 图表初始化
            $scope.summaryChart = echarts.init(document.getElementById("summaryChart"));

            // 最后执行获取数据
            $scope.getDatas();
        });

        $scope.data = {
            user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),

            pageTitle: settings.pageTitle,
            headLeft: "安全·舒适·节能",
            headRight: moment().format("YYYY-MM-DD dddd"),

            fmt: "YYYY-MM-DD",
            
            fromDate: moment().add(-15, 'day').format("YYYY-MM-DD"),
            toDate: moment().format("YYYY-MM-DD"),
            compareFromDate: moment().format("YYYY-MM-DD"),
            compareToDate: moment().format("YYYY-MM-DD"),

            todayStr:moment().format("YYYY-MM-DD"),
            
            // showType ->  hour/day/month/year
            // energyType -> 01/02/03/04
            // energySubType -> 能耗分项/建筑区域/组织机构
            showType: "day", // 
            energyType: $stateParams.energyType, //
            typeNames: settings.typeNames,
            energyMenu: $stateParams.energyMenu || "energyPlan",

            subTypes: settings.subTypes, // 能耗分项,建筑区域,组织机构,自定义
            chartTypes: settings.defaultDateTypes,

            tableData: {},  // 显示table的分类数据
            cacheData: {},  // 原始分类数据

            internationalValues: {
                "01": 1.05,
                "02": 1.05,
                "03": 1.05,
                "04": 1.05,
                "05": 1.05,
            },

            result:{
                summaryDatas: [],
                chartDatas: {},
                tableData: {},

                itemGroups: [],
                itemList: [],
            },
            option: settings.defaultLineOpt,
        }

        // 获取所有计划数据
        $scope.getPlanDatas = function() {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getEnergyPlans,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    type: $scope.data.energyType,
                }
            };
            return global.return_promise($scope, param);
        };

        $scope.buildPlanDatasTable = function(res) {
            var tableData = {
                "title": ["id", "计划类型", "日期", "计划用量", "计划平均量", "计算方式", "备注"],
                "data": [],
            };
            var cacheData = {};
            res.data.map(function (cur) {
                tableData.data.push([cur.id, cur.planType, cur.planDate, cur.planVal, cur.planValAvg, cur.planMethod, cur.note]);
                cacheData[cur.id] = cur;
            });
            $scope.$apply(function () {
                $scope.data.tableData = tableData;
                $scope.data.cacheData = cacheData;
            });
        }

        // 获取最近15日对照图表数据
        $scope.getEnergyChartDataByType = function () {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getEnergyChartDataByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: $scope.data.fromDate,
                    to: $scope.data.toDate,
                    type: $scope.data.showType,
                    energyType: $scope.data.energyType,
                    viewType: "avg", // 能耗密度
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.chartDatas = res.data;
                    summaryChartDraw($scope.data);
                });
            });
        };

        // 获取汇总数据
        $scope.getDatas = function () {
            // 获取所有计划数据
            $scope.getPlanDatas()
                .then($scope.buildPlanDatasTable)
                .catch($scope.ajaxCatch);

            // 获取最近15日对照图表数据
            $scope.getEnergyChartDataByType();
        };

        function summaryChartDraw(data) {
            var opt = angular.copy($scope.data.option);
            opt.xAxis[0].type = "category"; // 修改x轴
            var curFmt = $scope.data.fmt;
            var to = $scope.data.toDate

            // 生成x轴内容
            var xlen = Math.ceil(moment(moment(to).format(curFmt)).diff(moment($scope.data.fromDate).format(curFmt), $scope.data.showType+'s', true));
            for(var i=0; i<=xlen; i++) {
                opt.xAxis[0].data.push(moment($scope.data.fromDate).add($scope.data.showType+'s', i).format(curFmt));
            }

            var legend_data = [];
            var tmp_sub_data = {};

            // 添加实际值
            for(var o in data.result.chartDatas) {
                var sd = [];
                for(var i=0; i<=xlen; i++) {
                    sd.push(0);
                }
                var d = data.result.chartDatas[o];
                opt.legend[0].data.push(d.name);
                if(d.datas) {
                    d.datas.map(function (k) {
                        var ind = opt.xAxis[0].data.indexOf(moment(k[d.key]).format(curFmt));
                        sd[ind] = parseFloat(k[d.val]).toFixed(4);
                    });
                }
                legend_data.push(d["name"]);
                var tempSeries = {
                    name: d.name,
                    type: "bar",
                    stack: "总量",
                    barWidth: "40%",
                    data: sd
                };
                opt.series.push(tempSeries);
            }

            // 添加国际值线
            legend_data.push("国际值");
            opt.series.push({
                name: "国际值",
                type: "line",
                symbol: 'none',
                itemStyle: {normal: {lineStyle: {type: 'dotted'}}},
                data: fmtEChartData(opt.xAxis[0].data, {datas: []}, undefined, $scope.data.internationalValues[$scope.data.energyType]),
                z: 100,  // 显示在最顶层
            });
            $scope.data.subTypes = tmp_sub_data;

            // 添加计划值线
            legend_data.push("计划值");
            opt.series.push({
                name: "计划值",
                type: "line",
                symbol: 'none',
                //itemStyle: {normal: {lineStyle: {type: 'dotted'}}},
                data: fmtEChartPlanData(opt.xAxis[0].data, $scope.data.tableData.data),
                z: 100,  // 显示在最顶层
            });

            opt.legend[0].data = legend_data;
            //$scope.data.subTypes = tmp_sub_data;

            console.log(opt);
            $scope.summaryChart.setOption(opt, true);
            $scope.summaryChart.resize();
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

        function fmtEChartPlanData(categroys, data) {
            var tmpSeriesData = [];

            for (var i in categroys) {
                tmpSeriesData[i] = 0;
                for(j in data) {
                    var dt = data[j][1]; // 类型
                    var dd = data[j][2]; // 日期
                    var dv = data[j][4]; // 平均值

                    // 特殊节假日
                    if(dd) {
                        if(categroys[i] == dd) {
                            tmpSeriesData[i] = dv;
                        }
                    } else {
                        var wd = moment(categroys[i]).format("d");
                        if (dt == "工作日" && wd >= 1  && wd <= 5) {
                            tmpSeriesData[i] = dv;
                        } else if(dt == "周末" && (wd < 1  || wd > 5)) {
                            tmpSeriesData[i] = dv;
                        }
                    }
                }
            }
            return tmpSeriesData;
        }

        // function summaryChartDraw(data) {
        //     if($scope.data.summaryChartInit) {
        //         return ;
        //     }
        //     $scope.data.summaryChartInit = true;
        //     var opt = angular.copy($scope.data.option);
        //     opt.xAxis[0].type = 'category';
        //     opt.xAxis[0].data = [];
        //     var curFmt = $scope.data.fmt;

        //     var to = $scope.data.toDate;
        //     if($scope.data.showType == "hour") {
        //         to = $scope.data.toDate + " 24";
        //     } else {
        //         to = moment($scope.data.toDate).format($scope.data.fmt);
        //     }

        //     // 生成x轴内容
        //     var xlen = Math.ceil(moment(moment(to).format($scope.data.fmt)).diff(moment($scope.data.fromDate).format($scope.data.fmt), $scope.data.showType+'s', true));
        //     for(var i=0; i<=xlen; i++) {
        //         opt.xAxis[0].data.push(moment($scope.data.fromDate).add($scope.data.showType+'s', i).format($scope.data.fmt));
        //     }
        //     console.log(opt);
        //     $scope.summaryChart.setOption(opt, true);
        //     $scope.summaryChart.resize();
        // };

        // function summaryChartDrawData(data, dataKey) {
        //     var opt = $scope.summaryChart.getOption();
        //     var xlen = opt.xAxis[0].data.length;
        //     var name = dataKey == "chartDatas" ? '电量' : $scope.data.chartCompare.val+"电量";
        //     var seriesInd = dataKey == "chartDatas" ? 0 : 1;
        //     var type = dataKey == "chartDatas" ? "bar" : "line";
        //     for(var o in data.result[dataKey]) {
        //         var sd = [];
        //         for(var i=0; i<=xlen; i++) {
        //             sd.push(0);
        //         }
        //         var d = data.result[dataKey][o];
        //         opt.legend[0].data.push(name);
        //         if(d.datas) {
        //             d.datas.map(function (k) {
        //                 var ind = opt.xAxis[0].data.indexOf(moment(k[d.key]).format($scope.data.chartType.xAxisFmt));
        //                 sd[ind] = parseFloat(k[d.val]).toFixed(4);
        //             });
        //         }
        //         var tempSeries = {
        //             name: name,
        //             type: type,
        //             //stack: "总量",
        //             barWidth:"40%",
        //             data: sd
        //         };
        //         opt.series[seriesInd] = tempSeries;
        //     }
        //     console.log(opt);
        //     $scope.summaryChart.setOption(opt, true);
        //     $scope.summaryChart.resize();
        // }

        // 点击按刷新页面
        $scope.refreshDatas = function () {
            $scope.data.summaryChartInit = false;
            $scope.getEnergyChartDataByType();
            $scope.getEnergyChartCompareDataByType();
            $scope.getEnergyTableDataByType();
        };

        $scope.changeSubType = function(subType) {
            $state.go("energyDetail", {
                energyType: $scope.data.energyType,
                subType: subType,
                showType: $scope.data.showType,
            });
        }

        // 点击跳转
        $scope.gotoPage = function (et, dt) {
            //var query = "dt="+$scope.data.showType+"&et="+et;
            //$scope.goto("energySum", query);
            $scope.data.showType = dt;
            $scope.data.energyType = et;
            $scope.data.itemType = parseInt(et) + 10;


            if($scope.data.showType == "hour") {
                $scope.data.fromDate = $scope.data.toDate;
            } else {
                $scope.data.fromDate = moment($scope.data.toDate).add(-15, 'day').format("YYYY-MM-DD");
            }
            $scope.data.chartType = $scope.data.chartTypes.filter(function(t){
                return t.val == $scope.data.showType;
            })[0];
            // 生成对比年份
            for(var i = 1; i < 6; i++) {
                var year = moment().add(-i, 'year').format("YYYY");
                $scope.data.chartCompares.push({
                    val: year,
                    name: year,
                })
            }
            $scope.data.chartCompare = $scope.data.chartCompares[0];
            $scope.refreshDatas();
        };
    }]);

});