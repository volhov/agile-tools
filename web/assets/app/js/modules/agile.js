angular.module('agile', [
        'ngRoute',
        'agile.controllers',
        'agile.filters',
        'route-segment',
        'view-segment'
    ])
    .constant('TEMPLATES_URL', '/assets/app/templates')
    .config(['$routeProvider', '$routeSegmentProvider', '$locationProvider', '$httpProvider', 'TEMPLATES_URL',
        function($routeProvider, $routeSegmentProvider, $locationProvider, $httpProvider, TEMPLATES_URL) {
//            $locationProvider.html5Mode(true);

//            $httpProvider.interceptors.push(function($q) {
//                return {
//                    'responseError': function(response) {
//                        console.log(response);
//                        return response;
//                    }
//                };
//            });
            $routeSegmentProvider
                .when('/start', 'start')
                    .segment('start', {
                        templateUrl: TEMPLATES_URL + '/start.html',
                        controller: 'Start'
                    })
                .when('/project/:projectKey', 'project')
                .when('/version/:projectKey/:versionName', 'project.version')
                .when('/version/:projectKey/:versionName/:tab', 'project.version.tab')
                    .segment('project', {
                        templateUrl: TEMPLATES_URL + '/project.html',
                        controller: 'Project'
                    })
                    .within('project')
                        .segment('version', {})
                            .within('version')
                                .segment('tab', {
                                    templateUrl: TEMPLATES_URL +'/version.html',
                                    controller: 'Version',
                                    dependencies: ['versionName', 'tab']
                                })

            ;

            $routeProvider
//                .when('/version/:projectKey/:versionName', {
//                    redirectTo: function(params) {
//                        var defaultTab = 'confidence_report';
//                        return '/version/' + params.projectKey
//                            + '/' + params.versionName + '/' + defaultTab;
//                    }
//                })
                .otherwise({redirectTo: '/start'});

            /*
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
                            .otherwise({
                                redirectTo: '/start'
                            });
            */
        }]);

angular.module('agile.controllers', ['helper', 'api', 'agile.filters']);
angular.module('agile.filters', ['helper', 'ngSanitize']);