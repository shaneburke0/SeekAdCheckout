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
