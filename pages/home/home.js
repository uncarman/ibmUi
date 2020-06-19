define(function (require) {
    var app = require('../../js/app');
    var feather = require('feather');
    var moment = require('moment');
    var echarts = require('echarts');

    app.controller('homeCtrl', ['$scope', function($scope) {
        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func();    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function() {
            feather.replace();
            global.on_loaded_func($scope);    // 显示页面内容
        });

        var refreshInterval = 5*60*1000; // N 分钟刷新所有电站数据
        var startDay = "2020-03-24"; // 安全运行天数
        var videos = [
            "./video.html?out_door01.mp4",
            "./video.html?1f_elevator01.mp4",
            "./video.html?under_floor_door01.mp4",
            "./video.html?distribution_room01.mp4",
            "http://192.168.151.163:9435/FmVideo.html?channel=0&ip=192.168.1.140",
            "http://192.168.151.163:9435/FmVideo.html?channel=1&ip=192.168.1.141",
            "http://192.168.151.163:9435/FmVideo.html?channel=2&ip=192.168.1.142",
            "http://192.168.151.163:9435/FmVideo.html?channel=3&ip=192.168.1.143",
            "http://192.168.151.163:9435/FmVideo.html?channel=6&ip=192.168.1.7",
            "http://192.168.151.163:9435/FmVideo.html?channel=7&ip=192.168.1.8",
            "http://192.168.151.163:9435/FmVideo.html?channel=8&ip=192.168.1.9",
            "http://192.168.151.163:9435/FmVideo.html?channel=10&ip=192.168.1.11",
            "http://192.168.151.163:9435/FmVideo.html?channel=20&ip=192.168.1.19",
            "http://192.168.151.163:9435/FmVideo.html?channel=11&ip=192.168.1.18",
        ];

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

            videoInd : 0,
            videos: videos.slice(0, 2),

            totalPerson: 3523,
            totalArea: 56,

            totalElec: 0, // 左上
            totalElecAvgArea: 0,
            totalElecAvgPerson: 0,
            totalWater: 0,
            totalWaterAvgArea: 0,
            totalWaterAvgPerson: 0,
            
            totalElecDay: 0, // 中间大字
            totalElecMonth: 0,

            visitorByDay: 56,  // 右上 日访客
            visitorByMonth: 3523,  // 月访客

            // 设备
            smokeDetector: {
                online: 120,
                closed: 12,
                error: 0,
            },
            light: {
                online: 120,
                closed: 12,
                error: 0,
            },
            camera: {
                online: 10,
                closed: 2,
                error: 0,
            },
            elevator: {
                online: 3,
                closed: 0,
                error: 0,
            },
            xfsy: { // 消防水压
                online: 3,
                closed: 0,
                error: 0,
            },
            xfs: { // 消防栓
                online: 12,
                closed: 0,
                error: 0,
            },
            mhq: { //  灭火器
                online: 213,
                closed: 0,
                error: 0,
            },
        };

        $scope.changeBuilding = function(building) {
            $scope.datas.curBuilding = building;
            global.set_storage_key('session', [
                {
                    key: 'building',
                    val: building,
                }
            ]);
        };

        $scope.doLogout = function () {
            global.do_logout();
            window.location.href = "/login.html";
        };

        function refreshDatas(){
            // 天气相关
            $scope.getLocalWeather();
            $scope.getLocalAirPm();

            // 嘉兴照明，空调等
            $scope.getDevices()
                .then(function(data) {
                    console.log(data);
                    $scope.fmtDevice(data);
                }).catch(function(data){
                    // alert("电站暂无数据 refreshDatas:"+data.sub_msg);
                    alert("暂无数据，调试中...");
                });
            // 电梯等
            $scope.getOtherDevices()
                .then(function(data) {
                    console.log(data);
                    $scope.fmtOtherDevice(data);
                }).catch(function(data){
                    // alert("电站暂无数据 refreshDatas:"+data.sub_msg);
                    alert("暂无数据，调试中...");
                });
            // 大楼相关数据
            $scope.getEnergyData()
                .then(function(data) {
                    console.log(data);
                    $scope.fmtEnergyData(data);
                }).catch(function(data){
                    // alert("电站暂无数据 refreshDatas:"+data.sub_msg);
                    alert("暂无数据，调试中...");
                });
            // 火警列表数据
            $scope.getWarningData()
                .then(function(data) {
                    console.log(data);
                    $scope.fmtWarningData(data);
                }).catch(function(data){
                    // alert("电站暂无数据 refreshDatas:"+data.sub_msg);
                    alert("暂无数据，调试中...");
                });
        }

        // 根据浏览器定位当前位置, 并输出天气情况
        $scope.getLocalWeather = function(){
            var key = "alicityweather_forecast24hours_"+$scope.data.cityId;
            var casheValue = global.getLocalObject(key);
            if(!_getWeather(casheValue)) {
                jQuery.ajax({
                    url: "http://aliv18.data.moji.com/whapi/json/alicityweather/forecast24hours",
                    method: "post",
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader("Authorization", "APPCODE "+$scope.data.AppCode);
                        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
                    },
                    data: {
                        cityId: $scope.data.cityId,
                    },
                    success: function(data) {
                        try {
                            data = JSON.parse(data);
                        } catch(e) {
                            // pass
                        }
                        global.setLocalObject(key, data, 12*60*60*1000);
                        $scope.$apply(function() {
                            _getWeather(data);
                        });
                    }, 
                    error: function(data) {
                        console.log(data);
                    }
                });
            }
        };

        function _getWeather(data) {
            if(!data) {
                return data;
            };
            var curData = null;
            var now = moment().format("YYYY-MM-DD H");
            data.data.hourly.map(d => {
                if(now == d.date+" "+d.hour) {
                    curData = d;
                }
            });

            if(curData) {
                for(let o in settings.WEATHER) {
                    if(settings.WEATHER[o].text == curData.condition) {
                        $scope.realtimeWeather = settings.WEATHER[o];
                    }
                }
                $scope.realtimeWeather_weather = curData.condition;
                $scope.realtimeWeather_city = data.data.city.name;
                $scope.realtimeWeather_tp = curData.temp;
                return true;
            }
            return false;
        }

        $scope.getLocalAirPm = function(){
            var key = "alicityweather_aqi_"+$scope.data.cityId;
            var casheValue = global.getLocalObject(key);
            if(!casheValue) {
                jQuery.ajax({
                    url: "http://aliv18.data.moji.com/whapi/json/alicityweather/aqi",
                    method: "post",
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader("Authorization", "APPCODE "+$scope.data.AppCode);
                        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
                    },
                    data: {
                        cityId: $scope.data.cityId,
                    },
                    success: function(data) {
                        try {
                            data = JSON.parse(data);
                        } catch(e) {
                            // pass
                        }
                        global.setLocalObject(key, data, 12*60*60*1000);
                        $scope.$apply(function(){
                            $scope.realtimeWeather_airPm = data.data.aqi.pm25;
                        });
                    }, 
                    error: function(data) {
                        console.log(data);
                    }
                });
            } else {
                $scope.realtimeWeather_airPm = casheValue.data.aqi.pm25;
            }
        };

        // 能耗数据
        $scope.getEnergyData = function(dn) {
            // var param = {
            //     _method: 'get',
            //     _url: settings.ajax_func.ajaxEnergyData,
            //     _param: {
            //         buildingId: $scope.data.curBuilding.id,
            //         today: moment().format("YYYY-MM-DD")
            //     }
            // };
            // return global.return_promise($scope, param);
            return new Promise(function(resolve, reject) {
                resolve(fakeData["ajaxEnergyData"]);
            });
        };
        $scope.fmtEnergyData = function(data) {
            var res = data.result;
            $scope.$apply(function(){
                $scope.data.energyToday = res.energyToday["tt"];
                $scope.data.energyMonth = res.energyMonth["tt"];
                $scope.data.energyLastMonth = res.energyLastMonth["tt"];
                $scope.data.energyMonthBySubentry = res.energyMonthBySubentry;
                $scope.data.energyRealTimeList = res.energyRealTimeList;
                $scope.data.energyMonthList = res.energyMonthList;

                // 饼图 -- 月能耗分项
                $scope.data.energyMonthBySubentryDataList = [];
                $scope.data.energyMonthBySubentry.map(function(d) {
                    $scope.data.energyMonthBySubentryDataList.push({
                        value: d.tt,
                        name: d.name,
                    });
                });
                var opt = copy(settings.defaultPieOpt);
                opt.series[0].data = $scope.data.energyMonthBySubentryDataList;
                drawEChart($scope.chartMonthBySubentry, opt);

                // 折线图 -- 小时曲线
                // 先准备基础数据
                $scope.data.energyRealTimeDataList = [];
                $scope.data.energyRealTimeList.map(function(d){
                    $scope.data.energyRealTimeDataList.push({
                        val: d.val,
                        key: d.key.split(" ")[1],
                    });
                });
                var opt = copy(settings.defaultLineOpt);
                opt.xAxis[0].type = "category";
                opt.xAxis[0].data = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
                                    "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
                                    "20", "21", "22", "23", "24"];
                opt.xAxis[0].axisLabel = {
                    interval: 1
                };
                opt.series[0] = {
                    name:'度',
                    type:'line',
                    itemStyle: {
                        color: 'rgba(60, 231, 218, 0.75)'
                    },
                    data: [],
                };
                opt.series[0].data = fmtEChartData({
                        datas: $scope.data.energyRealTimeDataList
                    });
                console.log(JSON.stringify(opt));
                drawEChart($scope.chartRealTime, opt);
                // var opt = copy(opt);
                // opt.series[0].name = "千瓦";
                // drawEChart($scope.chartRealTime2, opt);

                // 折线图 -- 日曲线
                // 先准备基础数据
                $scope.data.energyMonthDataList = [];
                $scope.data.energyMonthList.map(function(d){
                    $scope.data.energyMonthDataList.push({
                        val: d.val,
                        key: d.key.split(" ")[0],
                    });
                });
                var opt = copy(settings.defaultLineOpt);
                // var defaultDays = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
                //                     "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
                //                     "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
                //                     "31"];
                // var days = moment().daysInMonth();
                // opt.xAxis[0].data = defaultDays.slice(0, days);
                opt.xAxis[0].type = "time";
                opt.xAxis[0].axisLabel = {
                    interval: 2
                };
                opt.series[0] = {
                    name:'度',
                    type:'line',
                    itemStyle: {
                        color: 'rgba(60, 231, 218, 0.75)'
                    },
                    data: [],
                };
                opt.series[0].data = fmtEChartData({
                        datas: $scope.data.energyMonthDataList
                    });
                console.log(JSON.stringify(opt));
                drawEChart($scope.chartMonthData, opt);
            });
        }

        // 嘉兴照明，空调
        $scope.getDevices = function() {
            // var param = {
            //     _method: 'get',
            //     _url: settings.ajax_func.ajaxDevices,
            // };
            // return global.return_promise($scope, param);
            return new Promise(function(resolve, reject) {
                resolve({
                    "code":0,
                    "msg":"",
                    "result":[],
                });
            });
        };
        $scope.fmtDevice = function(data) {
            // 摄像头
            $scope.data.camera= {
                online: 25,
                closed: 0,
                error: 0,
            };
            // 照明
            $scope.data.light = {
                online: 80,
                closed: 15,
                error: 0,
            };
            // 空调
            $scope.data.airConditioning= {
                online: 12,
                closed: 0,
                error: 0,
            };
            if(data.result.length > 0) {
                data.result.map(function(d, ind) {
                    if(d.DEVICETYPE == 1) { // 照明
                        if(d.COMMUNICATESTAUS == 1) {
                            $scope.data.light.online += 1;
                            if(d.SWITCHSTATUS == 1) {
                                $scope.data.light.opened += 1;
                            } else {
                                $scope.data.light.closed += 1;
                            }
                        } else {
                            $scope.data.light.error += 1;
                        }
                    } else if(d.DEVICETYPE == 2) { // 空调
                        if(d.COMMUNICATESTAUS == 1) {
                            $scope.data.airConditioning.online += 1;
                            if(d.SWITCHSTATUS == 1) {
                                $scope.data.airConditioning.opened += 1;
                            } else {
                                $scope.data.airConditioning.closed += 1;
                            }
                        } else {
                            $scope.data.airConditioning.error += 1;
                        }
                    }
                });
            }
            $scope.$apply(function(){
                $scope.data = $scope.data;
            });
        }

        // 嘉兴电梯等
        // {"code":0,"msg":"","result":[{"parameterType":"LCXX","code":"1#电梯楼层","infoType":"AI","valueType":"int","name":"楼层信息","id":1,"dataUpdateTime":"2020-03-27T18:22:39.000+0000","value":"14"},{"parameterType":"SXHZT","code":"1#电梯上下行","infoType":"DI","valueType":"bool","name":"上下行状态","id":2,"dataUpdateTime":"2020-03-27T18:22:43.000+0000","value":"0"},{"parameterType":"YXZT","code":"1#电梯故障","infoType":"DI","valueType":"bool","name":"运行状态","id":3,"dataUpdateTime":"2020-03-27T16:24:45.000+0000","value":"0"},{"parameterType":"LCXX","code":"2#电梯楼层","infoType":"AI","valueType":"int","name":"楼层信息","id":4,"dataUpdateTime":"2020-03-27T18:22:01.000+0000","value":"1"},{"parameterType":"YXZT","code":"2#电梯故障","infoType":"DI","valueType":"bool","name":"运行状态","id":5,"dataUpdateTime":"2020-03-27T16:24:45.000+0000","value":"0"},{"parameterType":"SXHZT","code":"2#电梯上下行","infoType":"DI","valueType":"bool","name":"上下行状态","id":6,"dataUpdateTime":"2020-03-27T18:22:16.000+0000","value":"0"},{"parameterType":"LCXX","code":"3#电梯楼层","infoType":"AI","valueType":"int","name":"楼层信息","id":7,"dataUpdateTime":"2020-03-27T18:08:31.000+0000","value":"1"},{"parameterType":"YXZT","code":"3#电梯故障","infoType":"DI","valueType":"bool","name":"运行状态","id":8,"dataUpdateTime":"2020-03-27T16:24:45.000+0000","value":"0"},{"parameterType":"SXHZT","code":"3#电梯上下行","infoType":"DI","valueType":"bool","name":"上下行状态","id":9,"dataUpdateTime":"2020-03-27T18:08:47.000+0000","value":"0"}]}
        $scope.getOtherDevices = function() {
            // var param = {
            //     _method: 'get',
            //     _url: settings.ajax_func.ajaxOtherDevices,
            // };
            // return global.return_promise($scope, param);
            return new Promise(function(resolve, reject) {
                resolve({
                    "code":0,
                    "msg":"",
                    "result":[
                        {
                            code: "109A",
                            value: 0.12,
                        },
                        {
                            code: "109C",
                            value: 0.12,
                        },
                        {
                            code: "109STA",
                            value: 1,
                        }
                    ],
                });
            });
        };
        $scope.fmtOtherDevice = function(data) {
            // 左侧设备间
            $scope.data.temp = 22;
            $scope.data.humidity = 22;
            $scope.data.leak = 0;
            $scope.data.leakClass = $scope.data.leak == 0 ? "" : "err";;
            $scope.data.leakStr = $scope.data.leak == 0 ? "正常--无渗水" : "异常--有渗水";
            
            // 中间消防
            $scope.data.fireFighting = {
                "n1Level": "正常",
                "n1Pressure": "0.513Mpa",
            };

            // 电梯
            $scope.data.elevator= {
                online: 3,
                closed: 0,
                error: 0,
            };
            if(data.result.length > 0) {
                data.result.map(function(d){
                    if(d.code.indexOf("电梯故障") >= 0) {
                        // 24小时没更新，算故障
                        if(d.value == "0" 
                            && moment().diff(moment(d.dataUpdateTime), "hours") < 24) {
                            $scope.data.elevator.online += 1;
                        } else {
                            $scope.data.elevator.error += 1;
                        }
                    }
                });
            }
            $scope.$apply(function(){
                $scope.data = $scope.data;
            });

            // 调度大楼配电房数据
            $scope.fmtDistributionRoomData(data);
        }

        // 火警列表数据
        $scope.getWarningData = function() {
            // var param = {
            //     _method: 'get',
            //     _url: _warningUrl,
            // };
            // return global.return_promise($scope, param);
            return new Promise(function(resolve, reject) {
                resolve({
                    "code":0,
                    "msg":"",
                    "data":[
                        {
                            tag: 0,
                            level: 1,
                            pointDesc: "二楼楼道东门",
                            firstTime: "2020-06-12 10:24:33",
                            zone: "二楼东",
                        }
                    ],
                });
            });
        };
        $scope.fmtWarningData = function(data) {
            // console.log(data);
            // 火警数据
            // fireId  int 火警 id
            // bid Int 建筑物 id
            // devNum  string  传感器设备号(用于显示)
            // pointDesc   string  点位描述
            // tag int 0 火警中 1 已解除
            // flowStatus  int 0 未 确认  3 被 确认  4 忽 略
            // firstTime   String  第一次上报时间(时间戳)
            // lastTime    String  最后一次上报时间(时间戳)
            // confirmTime String  火警确认时间(时间戳)
            // comment string  描述
            // zone    string  防火分区
            // level   int 火警级别(1：一级火警,2：二级火警,3：三级火警)
            // levelTime   String  火警升级时间(时间戳)
            // createTime  String  创建时间(时间戳)
            // modifyTime  String  修改时间(时间戳)
            // fireTag int 火警类型(0 正常上传 1 维保状态下上报)
            // assigner    string  操作人
            // userType    int 操作类型(0 平台 1 运维 2 客服 3  第三方)
            var list = [];
            if(data.data.length > 0) {
                data.data.map(function(w){
                    if(w.tag == "0") {  // 已处理
                        list.push({
                            level: {"1":"一级火警", "2": "二级火警", "3": "三级火警"}[w.level],
                            pointDesc: w.pointDesc,
                            firstTime: moment(w.firstTime).format('MM-DD hh:mm'),
                            zone: w.zone
                        });
                    }
                });
            }
            $scope.$apply(function(){
                $scope.data.warnings = list;
            });
        }

        // 调度大楼配电房数据
        $scope.getDistributionRoomData = function() {
            // var param = {
            //     _method: 'get',
            //     _url: settings.ajax_func.ajaxDistributionRoomData,
            // };
            // return global.return_promise($scope, param);
        };
        $scope.fmtDistributionRoomData = function(data) {
            // console.log(data);
            // 调度大楼配电房数据
            $scope.$apply(function(){
                $scope.data.distributionRoom = {
                    "sd109": "市电109线",
                    "t1kg": "1#压变",
                    "byq1": "1#变压器",
                    "llx1" : "联络1",
                    "llx2" : "联络2",
                    "byq2": "2#变压器",
                    "t2kg": "2#压变",
                    "tl743": "同乐743线",
                };
                data.result.map(function(d){
                    // 市电109线
                    if(d.code == "109A") {
                        $scope.data.distributionRoom["sd109-1a"] = d.value;
                    }
                    if(d.code == "109C") {
                        $scope.data.distributionRoom["sd109-1c"] = d.value;
                    }
                    if(d.code == "109STA") {
                        $scope.data.distributionRoom["sd109-status"] = d.value == 1 ? "合位" : "分位";
                    }

                    // 1#压变 -> 无

                    // 1#变压器
                    if(d.code == "1A") {
                        $scope.data.distributionRoom["byq1-1a"] = d.value;
                    }
                    if(d.code == "1C") {
                        $scope.data.distributionRoom["byq1-1c"] = d.value;
                    }
                    if(d.code == "1STA") {
                        $scope.data.distributionRoom["byq1-status"] = d.value == 1 ? "合位" : "分位";
                    }

                    // 联络线1
                    if(d.code == "LLA") {
                        $scope.data.distributionRoom["llx1-1a"] = d.value;
                    }
                    if(d.code == "LLC") {
                        $scope.data.distributionRoom["llx1-1c"] = d.value;
                    }
                    if(d.code == "LLSTA") {
                        $scope.data.distributionRoom["llx1-status"] = d.value == 1 ? "合位" : "分位";
                    }

                    // 2#变压器
                    if(d.code == "2A") {
                        $scope.data.distributionRoom["byq2-1a"] = d.value;
                    }
                    if(d.code == "2C") {
                        $scope.data.distributionRoom["byq2-1c"] = d.value;
                    }
                    if(d.code == "2STA") {
                        $scope.data.distributionRoom["byq2-status"] = d.value == 1 ? "合位" : "分位";
                    }

                    // 市电109线
                    if(d.code == "745A") {
                        $scope.data.distributionRoom["tl743-1a"] = d.value;
                    }
                    if(d.code == "745C") {
                        $scope.data.distributionRoom["tl743-1c"] = d.value;
                    }
                    if(d.code == "745STA") {
                        $scope.data.distributionRoom["tl743-status"] = d.value == 1 ? "合位" : "分位";
                    }
                });
            });
        }

        // 刷新实时时间
        function resetIntervalTime() {
            clearInterval($scope.timeInterval);
            $scope.timeInterval = setInterval(function () {
                let n = moment();
                $scope.$apply(function(){
                    $scope.now = n.format("YYYY-MM-DD HH:mm:ss");
                    $scope.weekDay = n.format('dddd');
                    $scope.date = n.format('MoDo');
                    $scope.time = n.format("HH:mm:ss");
                });
            }, 1000);
        }

        function resize() {
           var ratioX = $(window).width() / 2112;
           var ratioY = $(window).height() / 832;
           $("body").css({
              transform: "scale(" + ratioX + "," + ratioY + ")",
              transformOrigin: "left top",
              backgroundSize: "100% 100%"
           });
           $("html").css({'overflow':'hidden'})
        }

        function copy(obj){
            var newObj = obj;
            if (obj && typeof obj === "object") {
                newObj = Object.prototype.toString.call(obj) === "[object Array]" ? [] : {};
                for (var i in obj) {
                    newObj[i] = copy(obj[i]);
                }
            }
            return newObj;
        }

        // 具体画图
        function drawEChart(echart, opt) {
            echart.setOption(opt, true);
            echart.resize();
        }

        function isValidDate(date) {
            return date instanceof Date && !isNaN(date.getTime())
        }
        function isDateFmt(str) {
            return str.length > 4;
        }

        // 格式化成图表需要的数据
        function fmtEChartData(data){
            var tmpSeriesData = [];
            data.datas.map(function (p) {
                tmpSeriesData.push([
                    isDateFmt(p.key) && isValidDate(new Date(p.key)) ? new Date(p.key) : p.key,
                    (p.val == "" ? 0 : parseFloat(p.val).toFixed(2))
                ])
            });
            return tmpSeriesData;
        }

        function initCharts() {
            $scope.chartMonthBySubentry = echarts.init(document.getElementById("chartMonthBySubentry"));
            $scope.chartRealTime = echarts.init(document.getElementById("chartRealTime"));
            $scope.chartRealTime2 = echarts.init(document.getElementById("chartRealTime2"));
            $scope.chartMonthData = echarts.init(document.getElementById("chartMonthData"));
        }


        // 执行函数
        (function init_data() {
            // 设置全局提供map调用
            window.refreshDatas = refreshDatas;
            setTimeout(function(){
                window.refreshDatas();
            }, 0);

            // 初始化各种图表
            initCharts();

            resetIntervalTime();

            // 每N分钟定时刷新所有电站数据
            //window.refreshPlantsDatasInterval = setInterval(function () {
                refreshDatas();
            //}, refreshInterval);

            // setInterval(function(){
                $scope.data.videoInd += 1;
                $scope.data.videos = videos.slice(2*($scope.data.videoInd%3), 2*(1+$scope.data.videoInd%3));
            // }, 60*1000*100);

        })();

    }]);
});
