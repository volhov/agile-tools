angular.module('api')

    .factory('ConfigsApi',  ['Factory', function(Factory) {
        return Factory.collection('configs', {id: '@id'});
    }])
    .factory('ConfigApi',  ['Factory', function(Factory) {
        return Factory.item('configs/:id', {id: '@id'});
    }])

    .factory('ConfidenceReports', ['Factory', function(Factory) {
        return Factory.collection('confidence_reports');
    }])
    .factory('ConfidenceReport',  ['Factory', function(Factory) {
        return Factory.item('confidence_reports/:id', {id: '@id'});
    }])

    .factory('ResourcesPlans', ['Factory', function(Factory) {
        return Factory.collection('resources_plans');
    }])
    .factory('ResourcesPlan',  ['Factory', function(Factory) {
        return Factory.item('resources_plans/:id', {id: '@id'});
    }])

    .factory('Issues', ['Factory', function(Factory) {
        return Factory.collection('issues');
    }])
    .factory('Issue',  ['Factory', function(Factory) {
        return Factory.item('issues/:id', {id: '@id'});
    }])
    .factory('IssuesImport',  ['Factory', function(Factory) {
        return Factory.collection('issues/import');
    }])

    .factory('Projects', ['Factory', function(Factory) {
        return Factory.collection('projects');
    }])
    .factory('Project',  ['Factory', function(Factory) {
        return Factory.item('projects/:id', {id: '@id'});
    }])
    .factory('ProjectsImport',  ['Factory', function(Factory) {
        return Factory.collection('projects/import');
    }])

    .factory('Users', ['Factory', function(Factory) {
        return Factory.collection('users');
    }])
    .factory('User',  ['Factory', function(Factory) {
        return Factory.item('users/:id', {id: '@id'});
    }])
    .factory('UsersImport',  ['Factory', function(Factory) {
        return Factory.collection('users/import');
    }])

    .factory('JiraIssueTypes', ['Factory', function(Factory) {
        return Factory.collection('jira/issue_types');
    }])
    .factory('JiraIssues', ['Factory', function(Factory) {
        return Factory.collection('jira/issues');
    }])
    .factory('JiraIssue',  ['Factory', function(Factory) {
        return Factory.item('jira/issues/:id', {id: '@id'});
    }])

    .factory('JiraProjects', ['Factory', function(Factory) {
        return Factory.collection('jira/projects');
    }])
    .factory('JiraProject',  ['Factory', function(Factory) {
        return Factory.item('jira/projects/:id', {id: '@id'});
    }])

    .factory('JiraUsers', ['Factory', function(Factory) {
        return Factory.collection('jira/users');
    }])
    .factory('JiraUser',  ['Factory', function(Factory) {
        return Factory.item('jira/users/:id', {id: '@id'});
    }])
;