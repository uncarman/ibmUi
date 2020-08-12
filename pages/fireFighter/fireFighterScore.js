define(function(require) {
	var app = require('../../js/app');

	app.controller('fireFighterScoreCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
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

		var opt = systemOption(90);
		drawEChart($scope.fireScoreChart, opt);

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
					text: num + ' {score|分}\n{grade|等级优}',
					x: 'center',
					y: 'center',
					textStyle: {
						fontSize: '36',
						color: '#3CE7DA',
						fontWeight: 'normal',
						rich: {
							score: {
								fontSize: 16
							},
							grade: {
								fontSize: 28,
								lineHeight: 44,
							},
						}
					}
				},
				series: {
					type: 'pie',
					radius: ['78%', '90%'],
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
			var fireScoreChart = document.getElementById("fireScoreChart");
			$scope.fireScoreChart = echarts.init(fireScoreChart);
		}
	}]);

});
