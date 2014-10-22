angular.module('agile.controllers')
    .controller('Project', ['$scope', '$location', '$routeParams', 'Api', 'Helper',
        function($scope, $location, $routeParams, Api, Helper) {

            $scope.moment = moment; // This is to use moment.js easily in templates.

            loadProject().then(function() {
                Helper.setTitle($scope.project.name);
            });

            $scope.loadProject = loadProject;

            $scope.saveProject = function()
            {
                return Api.get('Project')
                    .put($scope.project._id, $scope.project)
                    .then(function(response) {
                        Helper.setAlert('success', response.message);
                    });
            };

            function loadProject()
            {
                return Api.get('Project').get($routeParams.projectKey)
                    .then(function(project) {
                        $scope.project = project;
                    });
            }
        }]);