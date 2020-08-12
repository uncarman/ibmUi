define(function (require) {
    var app = require('../../js/app');

    app.controller('energyDetailCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
        var settings = require('comm').settings;
        var global = require('comm').global;
        var feather = require('feather');
        var echarts = require('echarts');
        var moment = require('moment');

        window.echarts = echarts;
        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func($scope, $state, $stateParams);    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function() {
            global.on_loaded_func($scope, $state, $stateParams);    // 显示页面内容

            $scope.dailyChart = echarts.init(document.getElementById("dailyChart"));
            $scope.summaryPieChart = echarts.init(document.getElementById("summaryPieChart"));

            $scope.data.chartType = $scope.data.chartTypes.filter(function(t){
                return t.val == $scope.data.showType;
            })[0];
            
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
            fromDate: moment().startOf("month").format("YYYY-MM-DD"),
            toDate: moment().format("YYYY-MM-DD"),
            todayStr:moment().format("YYYY-MM-DD"),
            
            // showType ->  hour/day/month/year
            // energyType -> 01/02/03/04
            // energySubType -> 能耗分项/建筑区域/组织机构
            showType: $stateParams.showType, // 
            energyType: $stateParams.energyType, //
            subType: $stateParams.subType, //
            itemType: parseInt($stateParams.energyType) + 10, // 表对应的dateType
            parent: $stateParams.parent, // 分类ID
            energyMenu: $stateParams.energyMenu || "energyDetail",

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
                summaryTotal: [],
                chartDatas: {},
                tableData: {},

                itemGroups: [],
                itemList: [],
            },

            // 国际平均值
            internationalValues: {
                "01": 0.0015,
                "02": 0.0015,
                "03": 0.0015,
                "04": 0.0015,
                "05": 0.0015,
            },

            hasChilds : true,
            lineOpt: settings.defaultLineOpt,
            pieOpt: settings.defaultPieOpt,
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
                    parent: $scope.data.result.itemGroups.length > 0 ? $scope.data.result.itemGroups[0].parent : null, // 默认大类
                    itemIds: $scope.data.itemSelected.map(function(it) {
                        return it.id;
                    }).join(","),
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
                    parent: $scope.data.result.itemGroups.length > 0 ? $scope.data.result.itemGroups[0].parent : null, // 默认大类
                    itemIds: $scope.data.itemSelected.map(function(it) {
                        return it.id;
                    }).join(","),
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
                if(t != "日期" && t.indexOf("密度") < 0) {
                    summaryDatas.push({
                        name: t,
                        value: tableData.data.map(function(d) {
                            return parseFloat(d[ind]);
                        }).Sum().toFixed(2),
                    });
                }
            });
            $scope.data.result.summaryDatas = summaryDatas;
        }

        // 获取设备列表
        $scope.getBuildingItems = function(callback) {
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
                    $scope.data.result.itemGroups = $scope.fmtItemGroups(res.data);
                    // 默认全部选中
                    $scope.data.result.itemGroups.map(function(ig) {
                        $scope.changeItemGroup(ig);
                    });
                    if(typeof callback == "function") {
                        callback();
                    }
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
        $scope.fmtItemGroups = function(list) {
            var tmp = [];
            // 排列好父子关系
            list.map(function(g) {
                if(!g.parent || g.parent == "") {
                    g.childs = [];
                    tmp.push(g);
                }
            });
            tmp.map(function(t) {
                list.map(function(g) {
                    if(g.parent == t.id) {
                        g.childs = [];
                        t.childs.push(g);
                    }
                });
            });
            tmp.map(function(_t) {
                _t.childs.map(function(t) {
                    list.map(function(g) {
                        if(g.parent == t.id) {
                            g.childs = [];
                            t.childs.push(g);
                        }
                    });
                });
            });
            // 筛选出当前大类
            var cp = tmp.filter(function(g) {
                return g.code.slice(0,2) == $scope.data.energyType && g.type == $scope.data.subType;
            })[0];
            console.log(cp);
            return cp && cp.hasOwnProperty("childs") ? cp.childs : [];
        }

        // 根据选中的groupIds,获取对应设备
        $scope.getSelectedItemsByGroupIds = function(callback) {
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetItemsByGroupIds,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    groupIds: $scope.data.groupSelected.map(function(g){
                        return g.id;
                    }).join(","),
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.data.itemSelected = res.data;
                if(typeof callback == "function") {
                    callback();
                }
            });
        }

        // 获取数据
        $scope.getDatas = function(){
            // 获取设备相关数据
            $scope.getBuildingItems(function() {
                $scope.refreshDatas();
            });
        };

        function summaryPieDraw() {
            var opt = angular.copy($scope.data.pieOpt);
            var legend_data = [];

            for(i in $scope.data.result.chartDatas) {
                var d = $scope.data.result.chartDatas[i];
                opt.legend[0].data.push(d["name"]);
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

            // // 添加国际值线
            // legend_data.push("国际值");
            // opt.series.push({
            //     name: "国际值",
            //     type: "line",
            //     symbol: 'none',
            //     itemStyle: {normal: {lineStyle: {type: 'dotted'}}},
            //     data: fmtEChartData(opt.xAxis[0].data, {data: []}, undefined, $scope.data.internationalValues[$scope.data.type]),
            //     z: 100,  // 显示在最顶层
            // });
            opt.legend.data = legend_data;
            console.log("dailyChartDraw", opt);
            global.drawEChart($scope.dailyChart, opt);
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

        // 分项选择
        $scope.changeItemGroup = function(item, subItem) {
            if(subItem) {
                // 选择子项
                var ind = $scope.data.groupSelected.indexOf(subItem);
                if(ind >=0) {
                    $scope.data.groupSelected.splice(ind,1);
                } else {
                    $scope.data.groupSelected.push(subItem);
                }
            } else {
                // 选择总项
                var ind = $scope.data.groupSelected.indexOf(item);
                if(ind >= 0) {
                    $scope.data.groupSelected.splice(ind,1);
                    $scope.data.groupSelected.map(function(sit, i) {
                        if(sit.parent == item.id) {
                            delete $scope.data.groupSelected[i];
                        }
                    });
                } else {
                    $scope.data.groupSelected.push(item);
                    item.childs.map(function(sit) {
                        var i = $scope.data.groupSelected.indexOf(sit);
                        if( i < 0) {
                            $scope.data.groupSelected.push(sit);
                        }
                    });
                }
                $scope.data.groupSelected = $scope.data.groupSelected.notEmpty();
            }
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
            $scope.getSelectedItemsByGroupIds(function() {
                // 获取图表数据
                $scope.getEnergyChartDataByType();
                // 获取table数据
                $scope.getEnergyTableDataByType();
            });
        };

        // 切换大类
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