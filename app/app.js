angular.module('Filters', []);
angular.module('Factories', []);
angular.module('HomeModule', ['ngRoute', "Factories"]);
angular.module('CartModule', ['ngRoute', "Factories"]);
angular.module('Directives', ['Factories']);

angular.module('SeekAdsApp', ['ngRoute', 'Factories', 'Filters', 'Directives', 'HomeModule', 'CartModule']);
