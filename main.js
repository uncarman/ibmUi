
require.config({
    baseUrl: './',
    paths: {
        'angular': 'js/libs/angular',
        'angular-ui-router': 'js/libs/angular-ui-router',
        'angular-async-loader': 'js/libs/angular-async-loader',
        // 'jquery': 'js/libs/jquery-1.11.0.min',
        // 'bootstrap': 'js/libs/bootstrap.bundle.min',
        'feather': 'js/libs/feather.min',
        'perfect-scrollbar': 'js/libs/perfect-scrollbar.min',
        'moment': 'js/libs/moment-with-locales.min',
        "echarts": "js/libs/echarts.min",
    },
    shim: {
        'angular': {exports: 'angular'},
        'angular-ui-router': {deps: ['angular']},
    },
    urlArgs: "v=" +  (settings && settings.is_debug) ? new Date().getMinutes() : new Date().getDate(),
});

require(['angular', './js/app-routes', 'feather', 'perfect-scrollbar', 'moment', 'echarts'], function (angular) {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
        angular.element(document).find('html').addClass('ng-app');
    });
});
