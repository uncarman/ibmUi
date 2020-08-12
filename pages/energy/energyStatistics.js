define(function (require) {
    var app = require('../../js/app');

    app.controller('energyStatisticsCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
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
            
            // 画图表
            $scope.summaryChart = echarts.init(document.getElementById("summaryChart"));

            $scope.data.chartType = $scope.data.chartTypes.filter(function(t){
                return t.val == $scope.data.showType;
            })[0];

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

            fmt: "YYYY-MM",
            
            fromDate: moment().add(-1, 'year').format("YYYY-MM"),
            toDate: moment().format("YYYY-MM"),

            // showType ->  hour/day/month/year
            // energyType -> 01/02/03/04
            // energySubType -> 能耗分项/建筑区域/组织机构
            showType: $stateParams.showType, // 
            typeNames: settings.typeNames,
            energyMenu: $stateParams.energyMenu || "energyStatistics",

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
                summaryDatas: {},
                chartDatas: {},
                tableData: {},
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
                compareFrom = moment(compareFrom).format($scope.data.chartType.paramFmt);
                compareTo = moment(compareTo).format($scope.data.chartType.paramFmt);
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

        // 获取汇总数据
        $scope.getBuildingSummaryTotalData = function () {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getBuildingSummaryTotalData,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function () {
                    $scope.data.result.summaryDatas = global.filterEnergyDatas(res.data, $scope.data.typeNames);
                });
            });
        };

        // 获取图表数据
        $scope.getBuildingChartDataByType = function () {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getBuildingChartDataByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: $scope.data.fromDate,
                    to: $scope.data.toDate,
                    type: $scope.data.showType,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function () {
                    $scope.data.result.chartDatas = res.data;
                    summaryChartDraw($scope.data);
                });
            });
        };

        // 获取table数据
        $scope.getBuildingTableDataByType = function() {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.getBuildingTableDataByType,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: $scope.data.fromDate,
                    to: $scope.data.toDate,
                    type: $scope.data.showType,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function () {
                    $scope.data.result.tableData.title = global.filterEnergyTitle(res.data[0], $scope.data.typeNames);
                    $scope.data.result.tableData.data = res.data.slice(1, res.data.length);
                });
            });
        };

        // 获取数据
        $scope.getDatas = function () {
            $scope.getBuildingSummaryTotalData();
            $scope.getBuildingChartDataByType();
            $scope.getBuildingTableDataByType();
        };

        function summaryChartDraw(data) {
            var opt = angular.copy($scope.data.option);
            var dateType = $scope.data.showType+"s";
            opt.xAxis[0].type = "category"; // 修改x轴
            // 生成x轴内容
            var xlen = Math.ceil(moment(moment($scope.data.toDate).format($scope.data.fmt)).diff(moment($scope.data.fromDate).format($scope.data.fmt), dateType, true));
            xlen = Math.min(10000, xlen); // 防止浏览器蹦了
            for(var i=0; i<=xlen; i++) {
                opt.xAxis[0].data.push(moment($scope.data.fromDate).add(dateType, i).format($scope.data.fmt));
            }

            for(var o in data.result.chartDatas) {
                var sd = [];
                for(var i=0; i<=xlen; i++) {
                    sd.push(0);
                }
                var d = data.result.chartDatas[o];
                // 判断前端显示能耗种类
                if(Object.keys($scope.data.typeNames).indexOf(o) >= 0) {
                    opt.legend[0].data.push(d.name);

                    d.datas.map(function (k) {
                        var ind = opt.xAxis[0].data.indexOf(moment(k[d.key]).format($scope.data.fmt));
                        sd[ind] = parseFloat(k[d.val]).toFixed(4);
                    });

                    var tempSeries = {
                        name: d.name,
                        type: "bar",
                        stack: "总量",
                        barWidth: "40%",
                        data: sd
                    };
                    opt.series.push(tempSeries);
                }
            }
            console.log(opt);
            $scope.summaryChart.setOption(opt, true);
            $scope.summaryChart.resize();
        };
    }]);

});
