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
