define(function (require) {
    var app = require('../../js/app');
    var feather = require('feather');
    var moment = require('moment');
    var echarts = require('echarts');

    app.controller('emptyCtrl', function($scope) {
        moment.locale("zh_cn");
        $scope.is_debug = settings.is_debug;
        global.on_load_func();    // 加载隐藏div数据并保存到js的session变量

        $scope.$watch('$viewContentLoaded', function () {
            global.on_loaded_func($scope);    // 显示页面内容
        });
        
    });

});
