angular.module('api')
    .factory('JiraProject',  ['Factory', function(Factory) {
        return Factory.item('jira/projects/:id', {id: '@id'});
    }]);