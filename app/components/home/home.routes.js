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
