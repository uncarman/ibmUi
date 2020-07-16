define(function (require) {
    var app = require('./app');
    var settings = require('comm').settings;
    var global = require('comm').global;

    app.run(['$state', '$stateParams', '$rootScope', function ($state, $stateParams, $rootScope) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);

    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: './pages/login/login.html?v='+version,
                controllerUrl: './pages/login/login',
                controller: 'loginCtrl'
            })
            .state('home', {
                url: '/home',
                templateUrl: './pages/home/home.html?v='+version,
                controllerUrl: './pages/home/home',
                controller: 'homeCtrl',
            })
            .state('statistics', {
                url: '/statistics',
                templateUrl: './pages/statistics/statistics.html?v='+version,
                controllerUrl: './pages/statistics/statistics',
                controller: 'statisticsCtrl',
            })
            .state('energySum', {
                url: '/energySum',
                templateUrl: './pages/energy/energySum.html?v='+version,
                controllerUrl: './pages/energy/energySum',
                controller: 'energySumCtrl',
            })
            // 总体用能概述
            .state('energy', {
                url: '/energy/:energyType/:subType/:showType',
                templateUrl: './pages/energy/energy.html?v='+version,
                controllerUrl: './pages/energy/energy',
                controller: 'energyCtrl',
                params: {
                    energyType: "01",
                    subType: "",
                    showType: "day",
                }
            })
            // 能耗分项
            .state('energyDetail', {
                url: '/energyDetail/:energyType/:subType/:showType',
                templateUrl: './pages/energy/energyDetail.html?v='+version,
                controllerUrl: './pages/energy/energyDetail',
                controller: 'energyDetailCtrl',
                // params: {
                //     energyType: "01",
                //     subType: "能耗分项",
                //     showType: "day",
                //     parent: 1,
                // }
            })
            // ---------------- 报警相关 ---------------- 
            // 安全用电
            .state('safeElectricity', {
                url: '/safeElectricity',
                templateUrl: './pages/warning/safeElectricity.html?v='+version,
                controllerUrl: './pages/warning/safeElectricity',
                controller: 'safeElectricityCtrl',
                params: {
                    category: "变配电",  // 对应a_recource.category
                    type: "electricity", // 对应global.warningTypes, 左侧菜单
                }
            })

            // ---------------- 后台编辑 ---------------- 
            // 建筑信息
            .state('settingsBuilding', {
                url: '/settingsBuilding',
                templateUrl: './pages/settings/settingsBuilding.html?v='+version,
                controllerUrl: './pages/settings/settingsBuilding',
                controller: 'settingsBuildingCtrl',
                params: {
                    routeId: 0
                }
            })
            // 相关人员
            .state('settingsBuildingMember', {
                url: '/settingsBuildingMember',
                templateUrl: './pages/settings/settingsBuildingMember.html?v='+version,
                controllerUrl: './pages/settings/settingsBuildingMember',
                controller: 'settingsBuildingMemberCtrl',
                params: {
                    routeId: 1
                }
            })
            // 资源管理(楼层背景, 设备布局)
            .state('settingsBuildingResource', {
                url: '/settingsBuildingResource',
                templateUrl: './pages/settings/settingsBuildingResource.html?v='+version,
                controllerUrl: './pages/settings/settingsBuildingResource',
                controller: 'settingsBuildingResourceCtrl',
                params: {
                    routeId: 2
                }
            })
            // 分组管理
            .state('settingsGroup', {
                url: '/settingsGroup',
                templateUrl: './pages/settings/settingsGroup.html?v='+version,
                controllerUrl: './pages/settings/settingsGroup',
                controller: 'settingsGroupCtrl',
                params: {
                    routeId: 3
                }
            })
            // 设备管理
            .state('settingsItem', {
                url: '/settingsItem',
                templateUrl: './pages/settings/settingsItem.html?v='+version,
                controllerUrl: './pages/settings/settingsItem',
                controller: 'settingsItemCtrl',
                params: {
                    routeId: 4
                }
            })
            // 基础数据
            .state('settingsBase', {
                url: '/settingsBase',
                templateUrl: './pages/settings/settingsBase.html?v='+version,
                controllerUrl: './pages/settings/settingsBase',
                controller: 'settingsBaseCtrl',
                params: {
                    routeId: 5
                }
            })
            // 管网安全
            .state('settingsPipeSecurity', {
                url: '/settingsPipeSecurity',
                templateUrl: './pages/settings/settingsPipeSecurity.html?v='+version,
                controllerUrl: './pages/settings/settingsPipeSecurity',
                controller: 'settingsPipeSecurityCtrl',
            })




            .state('energyGroup', {
                url: '/energyGroup',
                templateUrl: './pages/energy/energyGroup.html?v='+version,
                controllerUrl: './pages/energy/energyGroup',
                controller: 'energyGroupCtrl',
            })
            .state('warning', {
                url: '/warning',
                templateUrl: './pages/warning/warning.html?v='+version,
                controllerUrl: './pages/warning/warning',
                controller: 'warningCtrl',
            })
            .state('device', {
                url: '/device',
                templateUrl: './pages/device/device.html?v='+version,
                controllerUrl: './pages/device/device',
                controller: 'deviceCtrl',
            })
            .state('device2', {
                url: '/device2',
                templateUrl: './pages/device/device2.html?v='+version,
                controllerUrl: './pages/device/device2',
                controller: 'device2Ctrl',
            })
            .state('camera', {
                url: '/camera',
                templateUrl: './pages/camera/camera.html?v='+version,
                controllerUrl: './pages/camera/camera',
                controller: 'cameraCtrl',
            })
            .state('deviceDetail', {
                url: '/deviceDetail',
                templateUrl: './pages/device/deviceDetail.html?v='+version,
                controllerUrl: './pages/device/deviceDetail',
                controller: 'deviceDetailCtrl',
            })
            .state('powerDispatch', {
                url: '/powerDispatch',
                templateUrl: './pages/powerDispatch/powerDispatch.html?v='+version,
                controllerUrl: './pages/powerDispatch/powerDispatch',
                controller: 'powerDispatchCtrl',
            })

            // test demo 页面
            .state('empty', {
                url: '/empty',
                templateUrl: './pages/empty/empty.html?v='+version,
                controllerUrl: './pages/empty/empty',
                controller: 'emptyCtrl',
            })
            .state('test', {
                url: '/test/:id',
                templateUrl: './pages/empty/test.html?v='+version,
                controllerUrl: './pages/empty/test',
                controller: 'testCtrl',
            })



            .state('monitor', {
                url: '/monitor',
                views: {
                    // 无名 view
                    '': {
                        templateUrl: './pages/monitor/monitor.html?v='+version,
                        controllerUrl: './pages/monitor/monitor',
                        controller: 'monitorCtrl',
                    },
                    'nav@monitor': {
                        templateUrl: './pages/_components/nav/nav.html?v='+version,
                        controllerUrl: './pages/_components/nav/nav',
                        controller: 'navCtrl',
                    },
                }
            });
    }]);

    app.directive('onFinishRenderFilters', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function() {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        };
    }]);
});
