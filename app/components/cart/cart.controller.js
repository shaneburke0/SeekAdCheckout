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
