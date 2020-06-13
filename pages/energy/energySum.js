define(function (require) {
    var app = require('../../js/app');
    var feather = require('feather');
    var moment = require('moment');
    var echarts = require('echarts');

    app.controller('energySumCtrl', function($scope) {
        window.echarts = echarts;
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

            // 初始化日期控件
            $($scope.data.datePickerDom).datepicker({
                autoclose: true,
                todayHighlight: true,
                language: "zh-CN",
                format: "yyyy-mm-dd"
            });
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
            // 更新时间选择
            if($scope.data.showType == "hour") {
                $scope.data.fromDate = $scope.data.toDate;
            }
            $scope.$apply(function () {
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
            });
            $scope.getDatas();
        }, 0);

        $scope.data = {
            user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),

            pageTitle: settings.pageTitle,
            headLeft: "安全·舒适·节能",
            headRight: moment().format("YYYY-MM-DD dddd"),

            fmt: "YYYY-MM-DD",
            datePickerDom: ".datePicker",
            fromDate: moment().add(-30, 'day').format("YYYY-MM-DD"),
            toDate: moment().format("YYYY-MM-DD"),
            todayStr:moment().format("YYYY-MM-DD"),
            
            // showType ->  hour/day/month/year
            // energyType -> 01/02/03/04
            // energySubType -> 能耗分项/建筑区域/组织机构

            showType: global.request("dt"), // 
            energyType: global.request("et"), //

            itemType: parseInt(global.request("et")) + 10, // 表对应的dateType

            chartTypes: settings.defaultDateTypes,
            chartCompares: [],
            query: {},
            chartType: null,  // 默认按天
            chartCompare: null,  // 默认上一年度

            viewType: "all",  // 是查看总计，还是选设备看汇总
            itemSelected: [],

            result:{
                summaryDatas: [],
                chartDatas: {},
                tableData: {},

                itemGroups: [],
                itemList: [],
            },
            option: settings.defaultLineOpt,
        }


        // 获取图表数据
        $scope.getEnergyChartDataByType = function () {
            var to = $scope.data.toDate
            if($scope.data.chartType.val == "hour") {
                to = $scope.data.toDate + " 24";
            } else {
                to = moment($scope.data.toDate).format($scope.data.chartType.paramFmt);
            }
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getEnergyChartDataByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: moment($scope.data.fromDate).format($scope.data.chartType.paramFmt), // $scope.data.fromDate,
                    to: to,   // $scope.data.toDate,
                    type: $scope.data.chartType.val,
                    energyType: $scope.data.energyType,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.chartDatas = res.data;
                    summaryChartDraw($scope.data);
                });
            });
        };

        // 获取table数据
        $scope.getEnergyTableDataByType = function () {
            var to = $scope.data.toDate
            if($scope.data.chartType.val == "hour") {
                to = $scope.data.toDate + " 24";
            } else {
                to = moment($scope.data.toDate).format($scope.data.chartType.paramFmt);
            }
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getEnergyTableDataByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: moment($scope.data.fromDate).format($scope.data.chartType.paramFmt), // $scope.data.fromDate,
                    to: to,   // $scope.data.toDate,
                    type: $scope.data.chartType.val,
                    energyType: $scope.data.energyType,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.tableData.title = res.data[0];
                    $scope.data.result.tableData.data = res.data.slice(1, res.data.length);
                });
            });
        };

        // 获取设备列表
        $scope.getBuildingItems = function() {
            // 设备分组
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetItemGroups,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.itemGroups = res.data;
                });
            });

            // 设备列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetBuildingItems,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.result.itemList = res.data;
                });
            });
        }

        // 【多个设备】按【时/日/月/年】汇总数据
        $scope.getItemDatasByDate = function () {
            var to = $scope.data.toDate
            if($scope.data.chartType.val == "hour") {
                to = $scope.data.toDate + " 24";
            } else {
                to = moment($scope.data.toDate).format($scope.data.chartType.paramFmt);
            }
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getItemDatasByDate,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: moment($scope.data.fromDate).format($scope.data.chartType.paramFmt), // $scope.data.fromDate,
                    to: to,   // $scope.data.toDate,
                    type: $scope.data.chartType.val,
                    itemIds: $scope.data.itemSelected.map(function(it) { return it.id; }).join(","),
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    if($scope.data.result.chartDatas.hasOwnProperty($scope.data.energyType)) {
                        $scope.data.result.chartDatas[$scope.data.energyType].datas = res.data;
                    } else {
                        MyAlert("数据加载失败，请稍后重试。");
                    }
                    summaryChartDraw($scope.data);
                    fmtTableWithBaseData($scope.data.result.chartDatas[$scope.data.energyType]);
                });
            });
        };

        // 获取数据
        $scope.getDatas = function(){
            $scope.refreshDatas();
            // 获取设备相关数据
            $scope.getBuildingItems();
        };

        // 画图表
        $scope.summaryChart = echarts.init(document.getElementById("summaryChart"));

        function summaryChartDraw(data) {
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

            for(var o in data.result.chartDatas) {
                var sd = [];
                for(var i=0; i<=xlen; i++) {
                    sd.push(0);
                }
                var d = data.result.chartDatas[o];
                opt.legend.data.push(d.name);
                if(d.datas) {
                    d.datas.map(function (k) {
                        var ind = opt.xAxis[0].data.indexOf(moment(k[d.key]).format($scope.data.chartType.xAxisFmt));
                        sd[ind] = parseFloat(k[d.val]).toFixed(4);
                    });
                }

                var tempSeries = {
                    name: d.name,
                    type: "bar",
                    stack: "总量",
                    barWidth:"40%",
                    data: sd
                };
                opt.series.push(tempSeries);
            }
            console.log(opt);
            $scope.summaryChart.setOption(opt, true);
            $scope.summaryChart.resize();
        };

        // 基于图表数据，生成简单的table
        function fmtTableWithBaseData(data) {
            $scope.data.result.tableData.title = ["时间", data.name];
            $scope.data.result.tableData.data = data.datas.map(function(d){
                return [d[data.key], d[data.val]];
            });
        }

        // 点击选中设备
        $scope.doSelect = function(item) {
            var ind = $scope.data.itemSelected.indexOf(item);
            if( ind >=0 ) {
                $scope.data.itemSelected.splice(ind,1);
            } else {
                $scope.data.itemSelected.push(item);
            }
        }

        // 点击按刷新页面
        $scope.refreshDatas = function () {
            // 查看选中设备模式
            if($scope.data.itemSelected.length > 0) {
                $scope.getItemDatasByDate();
                // $scope.getEnergyTableDataByType();
            } else {
                $scope.getEnergyChartDataByType();
                $scope.getEnergyTableDataByType();
            }
        };

        // 点击跳转
        $scope.gotoPage = function (et) {
            var query = "dt="+$scope.data.showType+"&et="+et;
            $scope.goto("energySum", query);
        };
    });

});