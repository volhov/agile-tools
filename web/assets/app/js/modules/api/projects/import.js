angular.module('api')
    .factory('ProjectImport',  ['Factory', function(Factory) {
        return Factory.collection('projects/import');
    }]);