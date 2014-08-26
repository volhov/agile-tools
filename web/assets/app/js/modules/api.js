angular.module('api', ['ngResource', 'LocalStorageModule'])
    .constant('API_URL', '/api')
    .factory('Api', [
        'Projects', 'Project', 'ProjectImport',
        'JiraProjects', 'JiraProject',
        function(
            Projects, Project, ProjectImport,
            JiraProjects, JiraProject
            ) {
            return {
                'Projects': Projects,
                'Project': Project,
                'ProjectImport': ProjectImport,
                'JiraProjects': JiraProjects,
                'JiraProject': JiraProject
            };
        }
    ]);