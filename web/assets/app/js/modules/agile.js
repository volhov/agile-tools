angular.module('agile', [
        'ngRoute',
        'agile.controllers',
        'agile.filters'
//        'ngDraggable'
    ])
    .constant('TEMPLATES_URL', '/assets/app/templates')
    .config(['$routeProvider', '$locationProvider', '$httpProvider', 'TEMPLATES_URL',
        function($routeProvider, $locationProvider, $httpProvider, TEMPLATES_URL) {
//            $locationProvider.html5Mode(true);

//            $httpProvider.interceptors.push(function($q) {
//                return {
//                    'responseError': function(response) {
//                        console.log(response);
//                        return response;
//                    }
//                };
//            });

            $routeProvider
                .when('/start', {
                    templateUrl: TEMPLATES_URL + '/start.html',
                    controller: 'Start'
                })
                .when('/version/:projectKey/:versionName', {
                    redirectTo: function(params) {
                        var defaultTab = 'confidence_report';
                        return '/version/' + params.projectKey
                            + '/' + params.versionName + '/' + defaultTab;
                    }
                })
                .when('/version/:projectKey/:versionName/:tab', {
                    templateUrl: TEMPLATES_URL +'/version.html',
                    controller: 'Version'
                })
                .when('/project/:projectKey', {
                    templateUrl: TEMPLATES_URL + '/project.html',
                    controller: 'Project'
                })
                .when('/performance/:user', {
                    templateUrl: TEMPLATES_URL + '/performance.html',
                    controller: 'Performance'
                })
                .otherwise({
                    redirectTo: '/start'
                });
        }]);

angular.module('agile.controllers', ['helper', 'api', 'agile.filters']);
angular.module('agile.filters', ['helper', 'ngSanitize']);