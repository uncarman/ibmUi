define(function (require, exports, module) {
    var angular = require('angular');
    var asyncLoader = require('angular-async-loader');

    var settings = require('comm').settings;
    var global = require('comm').global;

    require('angular-ui-router');

    var app = angular.module('app', ['ui.router', 'wui.date']);
    
    app.config(function($interpolateProvider) {
	    $interpolateProvider.startSymbol('{[{');
	    $interpolateProvider.endSymbol('}]}');
	}).filter('trustAsResourceUrl', ['$sce', function($sce) {
	    return function(val) {
	        return $sce.trustAsResourceUrl(val);
	    };
	}]).filter('rangeFormat', function($filter) {
	    return function(number) {
	        number = number || 0;
	        var unit='';
	        switch(true){
	            case number > 1000*1000*1000:
	                unit='G';
	                number=number/(1000*1000*1000);
	                break;
	            case number > 1000*1000:
	                unit='M';
	                number=number/(1000*1000);
	                break;
	            case number>1000:
	                unit='k';
	                number=number/1000;
	                break;
	            default:
	                unit='';
	                number=number;
	                break;
	        }
	        return $filter('number')(number, 2)+unit;
	    };
	}).controller('navController', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
		$('#sideMenu').click();
		$scope.goto = global.goto;
		$scope._state = $state;
	}]);
    asyncLoader.configure(app);
    module.exports = app;
});
