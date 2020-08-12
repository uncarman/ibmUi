
// js 版本号
window.version = new Date().getMinutes();

require.config({
    baseUrl: './',
    paths: {
        'angular': 'js/libs/angular.min',
        'angular-ui-router': 'js/libs/angular-ui-router',
        'angular-async-loader': 'js/libs/angular-async-loader',
        'angular-wui-date': 'js/libs/angular.wui-date',
        // 'jquery': 'js/libs/jquery-1.11.0.min',
        // 'bootstrap': 'js/libs/bootstrap.bundle.min',
        'feather': 'js/libs/feather.min',
        'perfect-scrollbar': 'js/libs/perfect-scrollbar.min',
        'moment': 'js/libs/moment-with-locales.min',
        "echarts": "js/libs/echarts.min",
        "particles": "js/libs/particles.min",
        
        "comm": "js/comm",
    },
    shim: {
        'angular': {exports: 'angular'},
        'angular-ui-router': {deps: ['angular']},
        'angular-wui-date': {deps: ['angular']},
    },
    urlArgs: "v=" + version,
    waitSeconds: 0,
});

require(['angular', './js/app-routes', 'angular-wui-date', 'feather', 'perfect-scrollbar', 'moment', 'echarts', 'comm'], function (angular) {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
        angular.element(document).find('html').addClass('ng-app');
    });
});
