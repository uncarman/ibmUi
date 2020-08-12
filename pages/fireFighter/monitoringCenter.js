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
            
		}
		initCharts();

		// 异常数据
		var opt = copy(settings.defaultLineOpt);

		opt.grid = {
			top: '20%',
			right: 0
		}
		opt.legend = {
			right: 0,
			data: ['5月', '6月', '7月'],
			textStyle: {
				color: '#3CE7DA'
			}

		}
		opt.xAxis[0].type = "category";
		opt.xAxis[0].data = ['通用', '消防联动', '火灾报警', '消防栓', '灭火器', '水压'];
		opt.xAxis[0].axisLabel = {
			interval: 0,
			fontSize: 12,
			color: '#3CE7DA',
			fontWeight: '400',
		};
		opt.series = [{
				name: '5月',
				type: 'bar',
				data: [43.3, 85.8, 93.7, 43.3, 85.8, 93.7],
			},
			{
				name: '6月',
				type: 'bar',
				data: [43.3, 85.8, 93.7, 43.3, 85.8, 93.7],
			},
			{
				name: '7月',
				type: 'bar',
				data: [43.3, 85.8, 93.7, 43.3, 85.8, 93.7],
			},
		];

		drawEChart($scope.abnormalChart, opt);

		// 系统
		var system_opt_1 = systemOption(40);
		drawEChart($scope.fireSystem1, system_opt_1);
		
		var system_opt_2 = systemOption(50);
		drawEChart($scope.fireSystem2, system_opt_2);
		
		var system_opt_3 = systemOption(80);
		drawEChart($scope.fireSystem3, system_opt_3);
		

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
						fontSize: '36',
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

		function initCharts() {
			var abnormalChart = document.getElementById("abnormalChart");
			var fireSystem1 = document.getElementById("fireSystem1");
			var fireSystem2 = document.getElementById("fireSystem2");
			var fireSystem3 = document.getElementById("fireSystem3");
			$scope.abnormalChart = echarts.init(abnormalChart);
			$scope.fireSystem1 = echarts.init(fireSystem1);
			$scope.fireSystem2 = echarts.init(fireSystem2);
			$scope.fireSystem3 = echarts.init(fireSystem3);
		}

	}]);

});
