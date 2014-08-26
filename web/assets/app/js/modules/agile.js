angular.module('agile', [
        'ngRoute',
        'agile.controllers'
    ])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        //$locationProvider.html5Mode(true);

        var templatesUrl = '/assets/app/templates';
        $routeProvider
            .when('/start', {
                templateUrl: templatesUrl + '/start.html',
                controller: 'Start'
            })
            .when('/version/:projectKey/:versionName', {
                templateUrl: templatesUrl +'/version.html',
                controller: 'Version'
            })
            .when('/projects', {
                templateUrl: templatesUrl + '/projects/list.html',
                controller: 'Projects'
            })
            .otherwise({
                redirectTo: '/start'
            });
    }]);

angular.module('agile.controllers', ['helper', 'api']);