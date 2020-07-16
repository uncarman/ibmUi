define(function (require) {
    var app = require('../../js/app');

    app.controller('settingsBuildingCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
        var settings = require('comm').settings;
        var global = require('comm').global;
        var feather = require('feather');
        var echarts = require('echarts');
        var moment = require('moment');

        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func();    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function() {
            global.on_loaded_func($scope, $state, $stateParams);    // 显示页面内容

            $scope.pointsChart = echarts.init(document.getElementById("pointsChart"));

            $scope.getDatas();
        });

        $scope.data = {
            user: global.read_storage("session", "user"),
            curBuilding: global.read_storage("session", "building"),
            buildingList: global.read_storage("session", "buildingList"),

            pageTitle: settings.pageTitle,
            headLeft: "安全·舒适·节能",
            headRight: moment().format("YYYY-MM-DD dddd"),

            // 左侧菜单
            settingsRouteInd: $stateParams.routeId,
            settingsRoutes: settings.settingsRoutes,

            map: null, //地图
        };

        $scope.getDatas = function() {
            // 点位信息
            var radioOpt = {
                color: settings.colors,
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                grid: {
                    top: 0,
                    left: 10,
                    right: 10,
                    bottom: 10,
                },
                legend: {
                    orient: 'vertical',
                    left: 10,
                    top: 20,
                    data: ['正常点位', '故障点位', '屏蔽点位'],
                    textStyle: {
                        color: "rgba(60, 231, 218, 0.85)",
                        fontSize: "12",
                    },
                    y: "0px",
                },
                series: [
                    {
                        name: '访问来源',
                        type: 'pie',
                        radius: ['45%', '65%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '12',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: [
                            {value: 335, name: '正常点位'},
                            {value: 7, name: '故障点位'},
                            {value: 3, name: '屏蔽点位'},
                        ]
                    }
                ]
            };
            $scope.pointsChart.setOption(radioOpt, true);
            $scope.pointsChart.resize();

            // 地图
            $scope.initMap();
            $scope.setMark({
                name: $scope.data.curBuilding.name,
                bstatus: 3,
                lng: $scope.data.curBuilding.longitude,
                lat: $scope.data.curBuilding.latitude,
            });
        }

        // 地图相关
        $scope.initMap = function() {
            $scope.data.map = new AMap.Map('mapBuilding', {
                center: [121.4997200000, 31.2396900000],
                pitch: 50,
                zoom: 15,
                mapStyle: "amap://styles/fa976a97e299c0866958baf4cf5d4d33",
            });
            $scope.data.map.on("complete", function(e) {
                $("#mapBuilding").css("background-color", "transparent");
                console.log("11111");
            });
        };
        $scope.setMark = function(data) {
            var labelWidth = data.name.length * 14;
            var borderColor = '#fff';
            var fireShow = 'none'
              , dangerShow = 'none'
              , faultShow = 'none'
              , wbShow = 'none';
            var imgSrc = 'http://doc-files.oss-cn-shanghai.aliyuncs.com/emergencyplan/mark_building_normal.png';
            //故障
            if (data.bstatus == 1) {
                faultShow = 'flex';
                borderColor = '#F7C55C';
                imgSrc = 'http://doc-files.oss-cn-shanghai.aliyuncs.com/emergencyplan/mark_building_fault.png';
            }
            //火警
            if (data.bstatus == 2) {
                fireShow = 'flex';
                borderColor = '#E72014';
                imgSrc = 'http://doc-files.oss-cn-shanghai.aliyuncs.com/emergencyplan/mark_building_fire.png';
            }
            //维保
            if (data.bstatus == 3) {
                wbShow = 'inline';
            }
            var marker = new AMap.Marker({
                content: '<div>\n                            <p style="display:' + wbShow + ';background-color:rgba(12, 15, 26, 0.4);height:20px;border:1px solid #4FF4AB;border-radius:10px;font-size:12px;line-height:20px;text-align:center;padding:0 10px;margin-bottom:5px;color:#4FF4AB">\u7EF4\u4FDD\u4E2D...</p>\n                            <div style="display:flex;height:26px;border:1px solid ' + borderColor + ';border-radius:8px;background-color:rgba(12, 15, 26, 0.4);text-align:center;padding:0 10px">\n                                <label style="width:' + labelWidth + 'px;flex:1;height:26px;line-height:26px;font-size:14px;color:' + borderColor + '">' + data.name + '</label>\n                            </div>\n                            <img style="display:block;width:70px;height:147px;margin:-60px auto 0 auto;" src="' + imgSrc + '" />\n                            </div>',
                // position: data.position,
                position: [data.lng, data.lat],
                offset: new AMap.Pixel(-parseInt(labelWidth / 2),-115)
            });
            $scope.data.map.setCenter([data.lng, data.lat]);
            $scope.data.map.add(marker);
        };
    }]);

});