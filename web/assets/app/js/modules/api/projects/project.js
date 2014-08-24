angular.module('api')
    .factory('Project',  ['Factory', function(Factory) {
        return Factory.item('projects/:id', {id: '@id'});
    }]);