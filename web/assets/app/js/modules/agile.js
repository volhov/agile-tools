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
            .when('/projects', {
                templateUrl: templatesUrl + '/projects/list.html',
                controller: 'Projects'
            })
            .when('/projects/:projectKey', {
                templateUrl: templatesUrl +'/projects/project.html',
                controller: 'Projects.Project'
            })
            .otherwise({
                redirectTo: '/start'
            });
    }]);

angular.module('agile.controllers', ['helper', 'api']);