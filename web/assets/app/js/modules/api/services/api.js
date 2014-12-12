angular.module('api')
    .factory('Api', [
        'Projects', 'Project', 'ProjectsImport',
        'Users', 'User', 'UsersImport',
        'Issues', 'Issue', 'IssuesImport',
        'ConfidenceReports', 'ConfidenceReport',
        'ResourcesPlans', 'ResourcesPlan',
        'JiraProjects', 'JiraProject',
        'JiraIssues', 'JiraIssue', 'JiraIssueTypes',
        'JiraUsers', 'JiraUser',
        'ConfigsApi', 'ConfigApi',
        function(
            Projects, Project, ProjectsImport,
            Users, User, UsersImport,
            Issues, Issue, IssuesImport,
            ConfidenceReports, ConfidenceReport,
            ResourcesPlans, ResourcesPlan,
            JiraProjects, JiraProject,
            JiraIssues, JiraIssue, JiraIssueTypes,
            JiraUsers, JiraUser,
            ConfigsApi, ConfigApi
            ) {
            return {
                'Projects': Projects, 'Project': Project, 'ProjectsImport': ProjectsImport,
                'Users': Users, 'User': User, 'UsersImport': UsersImport,
                'Issues': Issues, 'Issue': Issue, 'IssuesImport': IssuesImport,
                'ConfidenceReports': ConfidenceReports, 'ConfidenceReport': ConfidenceReport,
                'ResourcesPlans': ResourcesPlans, 'ResourcesPlan': ResourcesPlan,
                'JiraProjects': JiraProjects, 'JiraProject': JiraProject,
                'JiraIssues': JiraIssues, 'JiraIssue': JiraIssue, 'JiraIssueTypes': JiraIssueTypes,
                'JiraUsers': JiraUsers, 'JiraUser': JiraUser,
                'Configs': ConfigsApi, 'Config': ConfigApi,
                get: function (resourceName) {
                    return this[resourceName];
                }
            };
        }
    ]);