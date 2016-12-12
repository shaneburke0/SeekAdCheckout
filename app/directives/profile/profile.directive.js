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
