angular.module('api', ['ngResource', 'LocalStorageModule'])
    .constant('API_URL', '/api')
    .factory('Api', [
        'Projects', 'Project', 'ProjectsImport',
        'Users', 'User', 'UsersImport',
        'Issues', 'Issue', 'IssuesImport',
        'ConfidenceReports', 'ConfidenceReport',
        'JiraProjects', 'JiraProject',
        'JiraIssues', 'JiraIssue', 'JiraIssueTypes',
        'JiraUsers', 'JiraUser',
        'Config',
        function(
            Projects, Project, ProjectsImport,
            Users, User, UsersImport,
            Issues, Issue, IssuesImport,
            ConfidenceReports, ConfidenceReport,
            JiraProjects, JiraProject,
            JiraIssues, JiraIssue, JiraIssueTypes,
            JiraUsers, JiraUser,
            Config
            ) {
            return {
                'Projects': Projects, 'Project': Project, 'ProjectsImport': ProjectsImport,
                'Users': Users, 'User': User, 'UsersImport': UsersImport,
                'Issues': Issues, 'Issue': Issue, 'IssuesImport': IssuesImport,
                'ConfidenceReports': ConfidenceReports, 'ConfidenceReport': ConfidenceReport,
                'JiraProjects': JiraProjects, 'JiraProject': JiraProject,
                'JiraIssues': JiraIssues, 'JiraIssue': JiraIssue, 'JiraIssueTypes': JiraIssueTypes,
                'JiraUsers': JiraUsers, 'JiraUser': JiraUser,
                'Config': Config,
                get: function (resourceName) {
                    return this[resourceName];
                }
            };
        }
    ]);