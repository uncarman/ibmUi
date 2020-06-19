define(function (require) {
    var app = require('./app');
    var version = (settings && settings.is_debug) ? new Date().getMinutes() : new Date().getDate();

    app.run(['$state', '$stateParams', '$rootScope', function ($state, $stateParams, $rootScope) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);

    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            // .state('login', {
            //     url: '/login',
            //     templateUrl: './pages/login/login.html?v='+version,
            //     controllerUrl: './pages/login/loginCtrl',
            //     controller: 'loginCtrl'
            // })
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

    app.directive('onFinishRenderFilters', function ($timeout) {
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
    });
});
