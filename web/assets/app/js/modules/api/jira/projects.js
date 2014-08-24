angular.module('api')
    .factory('JiraProjects', ['Factory', function(Factory) {
        return Factory.collection('jira/projects');
    }]);