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
