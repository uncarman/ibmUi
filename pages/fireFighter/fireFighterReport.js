define(function(require) {
	var app = require('../../js/app');

	app.controller('fireFighterReportCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
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

            recourceList: [],  // 资源列表
            itemList: [], // 设备列表
            recourceItemList: [], // 某个资源相关的设备
            itemListTypes: {},  // 设备分类列表
            curItemListType: "", // 选中分类
            
			reportSelect: ['2020年度月报', '2019年度月报']
		}

		initCharts();

		// 消防安全评分
		var opt = copy(settings.defaultLineOpt);
		opt.title = {
			text: '消防安全月报',
			textStyle: {
				color: '#3CE7DA',
				fontSize: '14'
			}
		}
		opt.xAxis[0].type = "category";
		opt.xAxis[0].data = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15",
			"16", "17", "18", "19",
			"20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"
		];
		opt.xAxis[0].axisLabel = {
			interval: 0
		};
		opt.grid = {
			top: '20%',
			left: '3%',
			right: '3%',
			bottom: '36%'
		};
		opt.dataZoom = [{
					type: 'inside',
					start: 0,
					end: 100
				},
				{
					show: true,
					type: 'slider',
					start: 0,
					end: 100,
					fillerColor: 'rgba(60, 231, 218, 0.2)',
					borderColor: 'rgba(60, 231, 218, 0.2)',
					textStyle: {
						color: '#3CE7DA',
					}
				}
			],
			opt.series = [{
				name: '分',
				type: 'line',
				label: {
					show: true,
					position: 'top'
				},
				itemStyle: {
					color: 'rgba(60, 231, 218, 0.75)'
				},
				data: [43.3, 85.8, 93.7, 80.3, 85.8, 79.7, 85.8, 93.7, 80.3, 85.8, 79.7, 85.8, 93.7, 80.3, 85.8, 79.7, 85.8,
					93.7, 80.3, 85.8, 79.7, 85.8, 93.7, 80.3, 85.8, 79.7, 85.8, 93.7, 80.3, 85.8, 79.7
				],
			}];

		drawEChart($scope.fireReport1, opt);
		
		// 故障
		var opt = copy(settings.defaultLineOpt);
		
		opt.grid = {
			top: '20%',
			left: '5%',
			right: '5%',
			bottom: '10%'
		}
		opt.legend = {
			data: ['上月', '本月'],
			textStyle: {
				color: '#3CE7DA'
			}
		}
		opt.xAxis[0].type = "category";
		opt.xAxis[0].data = ['故障', '忽略故障', '复位故障', '维修故障'];
		opt.xAxis[0].axisLabel = {
			interval: 0,
			fontSize: 12,
			color: '#3CE7DA',
			fontWeight: '400',
		};
		opt.yAxis[0].name = '个数';
		opt.series = [{
				name: '上月',
				type: 'bar',
				barWidth: '20%',
				label: {
					show: true,
					position: 'top'
				},
				data: [215, 12, 0, 110],
			},
			{
				name: '本月',
				type: 'bar',
				barWidth: '20%',
				label: {
					show: true,
					position: 'top'
				},
				data: [134, 73, 167, 54],
			},
		];
		
		drawEChart($scope.fireReport2, opt);
		
		// 火警
		var opt = copy(settings.defaultLineOpt);
		
		opt.grid = {
			top: '20%',
			left: '5%',
			right: '5%',
			bottom: '10%'
		}
		opt.legend = {
			data: ['上月', '本月'],
			textStyle: {
				color: '#3CE7DA'
			}
		}
		opt.xAxis[0].type = "category";
		opt.xAxis[0].data = ['火警总数', '误报', '系统处理', '人工处理'];
		opt.xAxis[0].axisLabel = {
			interval: 0,
			fontSize: 12,
			color: '#3CE7DA',
			fontWeight: '400',
		};
		opt.yAxis[0].name = '个数';
		opt.series = [{
				name: '上月',
				type: 'bar',
				barWidth: '20%',
				label: {
					show: true,
					position: 'top'
				},
				data: [49, 37, 15, 34],
			},
			{
				name: '本月',
				type: 'bar',
				barWidth: '20%',
				label: {
					show: true,
					position: 'top'
				},
				data: [12, 4, 11, 1],
			},
		];
		
		drawEChart($scope.fireReport3, opt);
		
		// 水系统
		var opt = copy(settings.defaultLineOpt);
		
		opt.grid = {
			top: '20%',
			left: '5%',
			right: '5%',
			bottom: '26%'
		}
		opt.dataZoom = [{
					type: 'inside',
					start: 0,
					end: 100
				},
				{
					show: true,
					type: 'slider',
					start: 0,
					end: 100,
					fillerColor: 'rgba(60, 231, 218, 0.2)',
					borderColor: 'rgba(60, 231, 218, 0.2)',
					textStyle: {
						color: '#3CE7DA',
					}
				}
			],
		opt.xAxis[0].type = "category";
		opt.xAxis[0].data = ['2020-05-01', '2020-05-02', '2020-05-03', '2020-05-04','2020-05-05', '2020-05-06', '2020-05-07', '2020-05-08'];
		opt.xAxis[0].axisLabel = {
			interval: 0,
			fontSize: 12,
			color: '#3CE7DA',
			fontWeight: '400',
		};
		opt.yAxis[0].name = '次数';
		opt.series = [{
				name: '起泵次数',
				type: 'bar',
				barWidth: '20%',
				label: {
					show: true,
					position: 'top'
				},
				data: [0, 1, 5, 0,0, 1, 5, 0],
			},
		];
		
		drawEChart($scope.fireReport4, opt);

		// 绘制图表
		function drawEChart(echart, opt) {
			echart.setOption(opt, true);
			echart.resize();
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

		function initCharts() {
			var fireReport1 = document.getElementById("fireReport1");
			var fireReport2 = document.getElementById("fireReport2");
			var fireReport3 = document.getElementById("fireReport3");
			var fireReport4 = document.getElementById("fireReport4");
			$scope.fireReport1 = echarts.init(fireReport1);
			$scope.fireReport2 = echarts.init(fireReport2);
			$scope.fireReport3 = echarts.init(fireReport3);
			$scope.fireReport4 = echarts.init(fireReport4);
		}
	}]);

});
