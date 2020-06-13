define(function (require) {
    var app = require('../../js/app');

    // dynamic load services here or add into dependencies of state config
    require('../../services/usersService');

    app.controller('productsCtrl', ['$scope', function ($scope) {
        
    }]);

});
