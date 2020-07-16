define(function (require) {
    var app = require('../../js/app');

    app.controller('settingsPipeSecurityCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
        var settings = require('comm').settings;
        var global = require('comm').global;
        var feather = require('feather');
        var echarts = require('echarts');
        var moment = require('moment');

        $scope.$watch('$viewContentLoaded', function() {
            global.on_loaded_func($scope);    // 显示页面内容
        });

        $scope.datas = {

        }

    }]);

});
