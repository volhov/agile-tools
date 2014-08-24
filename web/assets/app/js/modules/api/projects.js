angular.module('api')
    .factory('Projects', ['Factory', function(Factory) {
        return Factory.collection('projects');
    }]);