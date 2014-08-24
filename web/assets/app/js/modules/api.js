angular.module('api', ['ngResource', 'LocalStorageModule'])
    .constant('API_URL', '/api')
    .factory('Api', [
        'Projects', 'Project',
        'JiraProjects', 'JiraProject',
        function(
            Projects, Project,
            JiraProjects, JiraProject
            ) {
            return {
                'Projects': Projects,
                'Project': Project,
                'JiraProjects': JiraProjects,
                'JiraProject': JiraProject
            };
        }
    ]);