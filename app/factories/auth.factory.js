angular
      .module('Factories')
      .factory('AuthFactory', ['CartFactory',
      function (CartFactory) {
          var user = null;
          return {
              setUser : function(aUser){
                   user = aUser;
                   CartFactory.setDiscount(user.discounts, user.discountSummary);
               },
               isLoggedIn : function(){
                   return (user)? user : false;
               },
               getUser: function() {
                   return this.isLoggedIn() ? user : null;
               },
               getProfiles: function() {
                   return [
                       { id: 1,
                         name: "Unilever",
                         discounts: {
                               "classic": function(quantity) {
                                   var fullPriceItems = quantity % 3;
                                   return ((((quantity - fullPriceItems) / 3) * 2) + fullPriceItems) * 269.99;
                               }
                           },
                           discountSummary: {
                                 "classic": "3 for 2 deal."
                             }
                       },
                       { id: 2,
                         name: "Apple",
                         discounts: {
                               "standout": function(quantity) {
                                   return quantity * 299.99;
                               }
                           },
                           discountSummary: {
                                 "standout": "Price drop to $299.99 per ad."
                             }
                       },
                       { id: 3,
                         name: "Nike",
                         discounts: {
                               "premium": function(quantity) {
                                   return quantity >= 4 ? quantity * 379.99 : quantity * 394.99;
                               }
                           },
                           discountSummary: {
                                 "premium": "Price drop on 4 or more items to $379.99 per ad."
                             }
                       },
                       { id: 4,
                         name: "Ford",
                         discounts: {
                               "classic": function(quantity) {
                                   var fullPriceItems = quantity % 5;
                                   return ((((quantity - fullPriceItems) / 5) * 4) + fullPriceItems) * 269.99;
                               },
                               "standout": function(quantity) {
                                   return quantity * 309.99;
                               },
                               "premium": function(quantity) {
                                   return quantity >= 3 ? quantity * 389.99 : quantity * 394.99;
                               }
                           },
                           discountSummary: {
                               "classic": "5 for 4 deal.",
                               "standout": "Price drop to $309.99 per ad.",
                               "premium": "Price drop on 3 or more items to $389.99 per ad."
                             }
                       }
                   ];
               }
          };
      }]
  );

  angular.module('Factories').run(['$rootScope', '$location', 'AuthFactory',
    function($rootScope, $location, AuthFactory) {
        $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){
            var logged = AuthFactory.isLoggedIn();

            var isSecuredRoute = false;
            if(currRoute.$$route && currRoute.$$route.originalPath && currRoute.$$route.secure === true) {
                isSecuredRoute = true;
            }

            if(isSecuredRoute && !logged) {
                event.preventDefault();
                $location.path('/');
            }
        });
}]);
