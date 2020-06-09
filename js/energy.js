var app = angular.module("app",[]);
app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
}).filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}]).controller('energyCtrl', function($scope) {
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
        $($scope.datas.datePickerDom).datepicker({
            autoclose: true,
            todayHighlight: true,
            language: "zh-CN",
            format: "yyyy-mm-dd"
        });

        $scope.getDatas();
    }, 0);

    $scope.datas = {
        // 空气质量
        "cityId": "1233",  // 嘉兴市
        "AppCode": "1b676b19152f4f41b16a961742c49ac0",  // aliyun墨迹

        headCenter: "智慧楼宇数据管控平台",
        headLeft: "",
        headRight: moment().format("YYYY-MM-DD dddd"),

        safeDays: moment().diff(moment(startDay), "days"), // 安全运行天数

        // 建筑id
        buildingId: 56, //global.read_storage("session", "building")["id"],

        fmt: "YYYY-MM-DD",
        datePickerDom: "#reservation",
        fromDate: moment().add(-30, 'day').format("YYYY-MM-DD"),
        toDate: moment().format("YYYY-MM-DD"),
        todayStr:moment().format("YYYY-MM-DD"),
        type: "day", // 默认按天显示

        result:{
            summaryDatas: [],
            chartDatas: {},
            tableData: {},
        },

        option: settings.defaultLineOpt,
        option2: {
            color: ['#259eaf','#197898', '#0e5483', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:[],
                y: "10px",
            },
            grid: {
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    data : []
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                // {
                //   name:'用电量',
                //   type:'bar',
                //   data:[]
                // }
            ]
        },

    }

    // 获取图表数据
    $scope.getBuildingChartDataByType = function () {
        var param = {
            _method: 'post',
            _url: settings.ajax_func.getBuildingChartDataByType,
            _param: {
                buildingId: $scope.datas.buildingId,
                from: $scope.datas.fromDate,
                to: $scope.datas.toDate,
                type: $scope.datas.type,
            }
        };
        global.ajax_data($scope, param, function (res) {
            console.log("-------",res);
            $scope.$apply(function(){
                $scope.datas.result.chartDatas = res.data;
                summaryChartDraw($scope.datas);
            });
        });
    };

    // 获取table数据
    $scope.getBuildingTableDataByType = function () {
        var param = {
            _method: 'post',
            _url: settings.ajax_func.getBuildingTableDataByType,
            _param: {
                buildingId: $scope.datas.buildingId,
                from: $scope.datas.fromDate,
                to: $scope.datas.toDate,
                type: $scope.datas.type,
            }
        };
        global.ajax_data($scope, param, function (res) {
            $scope.$apply(function(){
                $scope.datas.result.tableData.title = res.data[0];
                $scope.datas.result.tableData.data = res.data.slice(1, res.data.length);
            });
        });
    };

    // 获取数据
    $scope.getDatas = function(){
        $scope.getBuildingChartDataByType();
        $scope.getBuildingTableDataByType();
    };

    //Date range picker
    // $($scope.datas.datePickerDom).daterangepicker({
    //     startDate: moment($scope.datas.fromDate),
    //     endDate: moment($scope.datas.toDate),
    //     locale: {
    //         format: $scope.datas.fmt
    //     },
    // }).on('apply.daterangepicker', function(ev, picker) {
    //     $scope.datas.fromDate = (picker.startDate.format('YYYY-MM-DD'));
    //     $scope.datas.toDate = (picker.endDate.format('YYYY-MM-DD'));
    // });

    // 画图表
    $scope.summaryChart = echarts.init(document.getElementById("summaryChart"));

    function summaryChartDraw(data) {
        var opt = angular.copy($scope.datas.option);

        // 生成x轴内容
        var xlen = Math.ceil(moment(moment($scope.datas.toDate).format($scope.datas.fmt)).diff(moment($scope.datas.fromDate).format($scope.datas.fmt), 'days', true));
        for(var i=0; i<=xlen; i++) {
            opt.xAxis[0].data.push(moment($scope.datas.fromDate).add('days', i).format($scope.datas.fmt));
        }

        for(var o in data.result.chartDatas) {
            var sd = [];
            for(var i=0; i<=xlen; i++) {
                sd.push(0);
            }
            var d = data.result.chartDatas[o];
            opt.legend.data.push(d.name);

            d.datas.map(function (k) {
                var ind = opt.xAxis[0].data.indexOf(moment(k[d.key]).format($scope.datas.fmt));
                sd[ind] = parseFloat(k[d.val]).toFixed(4);
            });

            var tempSeries = {
                name: d.name,
                type: "bar",
                stack: "总量",
                data: sd
            };
            opt.series.push(tempSeries);
        }
        console.log(opt);
        $scope.summaryChart.setOption(opt, true);
        $scope.summaryChart.resize();
    };

    // 点击按刷新页面
    $scope.refreshDatas = function () {
        $scope.getDatas();
    };

    // 点击跳转
    $scope.gotoDetail = function (type) {
        window.location.href = "#/monitor_" + settings.types[type];
    };
});