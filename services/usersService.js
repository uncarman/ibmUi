define(function (require) {
    var app = require('../js/app');

    app.service('usersService', function () {
        return {
            books: [ { 
                    title: "Magician", author: "Raymond E. Feist"
                }, { 
                    title: "The Hobbit", author: "J.R.R Tolkien"
                }
            ], 
            addBook: function ( book ) { 
                service.books.push( book ); 
                //$rootScope.$broadcast( 'books.update' ); 
            } 
        };
    });
});
