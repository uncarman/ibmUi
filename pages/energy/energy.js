define(function (require) {
    var app = require('../../js/app');

    app.controller('energyCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
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
            // 初始化日期控件
            $($scope.data.datePickerDom).datepicker({
                autoclose: true,
                todayHighlight: true,
                language: "zh-CN",
                format: "yyyy-mm-dd"
            });
            $scope.data.chartType = $scope.data.chartTypes.filter(function(t){
                return t.val == $scope.data.showType;
            })[0];
            // 生成对比年份
            for(var i = 1; i < 6; i++) {
                var year = moment().add(-i, 'year').format("YYYY");
                $scope.data.chartCompares.push({
                    val: year,
                    name: year,
                });
            }
            $scope.data.chartCompare = $scope.data.chartCompares[0];
            // 更新查询条件所有输入
            $scope.changeDisplayType();
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
            datePickerDom: ".datePicker",
            
            fromDate: moment().format("YYYY-MM-DD"),
            toDate: moment().format("YYYY-MM-DD"),
            compareFromDate: moment().format("YYYY-MM-DD"),
            compareToDate: moment().format("YYYY-MM-DD"),

            todayStr:moment().format("YYYY-MM-DD"),
            
            // showType ->  hour/day/month/year
            // energyType -> 01/02/03/04
            // energySubType -> 能耗分项/建筑区域/组织机构
            showType: $stateParams.showType, // 
            energyType: $stateParams.energyType, //
            subType: $stateParams.subType, //
            itemType: parseInt($stateParams.energyType) + 10, // 表对应的dateType

            subTypes: settings.subTypes, // 能耗分项,建筑区域,组织机构,自定义
            chartTypes: settings.defaultDateTypes,
            chartCompares: [],
            query: {},
            chartType: null,  // 默认按天
            chartCompare: null,  // 默认上一年度

            viewType: "all",  // 是查看总计，还是选设备看汇总
            itemSelected: [],
            groupSelected: [],

            result:{
                summaryDatas: [],
                chartDatas: {},
                tableData: {},

                itemGroups: [],
                itemList: [],
            },
            option: settings.defaultLineOpt,
        }

        // 格式化from to
        $scope.fmtDateRange = function() {
            var from = $scope.data.fromDate;
            var to = $scope.data.toDate;
            var compareFrom = moment($scope.data.fromDate).year($scope.data.chartCompare.val).format("YYYY-MM-DD");
            var compareTo = moment($scope.data.toDate).year($scope.data.chartCompare.val).format("YYYY-MM-DD");
            if($scope.data.chartType.val == "hour") {
                from = from + " 00";
                to = to + " 24";
                compareFrom = compareFrom + " 00";
                compareTo = compareTo + " 24";
            } else {
                from = moment($scope.data.fromDate).format($scope.data.chartType.paramFmt);
                to = moment($scope.data.toDate).format($scope.data.chartType.paramFmt);
                compareFrom = moment($scope.data.compareFromDate).format($scope.data.chartType.paramFmt);
                compareTo = moment($scope.data.compareToDate).format($scope.data.chartType.paramFmt);
            }
            return {
                from: from,
                to: to,
                compareFrom: compareFrom,
                compareTo: compareTo,
            }
        }
        // 修改选择周期
        $scope.changeDisplayType = function() {
            if($scope.data.chartType.val == "hour") {
                $scope.data.fromDate = moment().format("YYYY-MM-DD");
                $scope.data.toDate = moment().format("YYYY-MM-DD");
            } else if($scope.data.chartType.val == "day") {
                $scope.data.fromDate = moment().startOf('month').format("YYYY-MM-DD");
                $scope.data.toDate = moment().format("YYYY-MM-DD");
            } else if($scope.data.chartType.val == "month") {
                $scope.data.fromDate = moment().startOf('year').format("YYYY-MM-DD");
                $scope.data.toDate = moment().format("YYYY-MM-DD");
            } else if($scope.data.chartType.val == "year") {
                $scope.data.fromDate = moment().add(-5, 'year').format("YYYY-MM-DD");
                $scope.data.toDate = moment().format("YYYY-MM-DD");
            }
            $scope.data.showType = $scope.data.chartType.val;
        }

        // 获取图表数据
        $scope.getEnergyChartDataByType = function () {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getEnergyChartDataByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: $scope.fmtDateRange().from,
                    to: $scope.fmtDateRange().to,
                    type: $scope.data.chartType.val,
                    energyType: $scope.data.energyType,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.chartDatas = res.data;
                    summaryChartDraw($scope.data);
                    summaryChartDrawData($scope.data, "chartDatas");
                });
            });
        };

        // 获取图表对比数据
        $scope.getEnergyChartCompareDataByType = function () {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getEnergyChartDataByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: $scope.fmtDateRange().compareFrom,
                    to: $scope.fmtDateRange().compareTo,
                    type: $scope.data.chartType.val,
                    energyType: $scope.data.energyType,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.chartCompareDatas = res.data;
                    summaryChartDraw($scope.data);
                    summaryChartDrawData($scope.data, "chartCompareDatas");
                });
            });
        };

        // 获取table数据
        $scope.getEnergyTableDataByType = function () {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getEnergyTableDataByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: $scope.fmtDateRange().from,
                    to: $scope.fmtDateRange().to,
                    type: $scope.data.chartType.val,
                    energyType: $scope.data.energyType,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.tableData.title = res.data[0];
                    $scope.data.result.tableData.data = res.data.slice(1, res.data.length);
                    $scope.getSummaryData($scope.data.result.tableData);
                });
            });
        };

        $scope.getSummaryData = function(tableData) {
            var summaryDatas = [];
            tableData.title.map(function(t, ind) {
                if(t != "日期") {
                    summaryDatas.push({
                        name: t,
                        value: tableData.data.map(function(d) {
                            return d[ind];
                        }).Sum().toFixed(2),
                    });
                }
            });
            $scope.data.result.summaryDatas = summaryDatas;
        }

        // 获取数据
        $scope.getDatas = function(){
            $scope.refreshDatas();
        };

        function summaryChartDraw(data) {
            if($scope.data.summaryChartInit) {
                return ;
            }
            $scope.data.summaryChartInit = true;
            var opt = angular.copy($scope.data.option);
            opt.xAxis[0].type = 'category';
            opt.xAxis[0].data = [];
            var curFmt = $scope.data.chartType.fmt;

            var to = $scope.data.toDate;
            if($scope.data.chartType.val == "hour") {
                to = $scope.data.toDate + " 24";
            } else {
                to = moment($scope.data.toDate).format($scope.data.chartType.paramFmt);
            }

            // 生成x轴内容
            var xlen = Math.ceil(moment(moment(to).format($scope.data.chartType.fmt)).diff(moment($scope.data.fromDate).format($scope.data.chartType.fmt), $scope.data.chartType.val+'s', true));
            for(var i=0; i<=xlen; i++) {
                opt.xAxis[0].data.push(moment($scope.data.fromDate).add($scope.data.chartType.val+'s', i).format($scope.data.chartType.xAxisFmt));
            }
            console.log(opt);
            $scope.summaryChart.setOption(opt, true);
            $scope.summaryChart.resize();
        };

        function summaryChartDrawData(data, dataKey) {
            var opt = $scope.summaryChart.getOption();
            var xlen = opt.xAxis[0].data.length;
            var name = dataKey == "chartDatas" ? '电量' : $scope.data.chartCompare.val+"电量";
            var seriesInd = dataKey == "chartDatas" ? 0 : 1;
            var type = dataKey == "chartDatas" ? "bar" : "line";
            for(var o in data.result[dataKey]) {
                var sd = [];
                for(var i=0; i<=xlen; i++) {
                    sd.push(0);
                }
                var d = data.result[dataKey][o];
                opt.legend[0].data.push(name);
                if(d.datas) {
                    d.datas.map(function (k) {
                        var ind = opt.xAxis[0].data.indexOf(moment(k[d.key]).format($scope.data.chartType.xAxisFmt));
                        sd[ind] = parseFloat(k[d.val]).toFixed(4);
                    });
                }
                var tempSeries = {
                    name: name,
                    type: type,
                    //stack: "总量",
                    barWidth:"40%",
                    data: sd
                };
                opt.series[seriesInd] = tempSeries;
            }
            console.log(opt);
            $scope.summaryChart.setOption(opt, true);
            $scope.summaryChart.resize();
        }

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