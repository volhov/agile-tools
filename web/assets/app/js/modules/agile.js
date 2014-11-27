angular.module('agile', [
        'ngRoute',
        'agile.controllers',
        'agile.filters',
        'agile.services',
        'route-segment',
        'view-segment',
        'ui.sortable'
    ])
    .constant('TEMPLATES_URL', '/assets/app/templates')
    .config(['$routeProvider', '$routeSegmentProvider', '$locationProvider', 'TEMPLATES_URL',
        function($routeProvider, $routeSegmentProvider, $locationProvider, TEMPLATES_URL) {

            $locationProvider.html5Mode(true);

            /**
             * Managing redirects through native $routeProvider.
             */
            $routeProvider
                .when('/project/:projectKey/:versionName', {
                    redirectTo: function(params) {
                        var defaultTab = 'confidence_report';
                        return '/project/' + params.projectKey
                            + '/' + params.versionName + '/' + defaultTab;
                    }
                })
                .otherwise({
                    redirectTo: '/start'
                });

            /**
             * Managing route segments.
             */
            $routeSegmentProvider
                .when('/start', 'start')
                    .segment('start', getSegmentParams('Start', '/start.html', true))
                .when('/performance/:user', 'performance')
                    .segment('performance', getSegmentParams('Performance', '/performance.html', true, false, ['user']))
                .when('/project/:projectKey', 'project')
                .when('/project/:projectKey/:versionName/confidence_report', 'project.version.confidence_report')
                .when('/project/:projectKey/:versionName/confidence_report/export', 'project.version.confidence_report.export')
                .when('/project/:projectKey/:versionName/resources', 'project.version.resources')
                    .segment('project', getSegmentParams('Project', '/project.html', true))
                    .within('project')
                        .segment('overview', getSegmentParams('Project', '/project/overview.html', false, true))
                        .segment('version', getSegmentParams('Version', '/project/version.html'))
                        .within('version')
                            .segment('confidence_report', getSegmentParams('Version_ConfidenceReport', '/project/version/confidence_report.html', false, false, ['projectKey', 'versionName']))
                            .within('confidence_report')
                                .segment('edit', getSegmentParams('Version_ConfidenceReport', '/project/version/confidence_report/edit.html', false, true))
                                .segment('export', getSegmentParams('Version_ConfidenceReport_Export', '/project/version/confidence_report/export.html'))
                                .up()
                            .segment('resources', getSegmentParams('Version_Resources', '/project/version/resources.html', false, false, ['projectKey', 'versionName']))
                            .up()
                        .up()
                .when('/users', 'users')
                    .segment('users', getSegmentParams('Users', '/users.html', true))
                    .within('users')
                        .segment('list', getSegmentParams('Users', '/list.html', false, true))
                    .up()
                .when('/config', 'config')
                .when('/config/:projectKey', 'config.project')
                    .segment('config', getSegmentParams('Config', '/config.html', true, false))
                    .within('config')
                        .segment('global', getSegmentParams('Config', '/config.html', false, true))
                        .segment('project', getSegmentParams('Config', '/config.html', false, false, ['projectKey']))
                    .up()
                .when('/login', 'login')
                    .segment('login', getSegmentParams('Login', '/login.html'))
            ;

            /**
             * Segment params factory function.
             */
            function getSegmentParams(controller, template, isSecure, isDefault, dependencies)
            {
                var params = {
                    controller: controller,
                    templateUrl: TEMPLATES_URL + template,
                    default: isDefault,
                    dependencies: dependencies
                };
                if (isSecure) {
                    params.resolve = {
                        auth: ['Auth', function(Auth) {
                            return Auth.check();
                        }]
                    };
                    params.resolveFailed = getSegmentParams('Login', '/login.html');
                }
                return params;
            }
        }]);

angular.module('agile.controllers', ['helper', 'api', 'agile.filters', 'agile.directives']);
angular.module('agile.filters', ['helper', 'ngSanitize']);
angular.module('agile.directives', ['helper', 'ngSanitize', 'agile.filters']);
angular.module('agile.services', ['helper']);