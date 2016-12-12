angular.module('Filters', []);
angular.module('Factories', []);
angular.module('HomeModule', ['ngRoute', "Factories"]);
angular.module('CartModule', ['ngRoute', "Factories"]);
angular.module('Directives', ['Factories']);

angular.module('SeekAdsApp', ['ngRoute', 'Factories', 'Filters', 'Directives', 'HomeModule', 'CartModule']);

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

angular
      .module('Factories')
      .factory('CartFactory',
      function () {
          var allProducts = [
              { id: 'classic', name: 'Classic Ad', price: 269.99  },
              { id: 'premium', name: 'Premium Ad', price: 394.99 },
              { id: 'standout', name: 'Standout Ad', price: 322.99 }
          ],
          cart = [],
          discounts = {},
          discountSummary = {};

          function roundUp(num, precision) {
              return Math.ceil(num * precision) / precision;
          }

          function calculatePrice(id, quantity) {
              if(discounts[id]) {
                  return discounts[id](quantity);
              }
              var product = _.findWhere(allProducts, {id: id});
              return quantity * product.price;
          }

          function groupCartById() {
              var groups = _.groupBy(cart, 'id'),
                cartTotal = 0;
              Object.keys(groups).forEach(function(key,index) {
                  var obj = {
                      price:  roundUp(calculatePrice(key, groups[key].length), 100),
                      name: groups[key][0].name,
                      quantity: groups[key].length,
                      summary: discountSummary[key]
                  };
                  cartTotal += obj.price;
                  groups[key] = obj;
              });

              return {
                  groups: groups,
                  total: roundUp(cartTotal, 100)
              };
          }

          return {
              geAllProducts: function() {
                  return allProducts;
              },
              addToCart : function(item){
                   cart.push(item);
              },
              getCart: function() {
                  var groupedCart = groupCartById();
                   return {
                       count: cart.length,
                       items: groupedCart.groups,
                       total: groupedCart.total
                   };
               },
               setDiscount: function(discount, summary) {
                   discounts = discount;
                   discountSummary = summary;
               },
               calculatePrice: calculatePrice
          };
      }
  );

angular.module('Filters')
    .filter('isEmpty', function () {
        var bar;
        return function (obj) {
            for (bar in obj) {
                if (obj.hasOwnProperty(bar)) {
                    return false;
                }
            }
            return true;
        };
    });

angular
    .module('CartModule')
    .constant('CartConstants', {
      default : '/cart',
    });

angular
    .module('CartModule')
    .controller('CartCtrl', ['$scope', 'CartConstants', '$rootScope', 'CartFactory',
	function($scope, CartConstants, $rootScope, CartFactory) {
        var controller = this,
            cart = [];
        controller.products = CartFactory.getCart();
        controller.checkout = function() {
            alert("Not Implemented!");
        };
}]);

angular
    .module('CartModule')
    .config([ '$routeProvider', 'CartConstants',
    function ($routeProvider, CartConstants) {
        $routeProvider
          .when(CartConstants.default, {
            templateUrl : 'app/components/cart/cart.view.html',
            controller : 'CartCtrl',
            controllerAs : 'controller',
            secure: true
        });
}]);

angular
    .module('HomeModule')
    .constant('HomeConstants', {
      default : '/',
    });

angular
    .module('HomeModule')
    .controller('HomeCtrl', ['$scope', 'HomeConstants', '$rootScope', 'AuthFactory', 'CartFactory', '$location',
	function($scope, HomeConstants, $rootScope, AuthFactory, CartFactory, $location) {
        var controller = this;
        controller.currentAd = 1;
        controller.products = CartFactory.geAllProducts();
        controller.cartCount = CartFactory.getCart().count;

        controller.setAd = function(ad) {
            controller.currentAd = ad;
        };

        controller.addToCart = function(item) {
            if(AuthFactory.getUser()) {
                CartFactory.addToCart(item);
                controller.cartCount++;
                $rootScope.$broadcast('cart-add', true);
            } else {
                $rootScope.$broadcast('open-login', true);
            }

        };

        controller.viewCart = function() {
            if(AuthFactory.getUser()) {
                $location.url('/cart');
            } else {
                $rootScope.$broadcast('open-login', true);
            }
        };
}]);

angular
    .module('HomeModule')
    .config([ '$routeProvider', 'HomeConstants',
    function ($routeProvider, HomeConstants) {
        $routeProvider
          .when(HomeConstants.default, {
            templateUrl : 'app/components/home/home.view.html',
            controller : 'HomeCtrl',
            controllerAs : 'controller',
            secure: false
        });
}]);

angular
    .module('Directives')
    .directive('cart', ['$document', 'AuthFactory', 'CartFactory',
        function ($document, AuthFactory, CartFactory) {
        return {
            restrict: "E",
            templateUrl: "/app/directives/cart-header/cart.header.view.html",
            scope: { },
            link: function(scope, element) {
                scope.count = 0;

                scope.$on('cart-add', function(event, arg) {
                    scope.count++;
                });
            }
        };
}]);

angular
    .module('Directives')
    .directive('profile', ['$document', 'AuthFactory',
        function ($document, AuthFactory) {
        return {
            restrict: "E",
            templateUrl: "/app/directives/profile/profile.view.html",
            scope: { },
            link: function(scope, element) {
                scope.user = AuthFactory.getUser();
                scope.profiles = AuthFactory.getProfiles();
                scope.showProfiles = false;

                scope.close = function() {
                    scope.showProfiles = false;
                };

                scope.showLogin = function() {
                    scope.showProfiles = true;
                };

                scope.login = function(profile) {
                    AuthFactory.setUser(profile);
                    scope.user = profile;
                    scope.showProfiles = false;
                };

                scope.$on('open-login', function(val, args) {
                    scope.showLogin();
                });

                scope.createProfile = function(newProfileName) {
                    var newprofile = {
                        id: -1,
                        name: newProfileName,
                        discounts: {},
                        discountSummary: {}
                    };

                    scope.login(newprofile);
                };
            }
        };
}]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZhY3Rvcmllcy9hdXRoLmZhY3RvcnkuanMiLCJmYWN0b3JpZXMvY2FydC5mYWN0b3J5LmpzIiwiZmlsdGVycy9pcy5lbXB0eS5maWx0ZXIuanMiLCJjb21wb25lbnRzL2NhcnQvY2FydC5jb25zdGFudHMuanMiLCJjb21wb25lbnRzL2NhcnQvY2FydC5jb250cm9sbGVyLmpzIiwiY29tcG9uZW50cy9jYXJ0L2NhcnQucm91dGVzLmpzIiwiY29tcG9uZW50cy9ob21lL2hvbWUuY29uc3RhbnRzLmpzIiwiY29tcG9uZW50cy9ob21lL2hvbWUuY29udHJvbGxlci5qcyIsImNvbXBvbmVudHMvaG9tZS9ob21lLnJvdXRlcy5qcyIsImRpcmVjdGl2ZXMvY2FydC1oZWFkZXIvY2FydC5oZWFkZXIuZGlyZWN0aXZlLmpzIiwiZGlyZWN0aXZlcy9wcm9maWxlL3Byb2ZpbGUuZGlyZWN0aXZlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxXQUFBO0FBQ0EsUUFBQSxPQUFBLGFBQUE7QUFDQSxRQUFBLE9BQUEsY0FBQSxDQUFBLFdBQUE7QUFDQSxRQUFBLE9BQUEsY0FBQSxDQUFBLFdBQUE7QUFDQSxRQUFBLE9BQUEsY0FBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxjQUFBLENBQUEsV0FBQSxhQUFBLFdBQUEsY0FBQSxjQUFBOztBQ05BO09BQ0EsT0FBQTtPQUNBLFFBQUEsZUFBQSxDQUFBO01BQ0EsVUFBQSxhQUFBO1VBQ0EsSUFBQSxPQUFBO1VBQ0EsT0FBQTtjQUNBLFVBQUEsU0FBQSxNQUFBO21CQUNBLE9BQUE7bUJBQ0EsWUFBQSxZQUFBLEtBQUEsV0FBQSxLQUFBOztlQUVBLGFBQUEsVUFBQTttQkFDQSxPQUFBLENBQUEsT0FBQSxPQUFBOztlQUVBLFNBQUEsV0FBQTttQkFDQSxPQUFBLEtBQUEsZUFBQSxPQUFBOztlQUVBLGFBQUEsV0FBQTttQkFDQSxPQUFBO3VCQUNBLEVBQUEsSUFBQTt5QkFDQSxNQUFBO3lC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QSxrQkFBQTs7ZUFFQSxnQkFBQTs7Ozs7QUNoRUEsUUFBQSxPQUFBO0tBQ0EsT0FBQSxXQUFBLFlBQUE7UUFDQSxJQUFBO1FBQ0EsT0FBQSxVQUFBLEtBQUE7WUFDQSxLQUFBLE9BQUEsS0FBQTtnQkFDQSxJQUFBLElBQUEsZUFBQSxNQUFBO29CQUNBLE9BQUE7OztZQUdBLE9BQUE7Ozs7QUNUQTtLQUNBLE9BQUE7S0FDQSxTQUFBLGlCQUFBO01BQ0EsVUFBQTs7O0FDSEE7S0FDQSxPQUFBO0tBQ0EsV0FBQSxZQUFBLENBQUEsVUFBQSxpQkFBQSxjQUFBO0NBQ0EsU0FBQSxRQUFBLGVBQUEsWUFBQSxhQUFBO1FBQ0EsSUFBQSxhQUFBO1lBQ0EsT0FBQTtRQUNBLFdBQUEsV0FBQSxZQUFBO1FBQ0EsV0FBQSxXQUFBLFdBQUE7WUFDQSxNQUFBOzs7O0FDUkE7S0FDQSxPQUFBO0tBQ0EsT0FBQSxFQUFBLGtCQUFBO0lBQ0EsVUFBQSxnQkFBQSxlQUFBO1FBQ0E7V0FDQSxLQUFBLGNBQUEsU0FBQTtZQUNBLGNBQUE7WUFDQSxhQUFBO1lBQ0EsZUFBQTtZQUNBLFFBQUE7Ozs7QUNUQTtLQUNBLE9BQUE7S0FDQSxTQUFBLGlCQUFBO01BQ0EsVUFBQTs7O0FDSEE7S0FDQSxPQUFBO0tBQ0EsV0FBQSxZQUFBLENBQUEsVUFBQSxpQkFBQSxjQUFBLGVBQUEsZUFBQTtDQUNBLFNBQUEsUUFBQSxlQUFBLFlBQUEsYUFBQSxhQUFBLFdBQUE7UUFDQSxJQUFBLGFBQUE7UUFDQSxXQUFBLFlBQUE7UUFDQSxXQUFBLFdBQUEsWUFBQTtRQUNBLFdBQUEsWUFBQSxZQUFBLFVBQUE7O1FBRUEsV0FBQSxRQUFBLFNBQUEsSUFBQTtZQUNBLFdBQUEsWUFBQTs7O1FBR0EsV0FBQSxZQUFBLFNBQUEsTUFBQTtZQUNBLEdBQUEsWUFBQSxXQUFBO2dCQUNBLFlBQUEsVUFBQTtnQkFDQSxXQUFBO2dCQUNBLFdBQUEsV0FBQSxZQUFBO21CQUNBO2dCQUNBLFdBQUEsV0FBQSxjQUFBOzs7OztRQUtBLFdBQUEsV0FBQSxXQUFBO1lBQ0EsR0FBQSxZQUFBLFdBQUE7Z0JBQ0EsVUFBQSxJQUFBO21CQUNBO2dCQUNBLFdBQUEsV0FBQSxjQUFBOzs7OztBQzVCQTtLQUNBLE9BQUE7S0FDQSxPQUFBLEVBQUEsa0JBQUE7SUFDQSxVQUFBLGdCQUFBLGVBQUE7UUFDQTtXQUNBLEtBQUEsY0FBQSxTQUFBO1lBQ0EsY0FBQTtZQUNBLGFBQUE7WUFDQSxlQUFBO1lBQ0EsUUFBQTs7OztBQ1RBO0tBQ0EsT0FBQTtLQUNBLFVBQUEsUUFBQSxDQUFBLGFBQUEsZUFBQTtRQUNBLFVBQUEsV0FBQSxhQUFBLGFBQUE7UUFDQSxPQUFBO1lBQ0EsVUFBQTtZQUNBLGFBQUE7WUFDQSxPQUFBO1lBQ0EsTUFBQSxTQUFBLE9BQUEsU0FBQTtnQkFDQSxNQUFBLFFBQUE7O2dCQUVBLE1BQUEsSUFBQSxZQUFBLFNBQUEsT0FBQSxLQUFBO29CQUNBLE1BQUE7Ozs7OztBQ1pBO0tBQ0EsT0FBQTtLQUNBLFVBQUEsV0FBQSxDQUFBLGFBQUE7UUFDQSxVQUFBLFdBQUEsYUFBQTtRQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsYUFBQTtZQUNBLE9BQUE7WUFDQSxNQUFBLFNBQUEsT0FBQSxTQUFBO2dCQUNBLE1BQUEsT0FBQSxZQUFBO2dCQUNBLE1BQUEsV0FBQSxZQUFBO2dCQUNBLE1BQUEsZUFBQTs7Z0JBRUEsTUFBQSxRQUFBLFdBQUE7b0JBQ0EsTUFBQSxlQUFBOzs7Z0JBR0EsTUFBQSxZQUFBLFdBQUE7b0JBQ0EsTUFBQSxlQUFBOzs7Z0JBR0EsTUFBQSxRQUFBLFNBQUEsU0FBQTtvQkFDQSxZQUFBLFFBQUE7b0JBQ0EsTUFBQSxPQUFBO29CQUNBLE1BQUEsZUFBQTs7O2dCQUdBLE1BQUEsSUFBQSxjQUFBLFNBQUEsS0FBQSxNQUFBO29CQUNBLE1BQUE7OztnQkFHQSxNQUFBLGdCQUFBLFNBQUEsZ0JBQUE7b0JBQ0EsSUFBQSxhQUFBO3dCQUNBLElBQUEsQ0FBQTt3QkFDQSxNQUFBO3dCQUNBLFdBQUE7d0JBQ0EsaUJBQUE7OztvQkFHQSxNQUFBLE1BQUE7Ozs7O0FBS0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ0ZpbHRlcnMnLCBbXSk7XHJcbmFuZ3VsYXIubW9kdWxlKCdGYWN0b3JpZXMnLCBbXSk7XHJcbmFuZ3VsYXIubW9kdWxlKCdIb21lTW9kdWxlJywgWyduZ1JvdXRlJywgXCJGYWN0b3JpZXNcIl0pO1xyXG5hbmd1bGFyLm1vZHVsZSgnQ2FydE1vZHVsZScsIFsnbmdSb3V0ZScsIFwiRmFjdG9yaWVzXCJdKTtcclxuYW5ndWxhci5tb2R1bGUoJ0RpcmVjdGl2ZXMnLCBbJ0ZhY3RvcmllcyddKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdTZWVrQWRzQXBwJywgWyduZ1JvdXRlJywgJ0ZhY3RvcmllcycsICdGaWx0ZXJzJywgJ0RpcmVjdGl2ZXMnLCAnSG9tZU1vZHVsZScsICdDYXJ0TW9kdWxlJ10pO1xyXG4iLCJhbmd1bGFyXHJcbiAgICAgIC5tb2R1bGUoJ0ZhY3RvcmllcycpXHJcbiAgICAgIC5mYWN0b3J5KCdBdXRoRmFjdG9yeScsIFsnQ2FydEZhY3RvcnknLFxyXG4gICAgICBmdW5jdGlvbiAoQ2FydEZhY3RvcnkpIHtcclxuICAgICAgICAgIHZhciB1c2VyID0gbnVsbDtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgc2V0VXNlciA6IGZ1bmN0aW9uKGFVc2VyKXtcclxuICAgICAgICAgICAgICAgICAgIHVzZXIgPSBhVXNlcjtcclxuICAgICAgICAgICAgICAgICAgIENhcnRGYWN0b3J5LnNldERpc2NvdW50KHVzZXIuZGlzY291bnRzLCB1c2VyLmRpc2NvdW50U3VtbWFyeSk7XHJcbiAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgIGlzTG9nZ2VkSW4gOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgcmV0dXJuICh1c2VyKT8gdXNlciA6IGZhbHNlO1xyXG4gICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICBnZXRVc2VyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlzTG9nZ2VkSW4oKSA/IHVzZXIgOiBudWxsO1xyXG4gICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICBnZXRQcm9maWxlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgIHsgaWQ6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlVuaWxldmVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBkaXNjb3VudHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NpY1wiOiBmdW5jdGlvbihxdWFudGl0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmdWxsUHJpY2VJdGVtcyA9IHF1YW50aXR5ICUgMztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCgoKHF1YW50aXR5IC0gZnVsbFByaWNlSXRlbXMpIC8gMykgKiAyKSArIGZ1bGxQcmljZUl0ZW1zKSAqIDI2OS45OTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzY291bnRTdW1tYXJ5OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NpY1wiOiBcIjMgZm9yIDIgZGVhbC5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHsgaWQ6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkFwcGxlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBkaXNjb3VudHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhbmRvdXRcIjogZnVuY3Rpb24ocXVhbnRpdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcXVhbnRpdHkgKiAyOTkuOTk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2NvdW50U3VtbWFyeToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YW5kb3V0XCI6IFwiUHJpY2UgZHJvcCB0byAkMjk5Ljk5IHBlciBhZC5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHsgaWQ6IDMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIk5pa2VcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2NvdW50czoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwcmVtaXVtXCI6IGZ1bmN0aW9uKHF1YW50aXR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1YW50aXR5ID49IDQgPyBxdWFudGl0eSAqIDM3OS45OSA6IHF1YW50aXR5ICogMzk0Ljk5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNjb3VudFN1bW1hcnk6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwcmVtaXVtXCI6IFwiUHJpY2UgZHJvcCBvbiA0IG9yIG1vcmUgaXRlbXMgdG8gJDM3OS45OSBwZXIgYWQuXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICB7IGlkOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJGb3JkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBkaXNjb3VudHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NpY1wiOiBmdW5jdGlvbihxdWFudGl0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmdWxsUHJpY2VJdGVtcyA9IHF1YW50aXR5ICUgNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCgoKHF1YW50aXR5IC0gZnVsbFByaWNlSXRlbXMpIC8gNSkgKiA0KSArIGZ1bGxQcmljZUl0ZW1zKSAqIDI2OS45OTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YW5kb3V0XCI6IGZ1bmN0aW9uKHF1YW50aXR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1YW50aXR5ICogMzA5Ljk5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJlbWl1bVwiOiBmdW5jdGlvbihxdWFudGl0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBxdWFudGl0eSA+PSAzID8gcXVhbnRpdHkgKiAzODkuOTkgOiBxdWFudGl0eSAqIDM5NC45OTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzY291bnRTdW1tYXJ5OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzaWNcIjogXCI1IGZvciA0IGRlYWwuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YW5kb3V0XCI6IFwiUHJpY2UgZHJvcCB0byAkMzA5Ljk5IHBlciBhZC5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJlbWl1bVwiOiBcIlByaWNlIGRyb3Agb24gMyBvciBtb3JlIGl0ZW1zIHRvICQzODkuOTkgcGVyIGFkLlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgIH1dXHJcbiAgKTtcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoJ0ZhY3RvcmllcycpLnJ1bihbJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJ0F1dGhGYWN0b3J5JyxcclxuICAgIGZ1bmN0aW9uKCRyb290U2NvcGUsICRsb2NhdGlvbiwgQXV0aEZhY3RvcnkpIHtcclxuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgY3VyclJvdXRlLCBwcmV2Um91dGUpe1xyXG4gICAgICAgICAgICB2YXIgbG9nZ2VkID0gQXV0aEZhY3RvcnkuaXNMb2dnZWRJbigpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGlzU2VjdXJlZFJvdXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmKGN1cnJSb3V0ZS4kJHJvdXRlICYmIGN1cnJSb3V0ZS4kJHJvdXRlLm9yaWdpbmFsUGF0aCAmJiBjdXJyUm91dGUuJCRyb3V0ZS5zZWN1cmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGlzU2VjdXJlZFJvdXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoaXNTZWN1cmVkUm91dGUgJiYgIWxvZ2dlZCkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxufV0pO1xyXG4iLCJhbmd1bGFyXHJcbiAgICAgIC5tb2R1bGUoJ0ZhY3RvcmllcycpXHJcbiAgICAgIC5mYWN0b3J5KCdDYXJ0RmFjdG9yeScsXHJcbiAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHZhciBhbGxQcm9kdWN0cyA9IFtcclxuICAgICAgICAgICAgICB7IGlkOiAnY2xhc3NpYycsIG5hbWU6ICdDbGFzc2ljIEFkJywgcHJpY2U6IDI2OS45OSAgfSxcclxuICAgICAgICAgICAgICB7IGlkOiAncHJlbWl1bScsIG5hbWU6ICdQcmVtaXVtIEFkJywgcHJpY2U6IDM5NC45OSB9LFxyXG4gICAgICAgICAgICAgIHsgaWQ6ICdzdGFuZG91dCcsIG5hbWU6ICdTdGFuZG91dCBBZCcsIHByaWNlOiAzMjIuOTkgfVxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIGNhcnQgPSBbXSxcclxuICAgICAgICAgIGRpc2NvdW50cyA9IHt9LFxyXG4gICAgICAgICAgZGlzY291bnRTdW1tYXJ5ID0ge307XHJcblxyXG4gICAgICAgICAgZnVuY3Rpb24gcm91bmRVcChudW0sIHByZWNpc2lvbikge1xyXG4gICAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwobnVtICogcHJlY2lzaW9uKSAvIHByZWNpc2lvbjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGVQcmljZShpZCwgcXVhbnRpdHkpIHtcclxuICAgICAgICAgICAgICBpZihkaXNjb3VudHNbaWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBkaXNjb3VudHNbaWRdKHF1YW50aXR5KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgdmFyIHByb2R1Y3QgPSBfLmZpbmRXaGVyZShhbGxQcm9kdWN0cywge2lkOiBpZH0pO1xyXG4gICAgICAgICAgICAgIHJldHVybiBxdWFudGl0eSAqIHByb2R1Y3QucHJpY2U7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZnVuY3Rpb24gZ3JvdXBDYXJ0QnlJZCgpIHtcclxuICAgICAgICAgICAgICB2YXIgZ3JvdXBzID0gXy5ncm91cEJ5KGNhcnQsICdpZCcpLFxyXG4gICAgICAgICAgICAgICAgY2FydFRvdGFsID0gMDtcclxuICAgICAgICAgICAgICBPYmplY3Qua2V5cyhncm91cHMpLmZvckVhY2goZnVuY3Rpb24oa2V5LGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgIHZhciBvYmogPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBwcmljZTogIHJvdW5kVXAoY2FsY3VsYXRlUHJpY2Uoa2V5LCBncm91cHNba2V5XS5sZW5ndGgpLCAxMDApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogZ3JvdXBzW2tleV1bMF0ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgIHF1YW50aXR5OiBncm91cHNba2V5XS5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5OiBkaXNjb3VudFN1bW1hcnlba2V5XVxyXG4gICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICBjYXJ0VG90YWwgKz0gb2JqLnByaWNlO1xyXG4gICAgICAgICAgICAgICAgICBncm91cHNba2V5XSA9IG9iajtcclxuICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgZ3JvdXBzOiBncm91cHMsXHJcbiAgICAgICAgICAgICAgICAgIHRvdGFsOiByb3VuZFVwKGNhcnRUb3RhbCwgMTAwKVxyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBnZUFsbFByb2R1Y3RzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbFByb2R1Y3RzO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgYWRkVG9DYXJ0IDogZnVuY3Rpb24oaXRlbSl7XHJcbiAgICAgICAgICAgICAgICAgICBjYXJ0LnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBnZXRDYXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwZWRDYXJ0ID0gZ3JvdXBDYXJ0QnlJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogY2FydC5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IGdyb3VwZWRDYXJ0Lmdyb3VwcyxcclxuICAgICAgICAgICAgICAgICAgICAgICB0b3RhbDogZ3JvdXBlZENhcnQudG90YWxcclxuICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgIHNldERpc2NvdW50OiBmdW5jdGlvbihkaXNjb3VudCwgc3VtbWFyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgZGlzY291bnRzID0gZGlzY291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICBkaXNjb3VudFN1bW1hcnkgPSBzdW1tYXJ5O1xyXG4gICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICBjYWxjdWxhdGVQcmljZTogY2FsY3VsYXRlUHJpY2VcclxuICAgICAgICAgIH07XHJcbiAgICAgIH1cclxuICApO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnRmlsdGVycycpXHJcbiAgICAuZmlsdGVyKCdpc0VtcHR5JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBiYXI7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgICAgICAgZm9yIChiYXIgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGJhcikpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCJhbmd1bGFyXHJcbiAgICAubW9kdWxlKCdDYXJ0TW9kdWxlJylcclxuICAgIC5jb25zdGFudCgnQ2FydENvbnN0YW50cycsIHtcclxuICAgICAgZGVmYXVsdCA6ICcvY2FydCcsXHJcbiAgICB9KTtcclxuIiwiYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnQ2FydE1vZHVsZScpXHJcbiAgICAuY29udHJvbGxlcignQ2FydEN0cmwnLCBbJyRzY29wZScsICdDYXJ0Q29uc3RhbnRzJywgJyRyb290U2NvcGUnLCAnQ2FydEZhY3RvcnknLFxyXG5cdGZ1bmN0aW9uKCRzY29wZSwgQ2FydENvbnN0YW50cywgJHJvb3RTY29wZSwgQ2FydEZhY3RvcnkpIHtcclxuICAgICAgICB2YXIgY29udHJvbGxlciA9IHRoaXMsXHJcbiAgICAgICAgICAgIGNhcnQgPSBbXTtcclxuICAgICAgICBjb250cm9sbGVyLnByb2R1Y3RzID0gQ2FydEZhY3RvcnkuZ2V0Q2FydCgpO1xyXG4gICAgICAgIGNvbnRyb2xsZXIuY2hlY2tvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYWxlcnQoXCJOb3QgSW1wbGVtZW50ZWQhXCIpO1xyXG4gICAgICAgIH07XHJcbn1dKTtcclxuIiwiYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnQ2FydE1vZHVsZScpXHJcbiAgICAuY29uZmlnKFsgJyRyb3V0ZVByb3ZpZGVyJywgJ0NhcnRDb25zdGFudHMnLFxyXG4gICAgZnVuY3Rpb24gKCRyb3V0ZVByb3ZpZGVyLCBDYXJ0Q29uc3RhbnRzKSB7XHJcbiAgICAgICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAgIC53aGVuKENhcnRDb25zdGFudHMuZGVmYXVsdCwge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybCA6ICdhcHAvY29tcG9uZW50cy9jYXJ0L2NhcnQudmlldy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlciA6ICdDYXJ0Q3RybCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBcyA6ICdjb250cm9sbGVyJyxcclxuICAgICAgICAgICAgc2VjdXJlOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbn1dKTtcclxuIiwiYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnSG9tZU1vZHVsZScpXHJcbiAgICAuY29uc3RhbnQoJ0hvbWVDb25zdGFudHMnLCB7XHJcbiAgICAgIGRlZmF1bHQgOiAnLycsXHJcbiAgICB9KTtcclxuIiwiYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnSG9tZU1vZHVsZScpXHJcbiAgICAuY29udHJvbGxlcignSG9tZUN0cmwnLCBbJyRzY29wZScsICdIb21lQ29uc3RhbnRzJywgJyRyb290U2NvcGUnLCAnQXV0aEZhY3RvcnknLCAnQ2FydEZhY3RvcnknLCAnJGxvY2F0aW9uJyxcclxuXHRmdW5jdGlvbigkc2NvcGUsIEhvbWVDb25zdGFudHMsICRyb290U2NvcGUsIEF1dGhGYWN0b3J5LCBDYXJ0RmFjdG9yeSwgJGxvY2F0aW9uKSB7XHJcbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSB0aGlzO1xyXG4gICAgICAgIGNvbnRyb2xsZXIuY3VycmVudEFkID0gMTtcclxuICAgICAgICBjb250cm9sbGVyLnByb2R1Y3RzID0gQ2FydEZhY3RvcnkuZ2VBbGxQcm9kdWN0cygpO1xyXG4gICAgICAgIGNvbnRyb2xsZXIuY2FydENvdW50ID0gQ2FydEZhY3RvcnkuZ2V0Q2FydCgpLmNvdW50O1xyXG5cclxuICAgICAgICBjb250cm9sbGVyLnNldEFkID0gZnVuY3Rpb24oYWQpIHtcclxuICAgICAgICAgICAgY29udHJvbGxlci5jdXJyZW50QWQgPSBhZDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb250cm9sbGVyLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYoQXV0aEZhY3RvcnkuZ2V0VXNlcigpKSB7XHJcbiAgICAgICAgICAgICAgICBDYXJ0RmFjdG9yeS5hZGRUb0NhcnQoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyLmNhcnRDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdjYXJ0LWFkZCcsIHRydWUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdvcGVuLWxvZ2luJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29udHJvbGxlci52aWV3Q2FydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZihBdXRoRmFjdG9yeS5nZXRVc2VyKCkpIHtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi51cmwoJy9jYXJ0Jyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ29wZW4tbG9naW4nLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbn1dKTtcclxuIiwiYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnSG9tZU1vZHVsZScpXHJcbiAgICAuY29uZmlnKFsgJyRyb3V0ZVByb3ZpZGVyJywgJ0hvbWVDb25zdGFudHMnLFxyXG4gICAgZnVuY3Rpb24gKCRyb3V0ZVByb3ZpZGVyLCBIb21lQ29uc3RhbnRzKSB7XHJcbiAgICAgICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAgIC53aGVuKEhvbWVDb25zdGFudHMuZGVmYXVsdCwge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybCA6ICdhcHAvY29tcG9uZW50cy9ob21lL2hvbWUudmlldy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlciA6ICdIb21lQ3RybCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBcyA6ICdjb250cm9sbGVyJyxcclxuICAgICAgICAgICAgc2VjdXJlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG59XSk7XHJcbiIsImFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ0RpcmVjdGl2ZXMnKVxyXG4gICAgLmRpcmVjdGl2ZSgnY2FydCcsIFsnJGRvY3VtZW50JywgJ0F1dGhGYWN0b3J5JywgJ0NhcnRGYWN0b3J5JyxcclxuICAgICAgICBmdW5jdGlvbiAoJGRvY3VtZW50LCBBdXRoRmFjdG9yeSwgQ2FydEZhY3RvcnkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogXCJFXCIsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9hcHAvZGlyZWN0aXZlcy9jYXJ0LWhlYWRlci9jYXJ0LmhlYWRlci52aWV3Lmh0bWxcIixcclxuICAgICAgICAgICAgc2NvcGU6IHsgfSxcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmNvdW50ID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICBzY29wZS4kb24oJ2NhcnQtYWRkJywgZnVuY3Rpb24oZXZlbnQsIGFyZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbn1dKTtcclxuIiwiYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnRGlyZWN0aXZlcycpXHJcbiAgICAuZGlyZWN0aXZlKCdwcm9maWxlJywgWyckZG9jdW1lbnQnLCAnQXV0aEZhY3RvcnknLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkZG9jdW1lbnQsIEF1dGhGYWN0b3J5KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6IFwiRVwiLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvYXBwL2RpcmVjdGl2ZXMvcHJvZmlsZS9wcm9maWxlLnZpZXcuaHRtbFwiLFxyXG4gICAgICAgICAgICBzY29wZTogeyB9LFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IEF1dGhGYWN0b3J5LmdldFVzZXIoKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnByb2ZpbGVzID0gQXV0aEZhY3RvcnkuZ2V0UHJvZmlsZXMoKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnNob3dQcm9maWxlcyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIHNjb3BlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuc2hvd1Byb2ZpbGVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHNjb3BlLnNob3dMb2dpbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnNob3dQcm9maWxlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHNjb3BlLmxvZ2luID0gZnVuY3Rpb24ocHJvZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIEF1dGhGYWN0b3J5LnNldFVzZXIocHJvZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHByb2ZpbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuc2hvd1Byb2ZpbGVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbignb3Blbi1sb2dpbicsIGZ1bmN0aW9uKHZhbCwgYXJncykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnNob3dMb2dpbigpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2NvcGUuY3JlYXRlUHJvZmlsZSA9IGZ1bmN0aW9uKG5ld1Byb2ZpbGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld3Byb2ZpbGUgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAtMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3UHJvZmlsZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2NvdW50czoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2NvdW50U3VtbWFyeToge31cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5sb2dpbihuZXdwcm9maWxlKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG59XSk7XHJcbiJdfQ==
