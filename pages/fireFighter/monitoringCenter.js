define(function(require) {
    var app = require('../../js/app');
    app.controller('monitoringCenterCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
        var settings = require('comm').settings;
        var global = require('comm').global;
        var feather = require('feather');
        var echarts = require('echarts');
        var moment = require('moment');

        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func(); // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function() {
            global.on_loaded_func($scope, $state, $stateParams); // 显示页面内容

            $scope.abnormalChart = echarts.init(document.getElementById("abnormalChart"));
            $scope.fireSystem1 = echarts.init(document.getElementById("fireSystem1"));
            $scope.fireSystem2 = echarts.init(document.getElementById("fireSystem2"));
            $scope.fireSystem3 = echarts.init(document.getElementById("fireSystem3"));

            $scope.getDatas();
        });

        $scope.data = {
            user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),

            pageTitle: settings.pageTitle,
            headLeft: "安全·舒适·节能",
            headRight: moment().format("YYYY-MM-DD dddd"),

            category: $stateParams.category, //资源类别
            type: $stateParams.type, //资源子类
            fireMenu: $stateParams.fireMenu,
            itemType: "22", // 设备类别, 22 =消防相关
            map: null, //地图

            personList: [],  // 楼宇负责人列表
            itemWarningList: [], // 设备预警列表
            itemWarningTodayList: [], // 最新列表
            itemWarningSummary: {
                todayFire: {    // 今日火警 tags include "火灾"
                    new: 0, // 待处理
                    deal: 0, // 已完成
                    timeout: 0, // 已超时, update - report 大于4小时
                },
                todayError: {    // 今日故障 severity = 严重
                    new: 0, // 待处理
                    deal: 0, // 已完成
                    timeout: 0, // 已超时, update - report 大于1天
                },
                todayWarning: {    // 今日隐患 severity = 一般
                    new: 0, // 待处理
                    deal: 0, // 已完成
                    timeout: 0, // 已超时, update - report 大于1天
                },
            }, // 设备预警汇总
            itemList: [], // 设备列表
            itemListSummary: { // 设备汇总
                fire: {
                    total: 0,
                    warning: 0,
                    error: 0,
                    offline: 0,
                },
                water: {
                    total: 0,
                    warning: 0,
                    error: 0,
                    offline: 0,
                },
                other:{
                    total: 0,
                    warning: 0,
                    error: 0,
                    offline: 0,
                },
            }, // 设备汇总
            itemListTypes: {},  // 设备分类列表
            curItemListType: "", // 选中分类

        }
        
        $scope.getDatas = function() {
            // 负责人列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetFirePersonList,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.personList = res.data;
                });
            });

            // 设备列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetItemListByTypes,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    typeIds: $scope.data.itemType,
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.itemList = res.data;
                    var its = {
                        fire: {
                            total: 0,
                            warning: 0,
                            error: 0,
                            offline: 0,
                        },
                        water: {
                            total: 0,
                            warning: 0,
                            error: 0,
                            offline: 0,
                        },
                        other:{
                            total: 0,
                            warning: 0,
                            error: 0,
                            offline: 0,
                        },
                    };
                    // 生成设备汇总
                    res.data.map(function(it) {
                        if(it.itemTypeTags && it.itemTypeTags.indexOf("火灾") >= 0) {
                            its.fire.total += 1;
                            if(its.stateStr && its.stateStr == "离线") {
                                its.fire.offline += 1;
                            } else if(its.stateStr && its.stateStr == "故障") {
                                its.fire.error += 1;
                            } else if(its.stateStr && its.stateStr == "预警") {
                                its.fire.error += 1;
                            }
                        } else if(it.itemTypeTags && it.itemTypeTags.indexOf("消防水柜") >= 0) {
                            its.water.total += 1;
                            if(its.stateStr && its.stateStr == "离线") {
                                its.water.offline += 1;
                            } else if(its.stateStr && its.stateStr == "故障") {
                                its.water.error += 1;
                            } else if(its.stateStr && its.stateStr == "预警") {
                                its.water.error += 1;
                            }
                        } else {
                            its.other.total += 1;
                            if(its.stateStr && its.stateStr == "离线") {
                                its.other.offline += 1;
                            } else if(its.stateStr && its.stateStr == "故障") {
                                its.other.error += 1;
                            } else if(its.stateStr && its.stateStr == "预警") {
                                its.other.error += 1;
                            }
                        }
                    });
                    $scope.data.itemListSummary = its;

                    // 系统
                    var fireScore = (1-(its.fire.warning+its.fire.error+its.fire.offline)/its.fire.total)*100;
                    var system_opt_1 = systemOption(fireScore?fireScore:0);
                    drawEChart($scope.fireSystem1, system_opt_1);
                    
                    var waterScore = (1-(its.water.warning+its.water.error+its.water.offline)/its.water.total)*100;
                    var system_opt_2 = systemOption(otherScore?otherScore:0);
                    drawEChart($scope.fireSystem2, system_opt_2);
                    
                    var otherScore = (1-(its.other.warning+its.other.error+its.other.offline)/its.other.total)*100;
                    var system_opt_3 = systemOption(otherScore?otherScore:0);
                    drawEChart($scope.fireSystem3, system_opt_3);

                });
            });

            // 设备报警列表
            var param = {
                _method: 'post',
                _url: settings.ajax_func.ajaxGetItemWarningList,
                _param: {
                    buildingId: $scope.data.curBuilding.id,
                    from: moment().add("months", -4).format("YYYY-MM-DD"),
                }
            };
            global.ajax_data($scope, param, function (res) {
                $scope.$apply(function(){
                    $scope.data.itemWarningList = res.data;
                    var ws = { // 重置一下数据
                        todayFire: {    // 今日火警 tags include "火灾"
                            new: 0, // 待处理
                            deal: 0, // 已完成
                            timeout: 0, // 已超时, update - report 大于4小时
                        },
                        todayError: {    // 今日故障 severity = 严重
                            new: 0, // 待处理
                            deal: 0, // 已完成
                            timeout: 0, // 已超时, update - report 大于1天
                        },
                        todayWarning: {    // 今日隐患 severity = 一般
                            new: 0, // 待处理
                            deal: 0, // 已完成
                            timeout: 0, // 已超时, update - report 大于1天
                        },
                    };
                    $scope.data.itemWarningTodayList = [];
                    var today = moment().format("YYYY-MM-DD");
                    res.data.map(function(w) {
                        if(w.date == today) {
                            $scope.data.itemWarningTodayList.push(w);
                            if(w.itemTypeTags && w.itemTypeTags.indexOf("火灾") >= 0) {
                                ws.todayFire.new += 1;
                                if(w.hasFixed > 0 || w.flowStatus > 0) {
                                    ws.todayFire.deal += 1;
                                }
                                if(w.hasFixed == 0 && w.flowStatus == 0 && moment(w.updatedAt).diff(moment(w.reportedAt), 'hours') >= 4) {
                                    ws.todayFire.timeout += 1;
                                }
                            }
                            if(w.severity == "严重") {
                                ws.todayError.new += 1;
                                if(w.hasFixed > 0 || w.flowStatus > 0) {
                                    ws.todayError.deal += 1;
                                }
                                if(w.hasFixed == 0 && w.flowStatus == 0 && moment(w.updatedAt).diff(moment(w.reportedAt), 'hours') >= 4) {
                                    ws.todayError.timeout += 1;
                                }
                            } else if(w.severity == "一般") {
                                ws.todayWarning.new += 1;
                                if(w.hasFixed > 0 || w.flowStatus > 0) {
                                    ws.todayWarning.deal += 1;
                                }
                                if(w.hasFixed == 0 && w.flowStatus == 0 && moment(w.updatedAt).diff(moment(w.reportedAt), 'hours') >= 4) {
                                    ws.todayWarning.timeout += 1;
                                }
                            }
                        }
                    });
                    console.log(ws);
                    $scope.data.itemWarningSummary = ws;

                    setTimeout(function() {
                        // 顶部滚动
                        ScrollImgLeft($("#scrollSlider"), 50);
                    }, 500);

                    // 异常数据图表
                    var opt = copy(settings.defaultLineOpt);
                    var category = [];
                    var categoryMap = {
                        "通用": [0,0,0,0,0],
                        "火灾报警": [0,0,0,0,0],
                        "消防水柜": [0,0,0,0,0],
                    };
                    for(var i = 4; i >= 0; i--) {
                        var m = moment().add("month", -i).format("MM");
                        category.push(m);
                    }
                    opt.grid = {
                        top: '20%',
                        right: "5%",
                        left: "10%",
                        bottom: "20%",
                    }
                    opt.legend = {
                        right: 0,
                        data: ['通用', '火灾报警', '消防水柜'],
                        textStyle: {
                            color: '#3CE7DA'
                        }
                    }
                    opt.xAxis[0].type = "category";
                    opt.xAxis[0].data = category;
                    opt.xAxis[0].axisLabel = {
                        interval: 0,
                        fontSize: 12,
                        color: '#3CE7DA',
                        fontWeight: '400',
                    };
                    opt.series = [];
                    res.data.map(function(w) {
                        if(w.itemTypeTags && w.itemTypeTags.indexOf("火灾") >= 0) {
                            categoryMap['火灾报警'][5 - moment().diff(moment(w.reportedAt),"month")] += 1;
                            return;
                        }
                        if(w.itemTypeTags && w.itemTypeTags.indexOf("消防水柜") >= 0) {
                            categoryMap['消防水柜'][5 - moment().diff(moment(w.reportedAt),"month")] += 1;
                            return;
                        }
                        categoryMap['通用'][5 - moment().diff(moment(w.reportedAt),"month")] += 1;
                    });
                    console.log(categoryMap);
                    Object.keys(categoryMap).map(function(c) {
                        opt.series.push({
                            name: c,
                            type: "bar",
                            barWidth: "40%",
                            data: categoryMap[c],
                        });
                    });
                    // {
                    //     name: '5月',
                    //     type: 'bar',
                    //     data: [43.3, 85.8, 93.7, 43.3, 85.8, 93.7],
                    // }
                    console.log(opt);
                    drawEChart($scope.abnormalChart, opt);
                });
            });
        }

        function copy(obj) {
            var newObj = obj;
            if (obj && typeof obj === "object") {
                newObj = Object.prototype.toString.call(obj) === "[object Array]" ? [] : {};
                for (var i in obj) {
                    newObj[i] = copy(obj[i]);
                }
            }
            return newObj;
        }

        // 绘制图表
        function drawEChart(echart, opt) {
            echart.setOption(opt, true);
            echart.resize();
        }
        // 环形图表配置
        function systemOption(num) {
            return {
                color: ['#3CE7DA', '#DDDDDD'],
                title: {
                    show: true,
                    text: num,
                    x: 'center',
                    y: 'center',
                    textStyle: {
                        fontSize: '28',
                        color: '#3CE7DA',
                        fontWeight: 'normal'
                    }
                },
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    show: false
                },
                series: {
                    type: 'pie',
                    radius: ['75%', '90%'],
                    avoidLabelOverlap: true,
                    hoverAnimation: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: [num, 100 - num]
                }
            }
        }

    }]);

});
